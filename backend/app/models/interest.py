from uuid import uuid4
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from datetime import datetime


class UserInterest(Base):
    __tablename__ = "user_interests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_name = Column(String(255), nullable=False)
    weight = Column(Float, default=1.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "category_name", name="uq_user_interest_category"),
        Index("ix_interest_user_id", "user_id"),
    )
