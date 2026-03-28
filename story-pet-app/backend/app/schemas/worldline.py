from pydantic import BaseModel

class WorldlineOut(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        from_attributes = True

class WorldlineCreate(WorldlineBase):
    pass

class WorldlineUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    
class WorldlineBase(BaseModel):
    name: str
    description: str = ""