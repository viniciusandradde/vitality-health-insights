"""Settings Segurança models."""
from sqlalchemy import Boolean, Column, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class SegurancaConfig(BaseModel):
    """Configuração de segurança model."""

    __tablename__ = "seguranca_config"

    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, unique=True, index=True)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    password_min_length = Column(Integer, default=8, nullable=False)
    password_require_uppercase = Column(Boolean, default=True, nullable=False)
    password_require_lowercase = Column(Boolean, default=True, nullable=False)
    password_require_numbers = Column(Boolean, default=True, nullable=False)
    password_require_special = Column(Boolean, default=False, nullable=False)
    session_timeout_minutes = Column(Integer, default=30, nullable=False)
    max_login_attempts = Column(Integer, default=5, nullable=False)
