from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.worldline_repo import list_worldlines

router = APIRouter(prefix="/worldlines", tags=["worldlines"])

@router.get("/")
def get_worldlines(db: Session = Depends(get_db)):
    return list_worldlines(db)
