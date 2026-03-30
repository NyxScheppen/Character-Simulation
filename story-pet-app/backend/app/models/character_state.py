from sqlalchemy import Column, Integer, Text, String, ForeignKey, UniqueConstraint
from app.core.database import Base

class CharacterState(Base):
    __tablename__ = "character_states"
    __table_args__ = (
        UniqueConstraint("character_id", "story_node_id", name="uq_character_story_node"),
    )

    id = Column(Integer, primary_key=True, index=True)
    character_id = Column(
        Integer,
        ForeignKey("characters.id", ondelete="CASCADE"),
        nullable=False
    )
    story_node_id = Column(
        Integer,
        ForeignKey("story_nodes.id", ondelete="CASCADE"),
        nullable=False
    )

    profession = Column(String(100), default="")
    age = Column(Integer, nullable=True)
    location = Column(String(200), default="")

    mental_state = Column(Text, default="")
    current_goal = Column(Text, default="")
    prompt_override = Column(Text, default="")
    relation_summary = Column(Text, default="")