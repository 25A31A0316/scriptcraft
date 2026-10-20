import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    format = Column(String(50), default="feature", nullable=False)
    language = Column(String(20), default="en-US", nullable=False)
    current_version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="documents")
    snapshots = relationship("DocumentSnapshot", back_populates="document", cascade="all, delete-orphan", order_by="desc(DocumentSnapshot.version)")
    scenes = relationship("SceneMetadata", back_populates="document", cascade="all, delete-orphan", order_by="SceneMetadata.order_index")

class DocumentSnapshot(Base):
    __tablename__ = "document_snapshots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, nullable=False)
    content_json = Column(Text, nullable=False)  # Canonical ScreenplayDocument JSON
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    document = relationship("Document", back_populates="snapshots")

class SceneMetadata(Base):
    __tablename__ = "scene_metadata"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    scene_id = Column(String(36), nullable=False)       # Stable node UUID
    scene_number = Column(String(20), nullable=True)
    order_index = Column(Integer, nullable=False)
    environment = Column(String(50), default="INT.", nullable=False)
    location = Column(String(255), default="", nullable=False)
    time_of_day = Column(String(50), default="DAY", nullable=False)

    # Relationships
    document = relationship("Document", back_populates="scenes")
