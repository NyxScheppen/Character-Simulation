from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class Worldline(Base):
    __tablename__ = "worldlines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, default="")
