from sqlalchemy.orm import Session
from app.models.character_relationship import CharacterRelationship
from sqlalchemy import or_

def list_relationships(
    db: Session,
    story_node_id: int | None = None,
    source_character_id: int | None = None,
    target_character_id: int | None = None,
):
    query = db.query(CharacterRelationship)

    if story_node_id is not None:
        query = query.filter(CharacterRelationship.story_node_id == story_node_id)

    if source_character_id is not None:
        query = query.filter(CharacterRelationship.source_character_id == source_character_id)

    if target_character_id is not None:
        query = query.filter(CharacterRelationship.target_character_id == target_character_id)

    return query.order_by(CharacterRelationship.id.asc()).all()

def get_relationship_by_id(db: Session, relationship_id: int):
    return (
        db.query(CharacterRelationship)
        .filter(CharacterRelationship.id == relationship_id)
        .first()
    )

def get_relationship_by_unique_key(
    db: Session,
    story_node_id: int,
    source_character_id: int,
    target_character_id: int,
):
    return (
        db.query(CharacterRelationship)
        .filter(
            CharacterRelationship.story_node_id == story_node_id,
            CharacterRelationship.source_character_id == source_character_id,
            CharacterRelationship.target_character_id == target_character_id,
        )
        .first()
    )

def list_relationships_by_story_node(db: Session, story_node_id: int):
    return (
        db.query(CharacterRelationship)
        .filter(CharacterRelationship.story_node_id == story_node_id)
        .order_by(CharacterRelationship.id.asc())
        .all()
    )

def list_relationships_by_story_node_ids(db: Session, story_node_ids: list[int]):
    if not story_node_ids:
        return []

    return (
        db.query(CharacterRelationship)
        .filter(CharacterRelationship.story_node_id.in_(story_node_ids))
        .order_by(CharacterRelationship.story_node_id.asc(), CharacterRelationship.id.asc())
        .all()
    )

def create_relationship(
    db: Session,
    story_node_id: int,
    source_character_id: int,
    target_character_id: int,
    relation_type: str = "",
    relation_value: int = 0,
    description: str = "",
):
    relationship = CharacterRelationship(
        story_node_id=story_node_id,
        source_character_id=source_character_id,
        target_character_id=target_character_id,
        relation_type=relation_type,
        relation_value=relation_value,
        description=description,
    )
    db.add(relationship)
    db.commit()
    db.refresh(relationship)
    return relationship

def update_relationship(db: Session, relationship_id: int, **update_data):
    relationship = get_relationship_by_id(db, relationship_id)
    if not relationship:
        return None

    for key, value in update_data.items():
        setattr(relationship, key, value)

    db.commit()
    db.refresh(relationship)
    return relationship

def delete_relationship(db: Session, relationship_id: int):
    relationship = get_relationship_by_id(db, relationship_id)
    if not relationship:
        return None

    db.delete(relationship)
    db.commit()
    return relationship

def list_relationships_by_character(
    db: Session,
    character_id: int,
    story_node_id: int | None = None,
):
    query = db.query(CharacterRelationship).filter(
        or_(
            CharacterRelationship.source_character_id == character_id,
            CharacterRelationship.target_character_id == character_id,
        )
    )

    if story_node_id is not None:
        query = query.filter(CharacterRelationship.story_node_id == story_node_id)

    return query.order_by(
        CharacterRelationship.story_node_id.asc(),
        CharacterRelationship.id.asc(),
    ).all()