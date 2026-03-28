from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.node_repo import (
    list_nodes,
    get_node_by_id,
    create_node,
    update_node,
    delete_node,
)
from app.schemas.story_node import StoryNodeCreate, StoryNodeUpdate

router = APIRouter(prefix="/nodes", tags=["nodes"])

@router.get("/")
def get_nodes(worldline_id: int | None = Query(None), db: Session = Depends(get_db)):
    return list_nodes(db, worldline_id)

@router.get("/{node_id}")
def get_node(node_id: int, db: Session = Depends(get_db)):
    node = get_node_by_id(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="节点不存在")
    return node

@router.post("/")
def post_node(payload: StoryNodeCreate, db: Session = Depends(get_db)):
    try:
        return create_node(
            db=db,
            worldline_id=payload.worldline_id,
            parent_node_id=payload.parent_node_id,
            title=payload.title,
            summary=payload.summary,
            event_description=payload.event_description,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{node_id}")
def put_node(node_id: int, payload: StoryNodeUpdate, db: Session = Depends(get_db)):
    try:
        node = update_node(
            db=db,
            node_id=node_id,
            worldline_id=payload.worldline_id,
            parent_node_id=payload.parent_node_id,
            title=payload.title,
            summary=payload.summary,
            event_description=payload.event_description,
        )
        if not node:
            raise HTTPException(status_code=404, detail="节点不存在")
        return node
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{node_id}")
def remove_node(node_id: int, db: Session = Depends(get_db)):
    try:
        node = delete_node(db, node_id)
        if not node:
            raise HTTPException(status_code=404, detail="节点不存在")
        return {"message": "节点删除成功"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))