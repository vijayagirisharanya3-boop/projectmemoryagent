import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, check_db_connection
from app.models import Base
from app.routers import projects_router, information_router, auth_router

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("project_memory_agent")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes database tables and verifies MySQL connection on startup.
    """
    logger.info("Starting up Project Memory Agent Backend...")
    # Verify MySQL connection
    if check_db_connection():
        logger.info("Successfully connected to MySQL database.")
    else:
        logger.warning("Could not connect to MySQL database! Ensure MySQL service is running.")

    # Create tables in MySQL if they do not exist
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("MySQL tables verified/created successfully.")
    except Exception as exc:
        logger.error(f"Error creating MySQL tables: {exc}")

    yield

    logger.info("Shutting down Project Memory Agent Backend...")


app = FastAPI(
    title="Project Memory Agent Backend",
    description="Backend service managing project metadata in MySQL and long-term project memory in Hindsight.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration suitable for React / Vite / Next frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in settings.CORS_ORIGINS if origin != "*"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(projects_router)
app.include_router(information_router)
app.include_router(auth_router)


@app.get("/health", tags=["Health"])
def health_check():
    """System health check endpoint verifying MySQL connection and configuration."""
    mysql_ok = check_db_connection()
    return {
        "status": "healthy" if mysql_ok else "degraded",
        "mysql_connected": mysql_ok,
        "hindsight_base_url": settings.HINDSIGHT_BASE_URL,
        "version": "1.0.0"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception during {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred.", "error": str(exc)}
    )
