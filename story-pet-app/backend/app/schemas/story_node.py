from pydantic import BaseModel

class StoryNodeBase(BaseModel):
    worldline_id: int
    parent_node_id: int | None = None
    title: str
    summary: str = ""
    event_description: str = ""
    year: int | None = None
    is_root: bool = False

class StoryNodeCreate(StoryNodeBase):
    pass

class StoryNodeUpdate(BaseModel):
    worldline_id: int | None = None
    parent_node_id: int | None = None
    title: str | None = None
    summary: str | None = None
    event_description: str | None = None
    year: int | None = None

class StoryNodeRead(StoryNodeBase):
    id: int

    class Config:
        from_attributes = True