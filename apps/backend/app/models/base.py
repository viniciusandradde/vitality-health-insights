"""Base model with common fields."""
from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class BaseModel(Base):
    """Base model with common fields."""

    __abstract__ = True

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    deleted_at = Column(DateTime, nullable=True)
