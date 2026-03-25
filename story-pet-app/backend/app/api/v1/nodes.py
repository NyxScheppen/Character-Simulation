from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.node_repo import list_nodes

router = APIRouter(prefix="/nodes", tags=["nodes"])

@router.get("/")
def get_nodes(db: Session = Depends(get_db)):
    return list_nodes(db)
