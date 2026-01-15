"""Higienização models."""
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class ServicoHigienizacao(BaseModel):
    """Serviço de higienização model."""

    __tablename__ = "servicos_higienizacao"

    setor = Column(String(100), nullable=False, index=True)
    tipo_servico = Column(String(100), nullable=False)  # limpeza, desinfecção, esterilizacao
    data = Column(String, nullable=False, index=True)
    hora = Column(String(10), nullable=True)
    profissional = Column(String(255), nullable=False)
    status = Column(String(50), default="agendado", nullable=False)  # agendado, em_andamento, concluido, cancelado
    observacoes = Column(String(500), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
