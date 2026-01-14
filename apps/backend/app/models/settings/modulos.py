"""Settings Módulos models."""
from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class ModuloConfig(BaseModel):
    """Configuração de módulo model."""

    __tablename__ = "modulos_config"

    modulo_id = Column(String(100), nullable=False, unique=True, index=True)  # atendimentos, internacao, etc
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    enabled = Column(Boolean, default=True, nullable=False)
    config = Column(String, nullable=True)  # JSON string com configurações específicas
