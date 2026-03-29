from fastapi import APIRouter

from app.api.v1 import characters
from app.api.v1 import worldlines
from app.api.v1 import nodes
from app.api.v1 import character_state
from app.api.v1 import sessions
from app.api.v1 import chat
from app.api.v1 import character_relationship

api_router = APIRouter()

api_router.include_router(characters.router)
api_router.include_router(worldlines.router)
api_router.include_router(nodes.router)
api_router.include_router(character_state.router)
api_router.include_router(sessions.router)
api_router.include_router(chat.router)
api_router.include_router(character_relationship.router)