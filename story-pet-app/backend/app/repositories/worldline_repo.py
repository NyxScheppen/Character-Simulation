from sqlalchemy.orm import Session
from app.models.worldline import Worldline

def list_worldlines(db: Session):
    return db.query(Worldline).all()

def get_worldline_by_id(db: Session, worldline_id: int):
    return db.query(Worldline).filter(Worldline.id == worldline_id).first()

def create_worldline(db: Session, name: str, description: str = ""):
    worldline = Worldline(name=name, description=description)
    db.add(worldline)
    db.commit()
    db.refresh(worldline)
    return worldline

def update_worldline(db: Session, worldline_id: int, name: str | None = None, description: str | None = None):
    worldline = get_worldline_by_id(db, worldline_id)
    if not worldline:
        return None

    if name is not None:
        worldline.name = name
    if description is not None:
        worldline.description = description

    db.commit()
    db.refresh(worldline)
    return worldline

def delete_worldline(db: Session, worldline_id: int):
    worldline = get_worldline_by_id(db, worldline_id)
    if not worldline:
        return None

    db.delete(worldline)
    db.commit()
    return worldline