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
    event_description: str = "",
    year: int | None = None,
    is_root: bool = False,
):
    parent_node = None

    if parent_node_id is not None:
        parent_node = get_node_by_id(db, parent_node_id)
        if not parent_node:
            raise ValueError("父节点不存在")

        if parent_node.worldline_id != worldline_id:
            raise ValueError("父节点不属于当前世界线")

        if parent_node.year is not None and year is not None and year < parent_node.year:
            raise ValueError("节点年份不能小于父节点年份")

    if is_root:
        existed_root = (
            db.query(StoryNode)
            .filter(
                StoryNode.worldline_id == worldline_id,
                StoryNode.is_root == True,
            )
            .first()
        )
        if existed_root:
            raise ValueError("该世界线已经存在根节点")
        parent_node_id = None
        event_description = "初始状态"

    node = StoryNode(
        worldline_id=worldline_id,
        parent_node_id=parent_node_id,
        title=title,
        summary=summary,
        event_description=event_description or ("初始状态" if is_root else ""),
        year=year,
        is_root=is_root,
    )

    db.add(node)
    db.commit()
    db.refresh(node)
    return node

def update_node(db: Session, node_id: int, **update_data):
    node = get_node_by_id(db, node_id)
    if not node:
        return None

    next_worldline_id = update_data.get("worldline_id", node.worldline_id)
    next_parent_node_id = update_data.get("parent_node_id", node.parent_node_id)
    next_year = update_data.get("year", node.year)

    if next_parent_node_id == node.id:
        raise ValueError("节点不能把自己设为父节点")

    if node.is_root and next_parent_node_id is not None:
        raise ValueError("根节点不能设置父节点")

    parent_node = None
    if next_parent_node_id is not None:
        parent_node = get_node_by_id(db, next_parent_node_id)
        if not parent_node:
            raise ValueError("父节点不存在")

        if parent_node.worldline_id != next_worldline_id:
            raise ValueError("父节点不属于当前世界线")

        parent_chain = get_node_ancestry_chain(db, next_parent_node_id)
        if parent_chain and any(ancestor.id == node.id for ancestor in parent_chain):
            raise ValueError("不能把子孙节点设为父节点，这会形成循环")

        if parent_node.year is not None and next_year is not None and next_year < parent_node.year:
            raise ValueError("节点年份不能小于父节点年份")

    if "parent_node_id" in update_data:
        node.parent_node_id = next_parent_node_id

    if "worldline_id" in update_data and update_data["worldline_id"] is not None:
        node.worldline_id = update_data["worldline_id"]

    if "title" in update_data and update_data["title"] is not None:
        node.title = update_data["title"]

    if "summary" in update_data and update_data["summary"] is not None:
        node.summary = update_data["summary"]

    if node.is_root:
        node.event_description = "初始状态"
    elif "event_description" in update_data and update_data["event_description"] is not None:
        node.event_description = update_data["event_description"]

    if "year" in update_data:
        node.year = update_data["year"]

    db.commit()
    db.refresh(node)
    return node

def delete_node(db: Session, node_id: int):
    node = get_node_by_id(db, node_id)
    if not node:
        return None

    if node.is_root:
        raise ValueError("根节点不能删除")

    child_node = (
        db.query(StoryNode)
        .filter(StoryNode.parent_node_id == node_id)
        .first()
    )
    if child_node:
        raise ValueError("该节点还有子节点指向它，不能删除")

    state = (
        db.query(CharacterState)
        .filter(CharacterState.story_node_id == node_id)
        .first()
    )
    if state:
        raise ValueError("该节点仍被角色状态引用，不能删除")

    try:
        db.query(CharacterRelationship).filter(
            CharacterRelationship.story_node_id == node_id
        ).delete(synchronize_session=False)

        db.delete(node)
        db.commit()
        return node

    except Exception:
        db.rollback()
        raise