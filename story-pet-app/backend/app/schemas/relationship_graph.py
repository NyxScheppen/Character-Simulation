from pydantic import BaseModel
from app.schemas.character import CharacterOut
from app.schemas.character_relationship import CharacterRelationshipOut

class StoryNodeGraphInfo(BaseModel):
    id: int
    worldline_id: int
    parent_node_id: int | None = None
    title: str
    summary: str = ""
    event_description: str = ""
    year: int | None = None

class RelationshipGraphResponse(BaseModel):
    story_node: StoryNodeGraphInfo
    characters: list[CharacterOut]
    relationships: list[CharacterRelationshipOut]

class WorldlineGraphInfo(BaseModel):
    id: int
    name: str
    description: str = ""

class WorldlineRelationshipGraphResponse(BaseModel):
    worldline: WorldlineGraphInfo
    characters: list[CharacterOut]
    relationships: list[CharacterRelationshipOut]