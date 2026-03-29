from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.character_relationship import (
    CharacterRelationshipCreate,
    CharacterRelationshipUpdate,
)
from app.services.character_relationship_service import (
    get_relationships_service,
    get_relationship_service,
    get_relationships_by_character_service,
    create_relationship_service,
    update_relationship_service,
    delete_relationship_service,
)

router = APIRouter(prefix="/character-relationships", tags=["character-relationships"])

@router.get("/by-character/{character_id}")
def list_relationships_by_character_api(
    character_id: int,
    story_node_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    return get_relationships_by_character_service(
        db=db,
        character_id=character_id,
        story_node_id=story_node_id,
    )

@router.get("/")
def list_relationships_api(
    story_node_id: int | None = Query(None),
    source_character_id: int | None = Query(None),
    target_character_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    return get_relationships_service(
        db,
        story_node_id=story_node_id,
        source_character_id=source_character_id,
        target_character_id=target_character_id,
    )

@router.get("/{relationship_id}")
def get_relationship_api(relationship_id: int, db: Session = Depends(get_db)):
    relationship = get_relationship_service(db, relationship_id)
    if not relationship:
        raise HTTPException(status_code=404, detail="角色关系不存在")
    return relationship

@router.post("/")
def create_relationship_api(payload: CharacterRelationshipCreate, db: Session = Depends(get_db)):
    try:
        return create_relationship_service(
            db=db,
            story_node_id=payload.story_node_id,
            source_character_id=payload.source_character_id,
            target_character_id=payload.target_character_id,
            relation_type=payload.relation_type,
            relation_value=payload.relation_value,
            description=payload.description,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{relationship_id}")
def update_relationship_api(
    relationship_id: int,
    payload: CharacterRelationshipUpdate,
    db: Session = Depends(get_db),
):
    try:
        update_data = payload.model_dump(exclude_unset=True)
        relationship = update_relationship_service(db, relationship_id, **update_data)
        if not relationship:
            raise HTTPException(status_code=404, detail="角色关系不存在")
        return relationship
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{relationship_id}")
def delete_relationship_api(relationship_id: int, db: Session = Depends(get_db)):
    relationship = delete_relationship_service(db, relationship_id)
    if not relationship:
        raise HTTPException(status_code=404, detail="角色关系不存在")
    return {"message": "角色关系删除成功"}