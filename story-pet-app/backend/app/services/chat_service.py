from sqlalchemy.orm import Session
from app.repositories.message_repo import create_message

def chat_with_character(db: Session, session_id: int, user_message: str):
    create_message(db, session_id, "user", user_message)
    reply = f"【占位回复】你刚刚说的是：{user_message}"
    create_message(db, session_id, "assistant", reply)
    return reply
