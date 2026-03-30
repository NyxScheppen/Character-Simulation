from pydantic import BaseModel
import os

class Settings(BaseModel):
    app_name: str = os.getenv("APP_NAME", "Story Pet Backend")
    app_env: str = os.getenv("APP_ENV", "dev")
    database_url: str = os.getenv("DATABASE_URL", "")
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

settings = Settings()
