from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.schemas.branch import BranchWorldlineRequest
from app.services.worldline_branch_service import branch_worldline_from_node
from app.services.relationship_graph_service import get_relationship_graph_by_node
from app.schemas.relationship_graph import RelationshipGraphResponse

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
            year=payload.year,
            is_root=payload.is_root,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{node_id}")
def put_node(node_id: int, payload: StoryNodeUpdate, db: Session = Depends(get_db)):
    try:
        update_data = payload.model_dump(exclude_unset=True)
        node = update_node(db, node_id, **update_data)

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

@router.post("/{node_id}/branch")
def branch_node(node_id: int, payload: BranchWorldlineRequest, db: Session = Depends(get_db)):
    try:
        return branch_worldline_from_node(
            db=db,
            source_node_id=node_id,
            new_worldline_name=payload.new_worldline_name,
            new_worldline_description=payload.new_worldline_description,
            new_node_title=payload.new_node_title,
            new_node_summary=payload.new_node_summary,
            new_node_event_description=payload.new_node_event_description,
            new_node_year=payload.new_node_year,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"世界线分叉失败: {str(e)}")

@router.get("/{node_id}/relationship-graph", response_model=RelationshipGraphResponse)
def get_node_relationship_graph(node_id: int, db: Session = Depends(get_db)):
    try:
        return get_relationship_graph_by_node(db, node_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))