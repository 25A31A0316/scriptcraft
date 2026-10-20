import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User, ProjectMember
from models.document import Document, DocumentSnapshot
from schemas.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    SnapshotCreate,
    SnapshotResponse,
)
from routers.auth import get_current_user

router = APIRouter(prefix="/api/documents", tags=["Documents"])

def verify_project_access(project_id: str, user_id: str, db: Session) -> ProjectMember:
    member = (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or access denied")
    return member

@router.get("", response_model=list[DocumentResponse])
def list_documents(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_project_access(project_id, current_user.id, db)
    docs = db.query(Document).filter(Document.project_id == project_id).all()
    return [DocumentResponse.model_validate(d) for d in docs]

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    doc_in: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_project_access(doc_in.project_id, current_user.id, db)

    doc = Document(
        project_id=doc_in.project_id,
        title=doc_in.title,
        format=doc_in.format,
        language=doc_in.language,
        current_version=1,
    )
    db.add(doc)
    db.flush()

    # Save initial snapshot
    initial_content = doc_in.initial_content or {
        "id": doc.id,
        "title": doc.title,
        "format": doc.format,
        "titlePage": {"title": doc.title.upper(), "credit": "Written by", "author": current_user.name},
        "nodes": [
            {"id": "init-sc-1", "type": "scene_heading", "text": "INT. NEW SCENE - DAY"},
            {"id": "init-ac-1", "type": "action", "text": "Start writing your screenplay..."},
        ],
        "revision": {"currentColor": "white", "version": 1, "lockedSceneNumbers": False},
        "language": {"primary": doc.language, "direction": "ltr"},
    }

    snapshot = DocumentSnapshot(
        document_id=doc.id,
        version=1,
        content_json=json.dumps(initial_content),
    )
    db.add(snapshot)
    db.commit()
    db.refresh(doc)

    return DocumentResponse.model_validate(doc)

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    verify_project_access(doc.project_id, current_user.id, db)
    return DocumentResponse.model_validate(doc)

@router.get("/{document_id}/snapshot/latest", response_model=SnapshotResponse)
def get_latest_snapshot(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    verify_project_access(doc.project_id, current_user.id, db)

    snapshot = (
        db.query(DocumentSnapshot)
        .filter(DocumentSnapshot.document_id == document_id)
        .order_by(DocumentSnapshot.version.desc())
        .first()
    )
    if not snapshot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No snapshot found for document")

    return SnapshotResponse.model_validate(snapshot)

@router.post("/{document_id}/snapshots", response_model=SnapshotResponse, status_code=status.HTTP_201_CREATED)
def create_snapshot(
    document_id: str,
    snap_in: SnapshotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    verify_project_access(doc.project_id, current_user.id, db)

    new_version = doc.current_version + 1
    doc.current_version = new_version

    snapshot = DocumentSnapshot(
        document_id=doc.id,
        version=new_version,
        content_json=snap_in.content_json,
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return SnapshotResponse.model_validate(snapshot)

@router.get("/{document_id}/snapshots", response_model=list[SnapshotResponse])
def list_snapshots(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    verify_project_access(doc.project_id, current_user.id, db)

    snapshots = (
        db.query(DocumentSnapshot)
        .filter(DocumentSnapshot.document_id == document_id)
        .order_by(DocumentSnapshot.version.desc())
        .all()
    )
    return [SnapshotResponse.model_validate(s) for s in snapshots]
