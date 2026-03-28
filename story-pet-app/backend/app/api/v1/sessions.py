from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.session_repo import create_session
from app.schemas.session import SessionCreate
from app.repositories.message_repo import list_messages_by_session

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("/")
def post_session(payload: SessionCreate, db: Session = Depends(get_db)):
    return create_session(db, payload.character_state_id, payload.title)

@router.get("/{session_id}/messages")
def get_session_messages(session_id: int, db: Session = Depends(get_db)):
    return list_messages_by_session(db, session_id)