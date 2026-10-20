from routers.auth import router as auth_router
from routers.projects import router as projects_router
from routers.documents import router as documents_router
from routers.ws import router as ws_router

__all__ = [
    "auth_router",
    "projects_router",
    "documents_router",
    "ws_router",
]
