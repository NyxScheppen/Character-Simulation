from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.character_state import (
    CharacterStateCreate,
    CharacterStateUpdate,
)
from app.services.character_state_service import (
    get_character_states_service,
    get_character_state_service,
    create_character_state_service,
    update_character_state_service,
    delete_character_state_service,
)

router = APIRouter(prefix="/character-states", tags=["character-states"])

@router.get("/")
def list_character_states_api(
    story_node_id: int | None = Query(None),
    character_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    return get_character_states_service(
        db,
        story_node_id=story_node_id,
        character_id=character_id,
    )

@router.get("/{state_id}")
def get_character_state_api(state_id: int, db: Session = Depends(get_db)):
    state = get_character_state_service(db, state_id)
    if not state:
        raise HTTPException(status_code=404, detail="角色状态不存在")
    return state

@router.post("/")
def create_character_state_api(payload: CharacterStateCreate, db: Session = Depends(get_db)):
    try:
        return create_character_state_service(
            db=db,
            character_id=payload.character_id,
            story_node_id=payload.story_node_id,
            mental_state=payload.mental_state,
            current_goal=payload.current_goal,
            prompt_override=payload.prompt_override,
            relation_summary=payload.relation_summary,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{state_id}")
def update_character_state_api(
    state_id: int,
    payload: CharacterStateUpdate,
    db: Session = Depends(get_db),
):
    try:
        update_data = payload.model_dump(exclude_unset=True)
        state = update_character_state_service(db, state_id, **update_data)
        if not state:
            raise HTTPException(status_code=404, detail="角色状态不存在")
        return state
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{state_id}")
def delete_character_state_api(state_id: int, db: Session = Depends(get_db)):
    state = delete_character_state_service(db, state_id)
    if not state:
        raise HTTPException(status_code=404, detail="角色状态不存在")
    return {"message": "角色状态删除成功"}