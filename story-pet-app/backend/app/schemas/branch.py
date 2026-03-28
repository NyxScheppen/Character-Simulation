from pydantic import BaseModel

class BranchWorldlineRequest(BaseModel):
    new_worldline_name: str
    new_worldline_description: str = ""
    new_node_title: str
    new_node_summary: str = ""
    new_node_event_description: str = ""