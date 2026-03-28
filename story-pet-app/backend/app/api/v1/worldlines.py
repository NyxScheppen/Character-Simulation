from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.worldline_repo import (
    list_worldlines,
    get_worldline_by_id,
    create_worldline,
    update_worldline,
    delete_worldline,
)
from app.schemas.worldline import WorldlineCreate, WorldlineUpdate

router = APIRouter(prefix="/worldlines", tags=["worldlines"])

@router.get("/")
def get_worldlines(db: Session = Depends(get_db)):
    return list_worldlines(db)

@router.get("/{worldline_id}")
def get_worldline(worldline_id: int, db: Session = Depends(get_db)):
    worldline = get_worldline_by_id(db, worldline_id)
    if not worldline:
        raise HTTPException(status_code=404, detail="worldline 不存在")
    return worldline

@router.post("/")
def post_worldline(payload: WorldlineCreate, db: Session = Depends(get_db)):
    return create_worldline(db, payload.name, payload.description)

@router.put("/{worldline_id}")
def put_worldline(worldline_id: int, payload: WorldlineUpdate, db: Session = Depends(get_db)):
    worldline = update_worldline(db, worldline_id, payload.name, payload.description)
    if not worldline:
        raise HTTPException(status_code=404, detail="worldline 不存在")
    return worldline

@router.delete("/{worldline_id}")
def remove_worldline(worldline_id: int, db: Session = Depends(get_db)):
    worldline = delete_worldline(db, worldline_id)
    if not worldline:
        raise HTTPException(status_code=404, detail="worldline 不存在")
    return {"message": "worldline 删除成功"}