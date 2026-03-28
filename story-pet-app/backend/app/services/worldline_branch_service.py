from sqlalchemy.orm import Session

from app.models.worldline import Worldline
from app.models.story_node import StoryNode
from app.models.character_state import CharacterState
from app.models.character_relationship import CharacterRelationship

from app.repositories.node_repo import get_node_by_id, get_node_ancestry_chain
from app.repositories.character_state_repo import (
    list_states_by_story_node_ids,
    list_states_by_story_node,
)
from app.repositories.character_relationship_repo import (
    list_relationships_by_story_node_ids,
    list_relationships_by_story_node,
)

def branch_worldline_from_node(
    db: Session,
    source_node_id: int,
    new_worldline_name: str,
    new_worldline_description: str,
    new_node_title: str,
    new_node_summary: str = "",
    new_node_event_description: str = "",
):
    if not new_worldline_name or not new_worldline_name.strip():
        raise ValueError("新世界线名称不能为空")

    if not new_node_title or not new_node_title.strip():
        raise ValueError("新节点标题不能为空")

    source_node = get_node_by_id(db, source_node_id)
    if not source_node:
        raise ValueError("源节点不存在")

    chain = get_node_ancestry_chain(db, source_node_id)
    if not chain:
        raise ValueError("无法获取节点祖先链")

    try:
        # 1. 创建新世界线
        new_worldline = Worldline(
            name=new_worldline_name.strip(),
            description=(new_worldline_description or "").strip(),
        )
        db.add(new_worldline)
        db.flush()

        # 2. 复制祖先节点链
        old_to_new_node_map = {}
        copied_nodes = []
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
            db.flush()

            old_to_new_node_map[old_node.id] = copied_node.id
            copied_nodes.append(copied_node)
            prev_new_node_id = copied_node.id

        # 3. 创建 branch 节点
        branch_node = StoryNode(
            worldline_id=new_worldline.id,
            parent_node_id=prev_new_node_id,
            title=new_node_title.strip(),
            summary=(new_node_summary or "").strip(),
            event_description=(new_node_event_description or "").strip(),
        )
        db.add(branch_node)
        db.flush()

        # 4. 复制祖先链上的 CharacterState
        chain_node_ids = [node.id for node in chain]
        source_states = list_states_by_story_node_ids(db, chain_node_ids)

        copied_states = []
        old_to_new_state_map = {}

        for old_state in source_states:
            new_story_node_id = old_to_new_node_map.get(old_state.story_node_id)
            if not new_story_node_id:
                continue

            copied_state = CharacterState(
                character_id=old_state.character_id,
                story_node_id=new_story_node_id,
                mental_state=old_state.mental_state,
                current_goal=old_state.current_goal,
                prompt_override=getattr(old_state, "prompt_override", ""),
                relation_summary=getattr(old_state, "relation_summary", ""),
            )
            db.add(copied_state)
            db.flush()

            old_to_new_state_map[old_state.id] = copied_state.id
            copied_states.append(copied_state)

        # 5. 给 branch 节点复制 source node 的 CharacterState
        source_node_states = list_states_by_story_node(db, source_node_id)
        branch_node_states = []

        for old_state in source_node_states:
            branched_state = CharacterState(
                character_id=old_state.character_id,
                story_node_id=branch_node.id,
                mental_state=old_state.mental_state,
                current_goal=old_state.current_goal,
                prompt_override=getattr(old_state, "prompt_override", ""),
                relation_summary=getattr(old_state, "relation_summary", ""),
            )
            db.add(branched_state)
            db.flush()

            branch_node_states.append(branched_state)

        # 6. 复制祖先链上的 CharacterRelationship
        source_relationships = list_relationships_by_story_node_ids(db, chain_node_ids)

        copied_relationships = []
        old_to_new_relationship_map = {}

        for old_rel in source_relationships:
            new_story_node_id = old_to_new_node_map.get(old_rel.story_node_id)
            if not new_story_node_id:
                continue

            copied_rel = CharacterRelationship(
                story_node_id=new_story_node_id,
                source_character_id=old_rel.source_character_id,
                target_character_id=old_rel.target_character_id,
                relation_type=old_rel.relation_type,
                relation_value=old_rel.relation_value,
                description=old_rel.description,
            )
            db.add(copied_rel)
            db.flush()

            old_to_new_relationship_map[old_rel.id] = copied_rel.id
            copied_relationships.append(copied_rel)

        # 7. 给 branch 节点复制 source node 的关系
        source_node_relationships = list_relationships_by_story_node(db, source_node_id)
        branch_node_relationships = []

        for old_rel in source_node_relationships:
            branched_rel = CharacterRelationship(
                story_node_id=branch_node.id,
                source_character_id=old_rel.source_character_id,
                target_character_id=old_rel.target_character_id,
                relation_type=old_rel.relation_type,
                relation_value=old_rel.relation_value,
                description=old_rel.description,
            )
            db.add(branched_rel)
            db.flush()

            branch_node_relationships.append(branched_rel)

        db.commit()

        return {
            "worldline": {
                "id": new_worldline.id,
                "name": new_worldline.name,
                "description": new_worldline.description,
            },
            "source_node_id": source_node_id,
            "copied_chain": [
                {
                    "id": node.id,
                    "title": node.title,
                    "summary": node.summary,
                    "event_description": node.event_description,
                    "parent_node_id": node.parent_node_id,
                    "worldline_id": node.worldline_id,
                }
                for node in copied_nodes
            ],
            "branch_node": {
                "id": branch_node.id,
                "title": branch_node.title,
                "summary": branch_node.summary,
                "event_description": branch_node.event_description,
                "parent_node_id": branch_node.parent_node_id,
                "worldline_id": branch_node.worldline_id,
            },
            "copied_states": [
                {
                    "id": state.id,
                    "character_id": state.character_id,
                    "story_node_id": state.story_node_id,
                    "mental_state": state.mental_state,
                    "current_goal": state.current_goal,
                    "prompt_override": getattr(state, "prompt_override", ""),
                    "relation_summary": getattr(state, "relation_summary", ""),
                }
                for state in copied_states
            ],
            "branch_node_states": [
                {
                    "id": state.id,
                    "character_id": state.character_id,
                    "story_node_id": state.story_node_id,
                    "mental_state": state.mental_state,
                    "current_goal": state.current_goal,
                    "prompt_override": getattr(state, "prompt_override", ""),
                    "relation_summary": getattr(state, "relation_summary", ""),
                }
                for state in branch_node_states
            ],
            "copied_relationships": [
                {
                    "id": rel.id,
                    "story_node_id": rel.story_node_id,
                    "source_character_id": rel.source_character_id,
                    "target_character_id": rel.target_character_id,
                    "relation_type": rel.relation_type,
                    "relation_value": rel.relation_value,
                    "description": rel.description,
                }
                for rel in copied_relationships
            ],
            "branch_node_relationships": [
                {
                    "id": rel.id,
                    "story_node_id": rel.story_node_id,
                    "source_character_id": rel.source_character_id,
                    "target_character_id": rel.target_character_id,
                    "relation_type": rel.relation_type,
                    "relation_value": rel.relation_value,
                    "description": rel.description,
                }
                for rel in branch_node_relationships
            ],
            "old_to_new_node_map": old_to_new_node_map,
            "old_to_new_state_map": old_to_new_state_map,
            "old_to_new_relationship_map": old_to_new_relationship_map,
            "stats": {
                "copied_node_count": len(copied_nodes),
                "copied_state_count": len(copied_states),
                "branch_state_count": len(branch_node_states),
                "copied_relationship_count": len(copied_relationships),
                "branch_relationship_count": len(branch_node_relationships),
            },
        }

    except Exception:
        db.rollback()
        raise