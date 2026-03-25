from sqlalchemy import Column, Integer, Text, ForeignKey
from app.core.database import Base

class CharacterState(Base):
    __tablename__ = "character_states"

    id = Column(Integer, primary_key=True, index=True)
    character_id = Column(Integer, ForeignKey("characters.id"), nullable=False)
    story_node_id = Column(Integer, ForeignKey("story_nodes.id"), nullable=False)
    mental_state = Column(Text, default="")
    current_goal = Column(Text, default="")
    known_facts_json = Column(Text, default="[]")
    unknown_facts_json = Column(Text, default="[]")
    prompt_override = Column(Text, default="")
