from sqlalchemy import Boolean, Column, Integer, String, Text, ForeignKey
from app.core.database import Base

class StoryNode(Base):
    __tablename__ = "story_nodes"

    id = Column(Integer, primary_key=True, index=True)
    worldline_id = Column(
        Integer,
        ForeignKey("worldlines.id", ondelete="CASCADE"),
        nullable=False
    )
    parent_node_id = Column(
        Integer,
        ForeignKey("story_nodes.id", ondelete="SET NULL"),
        nullable=True
    )

    title = Column(String(200), nullable=False)
    summary = Column(Text, default="")
    event_description = Column(Text, default="")
    year = Column(Integer, nullable=True)

    is_root = Column(Boolean, default=False, nullable=False)