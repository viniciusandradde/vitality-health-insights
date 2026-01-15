"""Settings Integrações models."""
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class Integracao(BaseModel):
    """Integração externa model."""

    __tablename__ = "integracoes"

    nome = Column(String(255), nullable=False)
    tipo = Column(String(100), nullable=False, index=True)  # erp, wareline, tasy, outro
    url = Column(String(500), nullable=True)
    api_key = Column(String(500), nullable=True)  # Criptografado em produção
    config = Column(String, nullable=True)  # JSON string com configurações
    ativo = Column(Boolean, default=False, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)

    # ERP-specific fields (stored in config JSON, but defined here for clarity)
    # erp_type: postgresql, sqlserver, oracle, mysql
    # erp_host: string
    # erp_port: integer
    # erp_database_name: string
    # erp_username: string (encrypted)
    # erp_password: string (encrypted)
    # erp_ssl_mode: string (for PostgreSQL)
    # erp_timeout_seconds: integer
    # erp_max_connections: integer
    # erp_enabled: boolean
