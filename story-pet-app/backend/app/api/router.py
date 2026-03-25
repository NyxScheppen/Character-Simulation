from fastapi import APIRouter
from app.api.v1 import characters, worldlines, nodes, sessions, chat

api_router = APIRouter()
api_router.include_router(characters.router)
api_router.include_router(worldlines.router)
api_router.include_router(nodes.router)
api_router.include_router(sessions.router)
api_router.include_router(chat.router)
