from pydantic import BaseModel

class SessionRead(BaseModel):
    id: int
    title: str
    character_state_id: int

    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    character_state_id: int
    title: str = "New Session"

class SessionOut(BaseModel):
    id: int
    title: str
    character_state_id: int

    class Config:
        from_attributes = True
