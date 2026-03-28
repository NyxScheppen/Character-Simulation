from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.chat import ChatRequest
from app.services.chat_service import chat_with_character

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/")
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    try:
        reply = chat_with_character(db, payload.session_id, payload.message)
        return {"reply": reply}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"聊天失败: {str(e)}")