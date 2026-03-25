from sqlalchemy.orm import Session
from app.models.worldline import Worldline

def list_worldlines(db: Session):
    return db.query(Worldline).all()
