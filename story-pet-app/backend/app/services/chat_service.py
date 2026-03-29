import os
from openai import OpenAI
from sqlalchemy.orm import Session

from app.models.session import ConversationSession
from app.models.message import Message
from app.models.character_state import CharacterState
from app.models.character import Character
from app.models.story_node import StoryNode
from app.models.worldline import Worldline
from app.services.prompt_service import build_character_system_prompt
from app.services.prompt_service import build_story_history_text

# 创建 OpenAI 客户端
def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY 未配置")
    return OpenAI(api_key=api_key)
# 尝试从环境变量里读取模型名，如果没读到，就默认用 "gpt-4o-mini"
MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

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
    story_history_text = build_story_history_text(db, story_node.id)

    system_prompt = build_character_system_prompt(
        character=character,
        state=state,
        story_node=story_node,
        worldline=worldline,
        story_history_text=story_history_text,
    )
    # 创建发给 OpenAI 的 messages列表
    messages = [{"role": "system", "content": system_prompt}]
    # 把数据库里历史消息分条加到 messages 列表里。
    for msg in history:
        # 只允许合法角色通过
        if msg.role in ["user", "assistant", "system"]:
            # 向列表末尾再加一条消息
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

    # 把本次用户输入加进去
    messages.append({"role": "user", "content": user_message})

    # 调 OpenAI
    client = get_openai_client()
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.8,
    )
    
    # 从 OpenAI 返回结果里取出真正的回答内容
    reply = response.choices[0].message.content or ""

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