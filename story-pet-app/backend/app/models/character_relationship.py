from sqlalchemy import Column, Integer, Text, ForeignKey, UniqueConstraint
from app.core.database import Base

class CharacterRelationship(Base):
    __tablename__ = "character_relationships"
    __table_args__ = (
        UniqueConstraint(
            "story_node_id",
            "source_character_id",
            "target_character_id",
            name="uq_story_source_target_relation",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    story_node_id = Column(
        Integer,
        ForeignKey("story_nodes.id", ondelete="CASCADE"),
        nullable=False
    )
    source_character_id = Column(
        Integer,
        ForeignKey("characters.id", ondelete="CASCADE"),
        nullable=False
    )
    target_character_id = Column(
        Integer,
        ForeignKey("characters.id", ondelete="CASCADE"),
        nullable=False
    )

    relation_type = Column(Text, default="")
    relation_value = Column(Integer, default=0)
    description = Column(Text, default="")