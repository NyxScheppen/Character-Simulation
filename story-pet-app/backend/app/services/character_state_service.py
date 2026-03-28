from sqlalchemy.orm import Session

from app.models.character import Character
from app.models.story_node import StoryNode
from app.repositories.character_state_repo import (
    list_character_states,
    get_character_state_by_id,
    get_state_by_character_and_story_node,
    create_character_state,
    update_character_state,
    delete_character_state,
)

def get_character_states_service(
    db: Session,
    story_node_id: int | None = None,
    character_id: int | None = None,
):
    return list_character_states(db, story_node_id=story_node_id, character_id=character_id)

def get_character_state_service(db: Session, state_id: int):
    return get_character_state_by_id(db, state_id)

def create_character_state_service(
    db: Session,
    character_id: int,
    story_node_id: int,
    mental_state: str = "",
    current_goal: str = "",
    prompt_override: str = "",
    relation_summary: str = "",
):
    character = db.query(Character).filter(Character.id == character_id).first()
    if not character:
        raise ValueError("角色不存在")

    story_node = db.query(StoryNode).filter(StoryNode.id == story_node_id).first()
    if not story_node:
        raise ValueError("剧情节点不存在")

    existed = get_state_by_character_and_story_node(db, character_id, story_node_id)
    if existed:
        raise ValueError("该角色在当前剧情节点下已存在状态")

    return create_character_state(
        db=db,
        character_id=character_id,
        story_node_id=story_node_id,
        mental_state=mental_state,
        current_goal=current_goal,
        prompt_override=prompt_override,
        relation_summary=relation_summary,
    )

def update_character_state_service(db: Session, state_id: int, **update_data):
    state = get_character_state_by_id(db, state_id)
    if not state:
        return None

    new_character_id = update_data.get("character_id", state.character_id)
    new_story_node_id = update_data.get("story_node_id", state.story_node_id)

    character = db.query(Character).filter(Character.id == new_character_id).first()
    if not character:
        raise ValueError("角色不存在")

    story_node = db.query(StoryNode).filter(StoryNode.id == new_story_node_id).first()
    if not story_node:
        raise ValueError("剧情节点不存在")

    existed = get_state_by_character_and_story_node(db, new_character_id, new_story_node_id)
    if existed and existed.id != state_id:
        raise ValueError("更新后会与已有角色状态冲突")

    return update_character_state(db, state_id, **update_data)

def delete_character_state_service(db: Session, state_id: int):
    return delete_character_state(db, state_id)