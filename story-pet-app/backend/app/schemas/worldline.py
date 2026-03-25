from pydantic import BaseModel

class WorldlineOut(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        from_attributes = True
