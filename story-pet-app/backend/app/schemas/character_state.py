from pydantic import BaseModel

class CharacterStateBase(BaseModel):
    character_id: int
    story_node_id: int
    mental_state: str = ""
    current_goal: str = ""
    prompt_override: str = ""
    relation_summary: str = ""

class CharacterStateCreate(CharacterStateBase):
    pass

class CharacterStateUpdate(BaseModel):
    character_id: int | None = None
    story_node_id: int | None = None
    mental_state: str | None = None
    current_goal: str | None = None
    prompt_override: str | None = None
    relation_summary: str | None = None

class CharacterStateOut(CharacterStateBase):
    id: int

    class Config:
        from_attributes = True