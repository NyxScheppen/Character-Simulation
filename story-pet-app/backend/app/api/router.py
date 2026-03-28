from fastapi import APIRouter
from app.api.v1 import (
    characters,
    character_states,
    character_relationships,
    worldlines,
    nodes,
    sessions,
    chat,
)

api_router = APIRouter()
api_router.include_router(characters.router)
api_router.include_router(character_states.router)
api_router.include_router(character_relationships.router)
api_router.include_router(worldlines.router)
api_router.include_router(nodes.router)
api_router.include_router(sessions.router)
api_router.include_router(chat.router)