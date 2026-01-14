"""Agendas models."""
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class Agendamento(BaseModel):
    """Agendamento model."""

    __tablename__ = "agendamentos"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data = Column(String, nullable=False, index=True)
    hora = Column(String(10), nullable=False)
    especialidade = Column(String(100), nullable=False, index=True)
    profissional = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)  # consulta, exame, procedimento
    status = Column(String(50), default="agendado", nullable=False)  # agendado, confirmado, realizado, cancelado, no_show
    origem = Column(String(50), nullable=True)  # telefone, online, presencial, encaixe
    convenio = Column(String(100), nullable=True, index=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)
    confirmado = Column(String, nullable=True)  # data/hora da confirmação

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
