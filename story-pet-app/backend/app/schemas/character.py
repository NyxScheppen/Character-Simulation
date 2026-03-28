from pydantic import BaseModel

class CharacterBase(BaseModel):
    name: str
    base_profile: str = ""
    core_values: str = ""

class CharacterCreate(CharacterBase):
    pass

class CharacterUpdate(BaseModel):
    name: str | None = None
    base_profile: str | None = None
    core_values: str | None = None

class CharacterOut(CharacterBase):
    id: int

    class Config:
        from_attributes = True