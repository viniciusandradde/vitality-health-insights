"""UTI models."""
from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class UTIInternacao(BaseModel):
    """Internação em UTI model."""

    __tablename__ = "uti_internacoes"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data_entrada = Column(String, nullable=False, index=True)
    data_saida = Column(String, nullable=True)
    apache_score = Column(Integer, nullable=True)
    ventilacao = Column(Boolean, default=False, nullable=False)
    dias_ventilacao = Column(Integer, nullable=True)
    status = Column(String(50), default="internado", nullable=False)  # internado, alta, obito, transferido
    obito = Column(Boolean, default=False, nullable=False)
    dias_permanencia = Column(Integer, nullable=True)
    especialidade = Column(String(100), nullable=False, index=True)
    medico = Column(String(255), nullable=True)
    diagnostico = Column(String(500), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
