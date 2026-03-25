from sqlalchemy.orm import Session
from app.models.story_node import StoryNode

def list_nodes(db: Session):
    return db.query(StoryNode).all()
