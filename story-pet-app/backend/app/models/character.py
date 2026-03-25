from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    base_profile = Column(Text, default="")
    speech_style = Column(Text, default="")
    core_values = Column(Text, default="")
