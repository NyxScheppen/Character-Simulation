import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# backend/
BASE_DIR = Path(__file__).resolve().parents[2]
DB_DIR = BASE_DIR / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)

default_db_path = DB_DIR / "story_pet.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{default_db_path}")

# 如果 env 里是 sqlite:///./data/story_pet.db 这种相对路径，强制转成绝对路径
if DATABASE_URL.startswith("sqlite:///./"):
    relative_path = DATABASE_URL.replace("sqlite:///./", "")
    abs_path = BASE_DIR / relative_path
    abs_path.parent.mkdir(parents=True, exist_ok=True)
    DATABASE_URL = f"sqlite:///{abs_path}"

print("DEBUG BASE_DIR =", BASE_DIR)
print("DEBUG DB_DIR =", DB_DIR)
print("DEBUG DATABASE_URL =", DATABASE_URL)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()