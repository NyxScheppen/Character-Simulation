from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.chat import ChatRequest
from app.services.chat_service import chat_with_character

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/")
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    reply = chat_with_character(db, payload.session_id, payload.message)
    return {"reply": reply}
