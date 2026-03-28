from sqlalchemy.orm import Session
from app.models.story_node import StoryNode
from app.models.character_state import CharacterState

def list_nodes(db: Session, worldline_id: int | None = None):
    query = db.query(StoryNode)

    if worldline_id is not None:
        query = query.filter(StoryNode.worldline_id == worldline_id)

    return query.all()

def get_node_by_id(db: Session, node_id: int):
    return db.query(StoryNode).filter(StoryNode.id == node_id).first()

def create_node(
    db: Session,
    worldline_id: int,
    parent_node_id: int | None,
    title: str,
    summary: str = "",
    event_description: str = ""
):
    # 如果指定了 parent_node_id，先检查父节点是否存在
    if parent_node_id is not None:
        parent_node = get_node_by_id(db, parent_node_id)
        if not parent_node:
            raise ValueError("父节点不存在")

    node = StoryNode(
        worldline_id=worldline_id,
        parent_node_id=parent_node_id,
        title=title,
        summary=summary,
        event_description=event_description
    )
    db.add(node)
    db.commit()
    db.refresh(node)
    return node

def update_node(
    db: Session,
    node_id: int,
    worldline_id: int | None = None,
    parent_node_id: int | None = None,
    title: str | None = None,
    summary: str | None = None,
    event_description: str | None = None
):
    node = get_node_by_id(db, node_id)
    if not node:
        return None

    # 如果要修改 parent_node_id，要检查父节点是否存在
    if parent_node_id is not None:
        if parent_node_id == node.id:
            raise ValueError("节点不能把自己设为父节点")

        parent_node = get_node_by_id(db, parent_node_id)
        if not parent_node:
            raise ValueError("父节点不存在")

    if worldline_id is not None:
        node.worldline_id = worldline_id
    if title is not None:
        node.title = title
    if summary is not None:
        node.summary = summary
    if event_description is not None:
        node.event_description = event_description

    if parent_node_id is not None:
        node.parent_node_id = parent_node_id

    db.commit()
    db.refresh(node)
    return node

def delete_node(db: Session, node_id: int):
    node = get_node_by_id(db, node_id)
    if not node:
        return None

    # 1. 如果还有子节点指向它，就不能删
    child_node = db.query(StoryNode).filter(StoryNode.parent_node_id == node_id).first()
    if child_node:
        raise ValueError("该节点还有子节点指向它，不能删除")

    # 2. 如果还有角色状态引用它，也不能删
    state = db.query(CharacterState).filter(CharacterState.story_node_id == node_id).first()
    if state:
        raise ValueError("该节点仍被角色状态引用，不能删除")

    db.delete(node)
    db.commit()
    return node