"""Settings Notificações models."""
from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class NotificacaoConfig(BaseModel):
    """Configuração de notificações model."""

    __tablename__ = "notificacoes_config"

    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, unique=True, index=True)
    email_enabled = Column(Boolean, default=True, nullable=False)
    email_kpis_diarios = Column(Boolean, default=True, nullable=False)
    email_alertas = Column(Boolean, default=True, nullable=False)
    push_enabled = Column(Boolean, default=True, nullable=False)
    push_alertas_criticos = Column(Boolean, default=True, nullable=False)
    sms_enabled = Column(Boolean, default=False, nullable=False)
    sms_alertas_criticos = Column(Boolean, default=False, nullable=False)
