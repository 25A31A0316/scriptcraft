from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    title: str
    logline: Optional[str] = None
    format_profile: str = "feature"

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    logline: Optional[str] = None
    format_profile: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    title: str
    logline: Optional[str] = None
    format_profile: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
