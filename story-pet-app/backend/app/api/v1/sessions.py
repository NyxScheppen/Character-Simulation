from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.session_repo import create_session
from app.schemas.session import SessionCreate

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("/")
def post_session(payload: SessionCreate, db: Session = Depends(get_db)):
    return create_session(db, payload.character_state_id, payload.title)
