from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.character_repo import (
    list_characters,
    get_character_by_id,
    create_character,
    update_character,
    delete_character,
)
from app.schemas.character import CharacterCreate, CharacterUpdate

router = APIRouter(prefix="/characters", tags=["characters"])

@router.get("/")
def get_characters(db: Session = Depends(get_db)):
    return list_characters(db)

@router.get("/{character_id}")
def get_character(character_id: int, db: Session = Depends(get_db)):
    character = get_character_by_id(db, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="character 不存在")
    return character

@router.post("/")
def post_character(payload: CharacterCreate, db: Session = Depends(get_db)):
    return create_character(db, payload.name, payload.base_profile, payload.core_values)

@router.put("/{character_id}")
def put_character(character_id: int, payload: CharacterUpdate, db: Session = Depends(get_db)):
    character = update_character(
        db,
        character_id,
        payload.name,
        payload.base_profile,
        payload.core_values
    )
    if not character:
        raise HTTPException(status_code=404, detail="character 不存在")
    return character

@router.delete("/{character_id}")
def remove_character(character_id: int, db: Session = Depends(get_db)):
    character = delete_character(db, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="character 不存在")
    return {"message": "character 删除成功"}