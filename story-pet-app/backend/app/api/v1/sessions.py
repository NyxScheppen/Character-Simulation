from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.session_repo import create_session, list_sessions, delete_session_service
from app.schemas.session import SessionCreate, SessionRead, SessionOut
from app.repositories.message_repo import list_messages_by_session

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.get("/", response_model=list[SessionRead])
def api_list_sessions(
    character_state_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_sessions(
        db=db,
        character_state_id=character_state_id,
    )

@router.post("/", response_model=SessionOut)
def post_session(payload: SessionCreate, db: Session = Depends(get_db)):
    return create_session(
        db=db,
        character_state_id=payload.character_state_id,
        title=payload.title,
        user_role=payload.user_role,
    )

@router.get("/{session_id}/messages")
def get_session_messages(session_id: int, db: Session = Depends(get_db)):
    return list_messages_by_session(db, session_id)

@router.delete("/{session_id}")
def delete_session_api(session_id: int, db: Session = Depends(get_db)):
    session = delete_session_service(db, session_id)
    return {"message": "会话删除成功"}