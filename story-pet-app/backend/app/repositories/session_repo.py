from sqlalchemy.orm import Session
from app.models.session import ConversationSession

def create_session(db: Session, character_state_id: int, title: str):
    session = ConversationSession(character_state_id=character_state_id, title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
