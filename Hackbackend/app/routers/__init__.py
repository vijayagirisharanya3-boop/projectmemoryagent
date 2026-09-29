from app.routers.projects import router as projects_router
from app.routers.information import router as information_router
from app.routers.auth import router as auth_router

__all__ = ["projects_router", "information_router", "auth_router"]
