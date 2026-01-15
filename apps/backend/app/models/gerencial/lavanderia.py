"""Lavanderia models."""
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class ServicoLavanderia(BaseModel):
    """Serviço de lavanderia model."""

    __tablename__ = "servicos_lavanderia"

    setor = Column(String(100), nullable=False, index=True)
    tipo_roupa = Column(String(100), nullable=False)  # roupa_cama, uniforme, toalha, etc
    quantidade = Column(Integer, nullable=False)
    data_entrada = Column(String, nullable=False, index=True)
    data_saida = Column(String, nullable=True)
    status = Column(String(50), default="recebido", nullable=False)  # recebido, lavando, secando, passando, pronto, entregue
    profissional = Column(String(255), nullable=True)
    observacoes = Column(String(500), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
