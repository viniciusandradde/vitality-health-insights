"""User and Role models."""
from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Role(BaseModel):
    """Role model."""

    __tablename__ = "roles"

    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    permissions = Column(String, nullable=True)  # JSON string of permissions

    # Relationships
    users = relationship("User", back_populates="role", lazy="selectin")


class User(BaseModel):
    """User model."""

    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    department = Column(String(100), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(String, nullable=True)

    # Relationships
    tenant = relationship("Tenant", back_populates="users", lazy="selectin")
    role = relationship("Role", back_populates="users", lazy="selectin")
