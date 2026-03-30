from pydantic import BaseModel

class WorldlineBase(BaseModel):
    name: str
    description: str = ""

class WorldlineCreate(WorldlineBase):
    root_title: str = "起始状态"
    root_summary: str = "世界线起始状态"
    root_event_description: str = ""
    root_year: int | None = None

class WorldlineUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class WorldlineRead(WorldlineBase):
    id: int

    class Config:
        from_attributes = True