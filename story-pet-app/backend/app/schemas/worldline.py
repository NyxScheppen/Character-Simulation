from pydantic import BaseModel

class WorldlineBase(BaseModel):
    name: str
    description: str = ""

class WorldlineCreate(WorldlineBase):
    pass

class WorldlineUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class WorldlineOut(WorldlineBase):
    id: int

    class Config:
        from_attributes = True