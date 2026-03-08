from pydantic_settings import BaseSettings


def _fix_db_url(url: str) -> str:
    """Normalize Vercel Postgres URL to asyncpg format.

    Vercel supplies POSTGRES_URL as  postgres://...  or  postgresql://...
    SQLAlchemy async needs                              postgresql+asyncpg://...
    """
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


class Settings(BaseSettings):
    # Vercel Postgres sets POSTGRES_URL; local dev uses DATABASE_URL
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/knowledge_platform"
    POSTGRES_URL: str = ""          # injected automatically by Vercel Postgres add-on

    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    DEFAULT_LANGUAGE: str = "en"
    SUPPORTED_LANGUAGES: list[str] = ["en", "uk", "ru"]

    @property
    def db_url(self) -> str:
        """Return the correct async-compatible database URL."""
        raw = self.POSTGRES_URL or self.DATABASE_URL
        return _fix_db_url(raw)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
