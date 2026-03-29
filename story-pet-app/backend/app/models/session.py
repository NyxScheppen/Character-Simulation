from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class ConversationSession(Base):
    __tablename__ = "conversation_sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), default="New Session")
    character_state_id = Column(
        Integer,
        ForeignKey("character_states.id", ondelete="CASCADE"),
        nullable=False
    )