"""Farmácia models."""
from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class Prescricao(BaseModel):
    """Prescrição farmacêutica model."""

    __tablename__ = "prescricoes"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data_prescricao = Column(String, nullable=False, index=True)
    medicamento = Column(String(255), nullable=False)
    principio_ativo = Column(String(255), nullable=True)
    dosagem = Column(String(100), nullable=False)
    via = Column(String(50), nullable=False)  # oral, venosa, intramuscular, etc
    frequencia = Column(String(100), nullable=True)
    duracao = Column(String(50), nullable=True)
    quantidade = Column(String(50), nullable=True)
    status = Column(String(50), default="prescrito", nullable=False)  # prescrito, dispensado, suspenso, cancelado
    dispensado = Column(Boolean, default=False, nullable=False)
    data_dispensacao = Column(String, nullable=True)
    medico_prescritor = Column(String(255), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
