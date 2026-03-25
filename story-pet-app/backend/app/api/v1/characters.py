from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.character_repo import list_characters

router = APIRouter(prefix="/characters", tags=["characters"])

@router.get("/")
def get_characters(db: Session = Depends(get_db)):
    return list_characters(db)
