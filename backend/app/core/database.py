from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool

from app.core.config import settings

# NullPool is required for serverless environments (Vercel) — each request
# gets a fresh connection; no background threads for pool management.
engine = create_async_engine(
    settings.db_url,
    echo=False,
    future=True,
    poolclass=NullPool,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    """Dependency to get async database session."""
    async with async_session() as session:
        yield session
