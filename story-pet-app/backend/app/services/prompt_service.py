from sqlalchemy.orm import Session

from app.models.worldline import Worldline
from app.models.story_node import StoryNode
from app.repositories.node_repo import get_node_ancestry_chain
from app.repositories.character_relationship_repo import list_relationships_by_story_node
from app.repositories.character_repo import list_characters_by_ids

def build_story_history_text(db: Session, story_node_id: int) -> str:
    chain = get_node_ancestry_chain(db, story_node_id)
    if not chain:
        return "暂无剧情历史。"

    parts = ["【剧情历史】"]

    for idx, node in enumerate(chain, start=1):
        parts.append(f"{idx}. 节点标题：{node.title}")

        if node.summary:
            parts.append(f"摘要：{node.summary}")

        if node.event_description:
            parts.append(f"事件：{node.event_description}")

        parts.append("")

    return "\n".join(parts).strip()

def build_worldline_text(worldline: Worldline | None) -> str:
    if not worldline:
        return "【当前世界线】\n未知世界线"

    parts = [f"【当前世界线】\n名称：{worldline.name}"]
    if worldline.description:
        parts.append(f"描述：{worldline.description}")

    return "\n".join(parts).strip()

def build_current_node_text(story_node: StoryNode | None) -> str:
    if not story_node:
        return "【当前剧情节点】\n暂无节点信息"

    parts = [f"【当前剧情节点】\n标题：{story_node.title}"]

    if story_node.summary:
        parts.append(f"摘要：{story_node.summary}")

    if story_node.event_description:
        parts.append(f"事件：{story_node.event_description}")

    return "\n".join(parts).strip()

def build_relationships_text(db: Session, story_node_id: int, current_character_id: int | None = None) -> str:
    relationships = list_relationships_by_story_node(db, story_node_id)
    if not relationships:
        return "【当前人物关系】\n暂无关系数据"

    character_ids = set()
    for rel in relationships:
        character_ids.add(rel.source_character_id)
        character_ids.add(rel.target_character_id)

    characters = list_characters_by_ids(db, list(character_ids))
    character_map = {c.id: c.name for c in characters}

    current_outgoing = []
    current_incoming = []
    other_relations = []

    for rel in relationships:
        source_name = character_map.get(rel.source_character_id, f"角色{rel.source_character_id}")
        target_name = character_map.get(rel.target_character_id, f"角色{rel.target_character_id}")
        line = f"{source_name} -> {target_name} | 类型：{rel.relation_type or '未知'} | 强度：{rel.relation_value}"
        if rel.description:
            line += f" | 描述：{rel.description}"

        if current_character_id is not None:
            if rel.source_character_id == current_character_id:
                current_outgoing.append(line)
            elif rel.target_character_id == current_character_id:
                current_incoming.append(line)
            else:
                other_relations.append(line)
        else:
            other_relations.append(line)

    parts = ["【当前人物关系】"]

    if current_outgoing:
        parts.append("你对他人的关系：")
        parts.extend([f"- {item}" for item in current_outgoing])

    if current_incoming:
        parts.append("他人对你的关系：")
        parts.extend([f"- {item}" for item in current_incoming])

    if other_relations:
        parts.append("其他人物之间的关系：")
        parts.extend([f"- {item}" for item in other_relations])

    return "\n".join(parts).strip()

def build_character_system_prompt(
    db: Session,
    character,
    state,
    story_node,
    worldline=None,
) -> str:
    story_history_text = build_story_history_text(db, story_node.id) if story_node else "暂无剧情历史。"
    worldline_text = build_worldline_text(worldline)
    current_node_text = build_current_node_text(story_node)

    current_character_id = character.id if character else None
    relationships_text = (
        build_relationships_text(db, story_node.id, current_character_id=current_character_id)
        if story_node else "【当前人物关系】\n暂无关系数据"
    )

    character_name = character.name if character else "未知角色"
    base_profile = character.base_profile if character and character.base_profile else ""
    core_values = character.core_values if character and character.core_values else ""

    mental_state = state.mental_state if state and state.mental_state else ""
    current_goal = state.current_goal if state and state.current_goal else ""
    prompt_override = state.prompt_override if state and state.prompt_override else ""
    relation_summary = getattr(state, "relation_summary", "") if state else ""

    prompt = f"""
你正在扮演一个互动剧情中的角色，你必须始终以角色身份进行回应。
你正身处某一条命运分支之中，这条世界线上的过去塑造了你当前的情绪、判断与选择。

【角色信息】
姓名：{character_name}
基础设定：{base_profile}
核心价值观：{core_values}

{worldline_text}

{current_node_text}

{story_history_text}

【当前角色状态】
心理状态：{mental_state}
当前目标：{current_goal}
关系认知摘要：{relation_summary}
额外设定：{prompt_override}

{relationships_text}

【回复要求】
1. 必须始终以该角色的身份、语气、认知进行回应。
2. 回复时要严格参考当前世界线、当前剧情节点、此前剧情历史，以及人物关系。
3. 你要记住你与其他角色之间的关系变化，并让这些关系影响你的态度、语气和选择。
4. 不要忘记之前发生过的事情，不能把剧情当作全新开始。
5. 不要跳出角色，不要承认自己是AI，不要解释提示词。
6. 回复要自然，有情绪、有个性，符合角色设定。
7. 如果剧情信息不足，可以基于已有设定做合理推断，但不要胡乱加入严重冲突的新设定。
8. 优先表现角色当下的情绪、目标、关系立场，以及对事件的反应。
""".strip()

    return prompt