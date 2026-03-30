from sqlalchemy.orm import Session
from app.models.session import ConversationSession
from app.models.message import Message

def list_sessions(
    db: Session,
    character_state_id: int | None = None,
):
    query = db.query(ConversationSession)

    if character_state_id is not None:
        query = query.filter(
            ConversationSession.character_state_id == character_state_id
        )

    return query.order_by(ConversationSession.id.desc()).all()

def get_session_by_id(db: Session, session_id: int):
    return (
        db.query(ConversationSession)
        .filter(ConversationSession.id == session_id)
        .first()
    )

def create_session(
    db: Session,
    character_state_id: int,
    title: str,
    user_role: str = "",
):
    session = ConversationSession(
        character_state_id=character_state_id,
        title=title,
        user_role=user_role or "",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def delete_session_service(db: Session, session_id: int):
    session = get_session_by_id(db, session_id)
    if not session:
        return None

    try:
        db.query(Message).filter(
            Message.session_id == session_id
        ).delete(synchronize_session=False)

        db.delete(session)
        db.commit()
        return session

    except Exception:
        db.rollback()
        raise