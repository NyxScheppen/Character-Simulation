from sqlalchemy.orm import Session

from app.models.character import Character
from app.models.story_node import StoryNode
from app.repositories.character_relationship_repo import (
    list_relationships,
    get_relationship_by_id,
    get_relationship_by_unique_key,
    create_relationship,
    update_relationship,
    delete_relationship,
)

def _validate_relation_value(relation_value: int):
    if relation_value < -100 or relation_value > 100:
        raise ValueError("relation_value 必须在 -100 到 100 之间")

def get_relationships_service(
    db: Session,
    story_node_id: int | None = None,
    source_character_id: int | None = None,
    target_character_id: int | None = None,
):
    return list_relationships(
        db,
        story_node_id=story_node_id,
        source_character_id=source_character_id,
        target_character_id=target_character_id,
    )

def get_relationship_service(db: Session, relationship_id: int):
    return get_relationship_by_id(db, relationship_id)

def create_relationship_service(
    db: Session,
    story_node_id: int,
    source_character_id: int,
    target_character_id: int,
    relation_type: str = "",
    relation_value: int = 0,
    description: str = "",
):
    if source_character_id == target_character_id:
        raise ValueError("source_character_id 和 target_character_id 不能相同")

    _validate_relation_value(relation_value)

    story_node = db.query(StoryNode).filter(StoryNode.id == story_node_id).first()
    if not story_node:
        raise ValueError("剧情节点不存在")

    source_character = db.query(Character).filter(Character.id == source_character_id).first()
    if not source_character:
        raise ValueError("源角色不存在")

    target_character = db.query(Character).filter(Character.id == target_character_id).first()
    if not target_character:
        raise ValueError("目标角色不存在")

    existed = get_relationship_by_unique_key(
        db,
        story_node_id=story_node_id,
        source_character_id=source_character_id,
        target_character_id=target_character_id,
    )
    if existed:
        raise ValueError("该剧情节点下这条角色关系已存在")

    return create_relationship(
        db=db,
        story_node_id=story_node_id,
        source_character_id=source_character_id,
        target_character_id=target_character_id,
        relation_type=relation_type,
        relation_value=relation_value,
        description=description,
    )

def update_relationship_service(db: Session, relationship_id: int, **update_data):
    relationship = get_relationship_by_id(db, relationship_id)
    if not relationship:
        return None

    new_story_node_id = update_data.get("story_node_id", relationship.story_node_id)
    new_source_character_id = update_data.get("source_character_id", relationship.source_character_id)
    new_target_character_id = update_data.get("target_character_id", relationship.target_character_id)
    new_relation_value = update_data.get("relation_value", relationship.relation_value)

    if new_source_character_id == new_target_character_id:
        raise ValueError("source_character_id 和 target_character_id 不能相同")

    _validate_relation_value(new_relation_value)

    story_node = db.query(StoryNode).filter(StoryNode.id == new_story_node_id).first()
    if not story_node:
        raise ValueError("剧情节点不存在")

    source_character = db.query(Character).filter(Character.id == new_source_character_id).first()
    if not source_character:
        raise ValueError("源角色不存在")

    target_character = db.query(Character).filter(Character.id == new_target_character_id).first()
    if not target_character:
        raise ValueError("目标角色不存在")

    existed = get_relationship_by_unique_key(
        db,
        story_node_id=new_story_node_id,
        source_character_id=new_source_character_id,
        target_character_id=new_target_character_id,
    )
    if existed and existed.id != relationship_id:
        raise ValueError("更新后会与已有角色关系冲突")

    return update_relationship(db, relationship_id, **update_data)

def delete_relationship_service(db: Session, relationship_id: int):
    return delete_relationship(db, relationship_id)