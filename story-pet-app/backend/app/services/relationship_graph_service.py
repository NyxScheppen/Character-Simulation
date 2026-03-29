from sqlalchemy.orm import Session

from app.models.story_node import StoryNode
from app.repositories.character_relationship_repo import list_relationships_by_story_node
from app.repositories.character_repo import list_characters_by_ids

def get_relationship_graph_by_node(db: Session, story_node_id: int):
    story_node = db.query(StoryNode).filter(StoryNode.id == story_node_id).first()
    if not story_node:
        raise ValueError("剧情节点不存在")

    relationships = list_relationships_by_story_node(db, story_node_id)

    character_ids = set()
    for rel in relationships:
        character_ids.add(rel.source_character_id)
        character_ids.add(rel.target_character_id)

    characters = list_characters_by_ids(db, list(character_ids))

    return {
        "story_node": {
            "id": story_node.id,
            "worldline_id": story_node.worldline_id,
            "parent_node_id": story_node.parent_node_id,
            "title": story_node.title,
            "summary": story_node.summary,
            "event_description": story_node.event_description,
        },
        "characters": [
            {
                "id": c.id,
                "name": c.name,
                "base_profile": c.base_profile,
                "core_values": c.core_values,
            }
            for c in characters
        ],
        "relationships": [
            {
                "id": rel.id,
                "story_node_id": rel.story_node_id,
                "source_character_id": rel.source_character_id,
                "target_character_id": rel.target_character_id,
                "relation_type": rel.relation_type,
                "relation_value": rel.relation_value,
                "description": rel.description,
            }
            for rel in relationships
        ],
    }