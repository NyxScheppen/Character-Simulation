from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.character import Character
from app.models.character_state import CharacterState
from app.models.session import ConversationSession
from app.models.message import Message
from app.models.character_relationship import CharacterRelationship

def list_characters_by_ids(db: Session, character_ids: list[int]):
    if not character_ids:
        return []

    return (
        db.query(Character)
        .filter(Character.id.in_(character_ids))
        .order_by(Character.id.asc())
        .all()
    )

def list_characters(db: Session):
    return db.query(Character).all()

def get_character_by_id(db: Session, character_id: int):
    return db.query(Character).filter(Character.id == character_id).first()

def create_character(db: Session, name: str, base_profile: str = "", core_values: str = ""):
    character = Character(
        name=name,
        base_profile=base_profile,
        core_values=core_values
    )
    db.add(character)
    db.commit()
    db.refresh(character)
    return character

def update_character(
    db: Session,
    character_id: int,
    name: str | None = None,
    base_profile: str | None = None,
    core_values: str | None = None
):
    character = get_character_by_id(db, character_id)
    if not character:
        return None

    if name is not None:
        character.name = name
    if base_profile is not None:
        character.base_profile = base_profile
    if core_values is not None:
        character.core_values = core_values

    db.commit()
    db.refresh(character)
    return character

def delete_character(db: Session, character_id: int):
    character = db.query(Character).filter(Character.id == character_id).first()
    if not character:
        return None

    try:
        # 1. 先删这个角色参与的所有关系
        db.query(CharacterRelationship).filter(
            or_(
                CharacterRelationship.source_character_id == character_id,
                CharacterRelationship.target_character_id == character_id,
            )
        ).delete(synchronize_session=False)

        # 2. 查这个角色的所有 state
        states = db.query(CharacterState).filter(CharacterState.character_id == character_id).all()
        state_ids = [state.id for state in states]

        if state_ids:
            # 3. 查这些 state 的所有 session
            sessions = db.query(ConversationSession).filter(
                ConversationSession.character_state_id.in_(state_ids)
            ).all()
            session_ids = [s.id for s in sessions]

            if session_ids:
                # 4. 删这些 session 下的消息
                db.query(Message).filter(
                    Message.session_id.in_(session_ids)
                ).delete(synchronize_session=False)

                # 5. 删 session
                db.query(ConversationSession).filter(
                    ConversationSession.id.in_(session_ids)
                ).delete(synchronize_session=False)

            # 6. 删 state
            db.query(CharacterState).filter(
                CharacterState.id.in_(state_ids)
            ).delete(synchronize_session=False)

        # 7. 最后删角色
        db.delete(character)
        db.commit()
        return character

    except Exception:
        db.rollback()
        raise