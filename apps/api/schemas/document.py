from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class DocumentCreate(BaseModel):
    project_id: str
    title: str
    format: str = "feature"
    language: str = "en-US"
    initial_content: Optional[dict[str, Any]] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    format: Optional[str] = None
    language: Optional[str] = None

class SnapshotCreate(BaseModel):
    content_json: str  # Serialized canonical JSON

class SnapshotResponse(BaseModel):
    id: str
    document_id: str
    version: int
    content_json: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    project_id: str
    title: str
    format: str
    language: str
    current_version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
