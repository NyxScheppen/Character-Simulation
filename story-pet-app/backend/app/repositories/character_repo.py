from sqlalchemy.orm import Session
from app.models.character import Character

def list_characters(db: Session):
    return db.query(Character).all()
