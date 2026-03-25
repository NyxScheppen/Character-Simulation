from pydantic import BaseModel

class StoryNodeOut(BaseModel):
    id: int
    worldline_id: int
    parent_node_id: int | None = None
    title: str
    summary: str

    class Config:
        from_attributes = True
