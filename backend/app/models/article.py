from uuid import uuid4
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from datetime import datetime


class ArticleCache(Base):
    __tablename__ = "article_cache"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    wikipedia_id = Column(Integer, nullable=False, index=True)
    title = Column(String(512), nullable=False)
    extract = Column(Text, nullable=False)
    full_content = Column(Text, nullable=True)
    language = Column(String(10), nullable=False, index=True)
    category = Column(String(255), nullable=True)
    reading_time_minutes = Column(Integer, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    image_url = Column(String(512), nullable=True)
    cached_at = Column(DateTime, server_default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("wikipedia_id", "language", name="uq_article_cache_wiki_lang"),
        Index("ix_article_language", "language"),
        Index("ix_article_featured", "is_featured"),
    )
