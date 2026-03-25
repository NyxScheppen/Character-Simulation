from pydantic import BaseModel

class CharacterStateOut(BaseModel):
    id: int
    character_id: int
    story_node_id: int
    mental_state: str
    current_goal: str

    class Config:
        from_attributes = True
