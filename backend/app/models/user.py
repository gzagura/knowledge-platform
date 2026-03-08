from uuid import uuid4
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    provider = Column(String(50), nullable=False)  # google, github, local
    preferred_language = Column(String(10), default="en", nullable=False)  # en, uk, ru
    ui_language = Column(String(10), default="en", nullable=False)  # en, uk, ru
    preferred_reading_time = Column(Integer, default=5, nullable=False)  # minutes
    theme = Column(String(20), default="auto", nullable=False)  # light, dark, auto
    created_at = Column(DateTime, server_default=datetime.utcnow, nullable=False)
