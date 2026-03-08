from uuid import uuid4
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from datetime import datetime


class ArticleLike(Base):
    __tablename__ = "article_likes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    article_id = Column(UUID(as_uuid=True), ForeignKey("article_cache.id"), nullable=False)
    created_at = Column(DateTime, server_default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "article_id", name="uq_article_like_user_article"),
        Index("ix_like_user_id", "user_id"),
        Index("ix_like_article_id", "article_id"),
    )


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    article_id = Column(UUID(as_uuid=True), ForeignKey("article_cache.id"), nullable=False)
    created_at = Column(DateTime, server_default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "article_id", name="uq_bookmark_user_article"),
        Index("ix_bookmark_user_id", "user_id"),
        Index("ix_bookmark_article_id", "article_id"),
    )


class ArticleFeedback(Base):
    __tablename__ = "article_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    article_id = Column(UUID(as_uuid=True), ForeignKey("article_cache.id"), nullable=False)
    feedback = Column(String(50), nullable=False)  # "like" or "not_interested"
    created_at = Column(DateTime, server_default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_feedback_user_id", "user_id"),
        Index("ix_feedback_article_id", "article_id"),
    )


class ReadingHistory(Base):
    __tablename__ = "reading_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    article_id = Column(UUID(as_uuid=True), ForeignKey("article_cache.id"), nullable=False)
    started_at = Column(DateTime, server_default=datetime.utcnow, nullable=False)
    finished_at = Column(DateTime, nullable=True)
    reading_duration_seconds = Column(Integer, nullable=True)
    scroll_depth_percent = Column(Integer, nullable=True)

    __table_args__ = (
        Index("ix_reading_history_user_id", "user_id"),
        Index("ix_reading_history_article_id", "article_id"),
    )


class ArticleShare(Base):
    __tablename__ = "article_shares"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    article_id = Column(UUID(as_uuid=True), ForeignKey("article_cache.id"), nullable=False)
    platform = Column(String(50), nullable=False)  # twitter, facebook, email, etc.
    created_at = Column(DateTime, server_default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_share_user_id", "user_id"),
        Index("ix_share_article_id", "article_id"),
    )
