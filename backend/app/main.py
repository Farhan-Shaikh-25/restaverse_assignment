import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import get_settings
from app.database.session import engine, Base
from app.routers.employees import router as employees_router

logger = logging.getLogger("uvicorn.error")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize schema definitions on startup if target tables are absent
    current_settings = get_settings()
    if current_settings.ENVIRONMENT != "testing" and not current_settings.DATABASE_URL.startswith("mysql+pymysql://root:password@localhost"):
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database schema verified/initialized successfully.")
        except Exception as exc:
            logger.warning("Database connection failed during startup schema check: %s", exc)
    yield


app = FastAPI(
    title="Employee Directory API",
    version="1.0.0",
    description="High-performance employee directory search service with connection pooling and debounced query support.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Primary API v1 route mount
app.include_router(employees_router, prefix=settings.API_V1_PREFIX)

# Compatibility alias directly at /employees to satisfy assignment specification
app.include_router(employees_router)


@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
def health_check():
    db_status = "healthy"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    return {
        "status": "online",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
    }
