from sqlalchemy.orm import Session
from app.models.session import ConversationSession

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

def create_session(db: Session, character_state_id: int, title: str):
    session = ConversationSession(
        character_state_id=character_state_id,
        title=title,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
