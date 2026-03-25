from app.core.database import SessionLocal, engine, Base
from app.models.character import Character
from app.models.worldline import Worldline
from app.models.story_node import StoryNode
from app.models.character_state import CharacterState

def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if not db.query(Character).first():
        char = Character(
            name="尼克斯",
            base_profile="一个身处灾厄时代的角色。",
            speech_style="克制、冷淡、带一点刺。",
            core_values="真相、保护、执念"
        )
        db.add(char)
        db.commit()
        db.refresh(char)

        wl = Worldline(
            name="主线",
            description="正史世界线"
        )
        db.add(wl)
        db.commit()
        db.refresh(wl)

        node = StoryNode(
            worldline_id=wl.id,
            parent_node_id=None,
            title="瘟疫爆发后",
            summary="她失去了重要之人。",
            event_description="角色命运出现重大转折。"
        )
        db.add(node)
        db.commit()
        db.refresh(node)

        state = CharacterState(
            character_id=char.id,
            story_node_id=node.id,
            mental_state="压抑、警惕",
            current_goal="查明真相"
        )
        db.add(state)
        db.commit()

    db.close()
    print("seed done")

if __name__ == "__main__":
    run()
