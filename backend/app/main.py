from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.api.v1.router import router as v1_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _run_migrations() -> None:
    """Run Alembic migrations on startup (safe for serverless cold starts)."""
    try:
        from alembic.config import Config
        from alembic import command
        import os

        alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
        # Override sqlalchemy.url with our runtime db_url so Alembic uses the
        # same Vercel Postgres connection that the app uses.
        alembic_cfg.set_main_option("sqlalchemy.url", settings.db_url.replace(
            "postgresql+asyncpg://", "postgresql://"  # Alembic uses sync driver
        ))
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations applied successfully.")
    except Exception as exc:
        # Don't crash the server if migrations fail (e.g. already up-to-date)
        logger.warning(f"Migration step skipped or failed: {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting Knowledge Discovery Platform API...")
    _run_migrations()
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Knowledge Discovery Platform",
    description="API for personalized knowledge discovery",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")
