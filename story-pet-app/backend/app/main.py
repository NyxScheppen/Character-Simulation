from pathlib import Path
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# 强制加载 backend/.env
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

print("DEBUG ENV PATH =", env_path)
print("DEBUG ENV EXISTS =", env_path.exists())

from app.core.config import settings
from app.core.database import Base, engine
from app.api.router import api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

# 处理跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:1420"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

def get_base_path():
    # PyInstaller 打包后使用临时解压目录
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)
    # 开发环境：backend 目录
    return Path(__file__).resolve().parents[1]

BASE_DIR = get_base_path()
FRONTEND_DIST = BASE_DIR / "frontend_dist"
ASSETS_DIR = FRONTEND_DIST / "assets"

# 挂载前端静态资源
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

@app.get("/health")
def health():
    return {"status": "ok"}

# 根路径返回前端页面
@app.get("/")
def serve_index():
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "frontend_dist/index.html not found"}

# SPA 路由兜底
@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    # 不处理 API 路由
    if full_path.startswith("api/"):
        return {"message": "API route not found"}

    # 不处理 health
    if full_path == "health":
        return {"status": "ok"}

    target_file = FRONTEND_DIST / full_path
    if target_file.exists() and target_file.is_file():
        return FileResponse(str(target_file))

    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))

    return {"message": "frontend_dist/index.html not found"}