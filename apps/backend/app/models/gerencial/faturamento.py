"""Faturamento models."""
from sqlalchemy import Boolean, Column, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class Faturamento(BaseModel):
    """Faturamento model."""

    __tablename__ = "faturamentos"

    paciente_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    paciente_nome = Column(String(255), nullable=True)
    data_faturamento = Column(String, nullable=False, index=True)
    tipo_faturamento = Column(String(50), nullable=False)  # ambulatorial, internacao, exame, procedimento
    convenio = Column(String(100), nullable=True, index=True)
    categoria_convenio = Column(String(20), nullable=False)  # SUS, convenio, particular
    valor_total = Column(Numeric(10, 2), nullable=False)
    valor_glosado = Column(Numeric(10, 2), default=0, nullable=False)
    valor_recebido = Column(Numeric(10, 2), default=0, nullable=False)
    status = Column(String(50), default="pendente", nullable=False)  # pendente, faturado, glosado, recebido, cancelado
    data_recebimento = Column(String, nullable=True)
    numero_guia = Column(String(100), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
