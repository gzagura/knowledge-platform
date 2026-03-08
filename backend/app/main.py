from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.api.v1.router import router as v1_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting Knowledge Discovery Platform API...")
    yield
    # Cleanup: close any open Wikipedia API clients
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
