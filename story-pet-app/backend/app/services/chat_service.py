import os
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session

from app.models.session import ConversationSession
from app.models.message import Message
from app.models.character_state import CharacterState
from app.models.character import Character
from app.models.story_node import StoryNode
from app.models.worldline import Worldline
from app.services.prompt_service import build_character_system_prompt

# 加载 .env
load_dotenv()

# 默认模型
MODEL_NAME = os.getenv("OPENAI_MODEL", "deepseek-chat")


def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL")
    model_name = os.getenv("OPENAI_MODEL")

    print("DEBUG OPENAI_API_KEY =", api_key)
    print("DEBUG OPENAI_BASE_URL =", base_url)
    print("DEBUG OPENAI_MODEL =", model_name)

    if not api_key:
        raise ValueError("OPENAI_API_KEY 未配置")

    if base_url:
        return OpenAI(api_key=api_key, base_url=base_url)

    return OpenAI(api_key=api_key)


def chat_with_character(db: Session, session_id: int, user_message: str):
    # 查会话
    session_obj = (
        db.query(ConversationSession)
        .filter(ConversationSession.id == session_id)
        .first()
    )
    if not session_obj:
        raise ValueError("session 不存在")

    # 查角色状态
    state = (
        db.query(CharacterState)
        .filter(CharacterState.id == session_obj.character_state_id)
        .first()
    )
    if not state:
        raise ValueError("character_state 不存在")

    # 查角色
    character = (
        db.query(Character)
        .filter(Character.id == state.character_id)
        .first()
    )
    if not character:
        raise ValueError("character 不存在")

    # 查剧情节点
    story_node = (
        db.query(StoryNode)
        .filter(StoryNode.id == state.story_node_id)
        .first()
    )
    if not story_node:
        raise ValueError("story_node 不存在")

    # 取历史消息
    history = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.id.asc())
        .all()
    )

    # 查世界线
    worldline = (
        db.query(Worldline)
        .filter(Worldline.id == story_node.worldline_id)
        .first()
    )
    if not worldline:
        raise ValueError("worldline 不存在")

    # 组 system prompt
    system_prompt = build_character_system_prompt(
        db=db,
        character=character,
        state=state,
        story_node=story_node,
        worldline=worldline,
        user_role=session_obj.user_role if session_obj else "",
    )

    print("\n========== SYSTEM PROMPT START ==========")
    print(system_prompt)
    print("========== SYSTEM PROMPT END ==========\n")

    # 创建发给模型的消息列表
    messages = [{"role": "system", "content": system_prompt}]

    # 加入历史消息
    for msg in history:
        if msg.role in ["user", "assistant", "system"]:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

    # 加入当前用户输入
    messages.append({"role": "user", "content": user_message})

    try:
        client = get_openai_client()

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.8,
        )

        reply = response.choices[0].message.content or ""

    except Exception as e:
        print("[chat_service] chat request failed:", repr(e))
        raise ValueError(f"聊天模型调用失败：{str(e)}")

    # 保存本次用户消息
    db.add(Message(
        session_id=session_id,
        role="user",
        content=user_message
    ))

    # 保存 AI 回复
    db.add(Message(
        session_id=session_id,
        role="assistant",
        content=reply
    ))

    db.commit()

    return reply