"""Fisioterapia models."""
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class SessaoFisioterapia(BaseModel):
    """Sessão de fisioterapia model."""

    __tablename__ = "sessoes_fisioterapia"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data = Column(String, nullable=False, index=True)
    hora = Column(String(10), nullable=True)
    tipo_sessao = Column(String(100), nullable=False)  # motora, respiratoria, neurologica, etc
    profissional = Column(String(255), nullable=False)
    duracao = Column(Integer, nullable=True)  # em minutos
    status = Column(String(50), default="agendada", nullable=False)  # agendada, realizada, cancelada, falta
    evolucao = Column(String(1000), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
