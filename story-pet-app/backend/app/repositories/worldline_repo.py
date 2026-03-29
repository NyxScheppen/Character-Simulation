from sqlalchemy.orm import Session

from app.models.worldline import Worldline
from app.models.story_node import StoryNode
from app.models.character_state import CharacterState
from app.models.character_relationship import CharacterRelationship
from app.models.session import ConversationSession as ChatSession
from app.models.message import Message

def list_worldlines(db: Session):
    return db.query(Worldline).all()

def get_worldline_by_id(db: Session, worldline_id: int):
    return db.query(Worldline).filter(Worldline.id == worldline_id).first()

def create_worldline(db: Session, name: str, description: str = ""):
    worldline = Worldline(name=name, description=description)
    db.add(worldline)
    db.commit()
    db.refresh(worldline)
    return worldline

def update_worldline(db: Session, worldline_id: int, name: str | None = None, description: str | None = None):
    worldline = get_worldline_by_id(db, worldline_id)
    if not worldline:
        return None

    if name is not None:
        worldline.name = name
    if description is not None:
        worldline.description = description

    db.commit()
    db.refresh(worldline)
    return worldline

def delete_worldline(db: Session, worldline_id: int):
    worldline = get_worldline_by_id(db, worldline_id)
    if not worldline:
        return None

    try:
        # 找到该世界线下所有剧情节点
        node_ids = [
            node_id
            for (node_id,) in db.query(StoryNode.id)
            .filter(StoryNode.worldline_id == worldline_id)
            .all()
        ]

        state_ids = []
        if node_ids:
            # 找到这些节点下的角色状态
            state_ids = [
                state_id
                for (state_id,) in db.query(CharacterState.id)
                .filter(CharacterState.story_node_id.in_(node_ids))
                .all()
            ]

            # 如果 session 依赖 state，就先删 message 再删 session
            if state_ids:
                session_ids = [
                    session_id
                    for (session_id,) in db.query(ChatSession.id)
                    .filter(ChatSession.character_state_id.in_(state_ids))
                    .all()
                ]

                if session_ids:
                    db.query(Message).filter(
                        Message.session_id.in_(session_ids)
                    ).delete(synchronize_session=False)

                    db.query(ChatSession).filter(
                        ChatSession.id.in_(session_ids)
                    ).delete(synchronize_session=False)

            # 删除角色关系
            db.query(CharacterRelationship).filter(
                CharacterRelationship.story_node_id.in_(node_ids)
            ).delete(synchronize_session=False)

            # 删除角色状态
            db.query(CharacterState).filter(
                CharacterState.story_node_id.in_(node_ids)
            ).delete(synchronize_session=False)

            # 删除剧情节点
            db.query(StoryNode).filter(
                StoryNode.worldline_id == worldline_id
            ).delete(synchronize_session=False)

        # 删除世界线
        db.delete(worldline)
        db.commit()
        return worldline

    except Exception:
        db.rollback()
        raise