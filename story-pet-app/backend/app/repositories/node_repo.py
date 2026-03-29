from sqlalchemy.orm import Session
from app.models.story_node import StoryNode
from app.models.character_state import CharacterState
from app.models.character_relationship import CharacterRelationship

def list_nodes(db: Session, worldline_id: int | None = None):
    query = db.query(StoryNode)

    if worldline_id is not None:
        query = query.filter(StoryNode.worldline_id == worldline_id)

    return query.order_by(StoryNode.id.asc()).all()

def get_node_by_id(db: Session, node_id: int):
    return db.query(StoryNode).filter(StoryNode.id == node_id).first()

def get_node_children(db: Session, node_id: int):
    return (
        db.query(StoryNode)
        .filter(StoryNode.parent_node_id == node_id)
        .order_by(StoryNode.id.asc())
        .all()
    )

def get_node_ancestry_chain(db: Session, node_id: int):
    current = get_node_by_id(db, node_id)
    if not current:
        return None

    chain = []

    while current:
        chain.append(current)

        if current.parent_node_id is None:
            break

        current = get_node_by_id(db, current.parent_node_id)

    chain.reverse()
    return chain

def create_node(
    db: Session,
    worldline_id: int,
    parent_node_id: int | None,
    title: str,
    summary: str = "",
    event_description: str = ""
):
    # 如果指定了父节点，检查父节点是否存在
    if parent_node_id is not None:
        parent_node = get_node_by_id(db, parent_node_id)
        if not parent_node:
            raise ValueError("父节点不存在")

    node = StoryNode(
        worldline_id=worldline_id,
        parent_node_id=parent_node_id,
        title=title,
        summary=summary,
        event_description=event_description,
    )

    db.add(node)
    db.commit()
    db.refresh(node)
    return node

def update_node(
    db: Session,
    node_id: int,
    **update_data
):
    node = get_node_by_id(db, node_id)
    if not node:
        return None

    if "parent_node_id" in update_data:
        parent_node_id = update_data["parent_node_id"]

        if parent_node_id == node.id:
            raise ValueError("节点不能把自己设为父节点")

        if parent_node_id is not None:
            parent_node = get_node_by_id(db, parent_node_id)
            if not parent_node:
                raise ValueError("父节点不存在")

            # 可选保护：避免形成环
            parent_chain = get_node_ancestry_chain(db, parent_node_id)
            if parent_chain and any(ancestor.id == node.id for ancestor in parent_chain):
                raise ValueError("不能把子孙节点设为父节点，这会形成循环")

        node.parent_node_id = parent_node_id

    if "worldline_id" in update_data:
        node.worldline_id = update_data["worldline_id"]

    if "title" in update_data:
        node.title = update_data["title"]

    if "summary" in update_data:
        node.summary = update_data["summary"]

    if "event_description" in update_data:
        node.event_description = update_data["event_description"]

    db.commit()
    db.refresh(node)
    return node

def delete_node(db: Session, node_id: int):
    node = get_node_by_id(db, node_id)
    if not node:
        return None

    # 1. 有子节点指向它，不能删
    child_node = (
        db.query(StoryNode)
        .filter(StoryNode.parent_node_id == node_id)
        .first()
    )
    if child_node:
        raise ValueError("该节点还有子节点指向它，不能删除")

    # 2. 有角色状态引用它，不能删
    state = (
        db.query(CharacterState)
        .filter(CharacterState.story_node_id == node_id)
        .first()
    )
    if state:
        raise ValueError("该节点仍被角色状态引用，不能删除")

    try:
        # 3. 先删这个节点下的角色关系
        db.query(CharacterRelationship).filter(
            CharacterRelationship.story_node_id == node_id
        ).delete(synchronize_session=False)

        # 4. 再删节点
        db.delete(node)
        db.commit()
        return node

    except Exception:
        db.rollback()
        raise