from pydantic import BaseModel

class CharacterRelationshipBase(BaseModel):
    story_node_id: int
    source_character_id: int
    target_character_id: int
    relation_type: str = ""
    relation_value: int = 0
    description: str = ""

class CharacterRelationshipCreate(CharacterRelationshipBase):
    pass

class CharacterRelationshipUpdate(BaseModel):
    story_node_id: int | None = None
    source_character_id: int | None = None
    target_character_id: int | None = None
    relation_type: str | None = None
    relation_value: int | None = None
    description: str | None = None

class CharacterRelationshipOut(CharacterRelationshipBase):
    id: int

    class Config:
        from_attributes = True