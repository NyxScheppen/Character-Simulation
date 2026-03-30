import os
import sys
import shutil
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()

def resource_path(relative_path: str) -> str:
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

def get_user_data_dir() -> Path:
    data_dir = Path.home() / "StoryPetData"
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir

def ensure_db_file() -> Path:
    target_db = get_user_data_dir() / "story_pet.db"
    if not target_db.exists():
        seed_db = Path(resource_path("data/seed.db"))
        if not seed_db.exists():
            raise FileNotFoundError(f"找不到初始数据库文件: {seed_db}")
        shutil.copy(seed_db, target_db)
    return target_db

db_path = ensure_db_file()
DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()