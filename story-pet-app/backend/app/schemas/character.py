from pydantic import BaseModel

class CharacterOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
