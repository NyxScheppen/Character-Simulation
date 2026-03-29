from sqlalchemy.orm import Session
from app.models.character_state import CharacterState
from app.models.story_node import StoryNode

def list_character_states(
    db: Session,
    character_id: int | None = None,
    story_node_id: int | None = None,
    worldline_id: int | None = None,
):
    query = db.query(CharacterState)

    # 如果需要按世界线筛，就 join story_nodes
    if worldline_id is not None:
        query = query.join(
            StoryNode,
            CharacterState.story_node_id == StoryNode.id
        ).filter(
            StoryNode.worldline_id == worldline_id
        )

    if character_id is not None:
        query = query.filter(CharacterState.character_id == character_id)

    if story_node_id is not None:
        query = query.filter(CharacterState.story_node_id == story_node_id)

    return query.order_by(CharacterState.id.asc()).all()

def get_character_state_by_id(db: Session, state_id: int):
    return db.query(CharacterState).filter(CharacterState.id == state_id).first()

def get_state_by_character_and_story_node(db: Session, character_id: int, story_node_id: int):
    return (
        db.query(CharacterState)
        .filter(
            CharacterState.character_id == character_id,
            CharacterState.story_node_id == story_node_id,
        )
        .first()
    )

def list_states_by_story_node(db: Session, story_node_id: int):
    return (
        db.query(CharacterState)
        .filter(CharacterState.story_node_id == story_node_id)
        .order_by(CharacterState.id.asc())
        .all()
    )

def list_states_by_story_node_ids(db: Session, story_node_ids: list[int]):
    if not story_node_ids:
        return []

    return (
        db.query(CharacterState)
        .filter(CharacterState.story_node_id.in_(story_node_ids))
        .order_by(CharacterState.story_node_id.asc(), CharacterState.id.asc())
        .all()
    )

def create_character_state(
    db: Session,
    character_id: int,
    story_node_id: int,
    mental_state: str = "",
    current_goal: str = "",
    prompt_override: str = "",
    relation_summary: str = "",
):
    state = CharacterState(
        character_id=character_id,
        story_node_id=story_node_id,
        mental_state=mental_state,
        current_goal=current_goal,
        prompt_override=prompt_override,
        relation_summary=relation_summary,
    )
    db.add(state)
    db.commit()
    db.refresh(state)
    return state

def update_character_state(db: Session, state_id: int, **update_data):
    state = get_character_state_by_id(db, state_id)
    if not state:
        return None

    for key, value in update_data.items():
        setattr(state, key, value)

    db.commit()
    db.refresh(state)
    return state

def delete_character_state(db: Session, state_id: int):
    state = get_character_state_by_id(db, state_id)
    if not state:
        return None

    db.delete(state)
    db.commit()
    return state

def list_states_by_character(
    db: Session,
    character_id: int,
    story_node_id: int | None = None,
):
    query = db.query(CharacterState).filter(CharacterState.character_id == character_id)

    if story_node_id is not None:
        query = query.filter(CharacterState.story_node_id == story_node_id)

    return query.order_by(CharacterState.story_node_id.asc(), CharacterState.id.asc()).all()