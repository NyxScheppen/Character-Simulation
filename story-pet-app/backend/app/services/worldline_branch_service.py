from sqlalchemy.orm import Session
from app.models.worldline import Worldline
from app.models.story_node import StoryNode
from app.repositories.node_repo import get_node_by_id, get_node_ancestry_chain

def branch_worldline_from_node(
    db: Session,
    source_node_id: int,
    new_worldline_name: str,
    new_worldline_description: str,
    new_node_title: str,
    new_node_summary: str = "",
    new_node_event_description: str = "",
):
    # 1. 找原始节点
    source_node = get_node_by_id(db, source_node_id)
    if not source_node:
        raise ValueError("源节点不存在")

    # 2. 找祖先链
    chain = get_node_ancestry_chain(db, source_node_id)
    if not chain:
        raise ValueError("无法获取节点链")

    # 3. 创建新世界线
    new_worldline = Worldline(
        name=new_worldline_name,
        description=new_worldline_description
    )
    db.add(new_worldline)
    db.commit()
    db.refresh(new_worldline)

    # 4. 复制祖先链
    old_to_new = {}
    prev_new_node_id = None

    for old_node in chain:
        copied_node = StoryNode(
            worldline_id=new_worldline.id,
            parent_node_id=prev_new_node_id,
            title=old_node.title,
            summary=old_node.summary,
            event_description=old_node.event_description,
        )
        db.add(copied_node)
        db.commit()
        db.refresh(copied_node)

        old_to_new[old_node.id] = copied_node.id
        prev_new_node_id = copied_node.id

    # 5. 追加新的分叉节点
    branch_node = StoryNode(
        worldline_id=new_worldline.id,
        parent_node_id=prev_new_node_id,
        title=new_node_title,
        summary=new_node_summary,
        event_description=new_node_event_description,
    )
    db.add(branch_node)
    db.commit()
    db.refresh(branch_node)

    return {
        "worldline": new_worldline,
        "copied_from_node_id": source_node_id,
        "branch_node": branch_node,
        "copied_chain_count": len(chain),
    }