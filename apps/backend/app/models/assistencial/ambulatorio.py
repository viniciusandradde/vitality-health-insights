"""Ambulatorio models."""
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class AmbulatorioConsulta(BaseModel):
    """Ambulatorio consulta model."""

    __tablename__ = "ambulatorio_consultas"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data = Column(String, nullable=False, index=True)
    hora = Column(String(10), nullable=True)
    especialidade = Column(String(100), nullable=False, index=True)
    medico = Column(String(255), nullable=True)
    tipo_consulta = Column(String(50), nullable=False)  # primeira_vez, retorno, encaixe
    status = Column(String(50), default="agendada", nullable=False)  # agendada, realizada, cancelada, no_show
    convenio = Column(String(100), nullable=True, index=True)
    categoria_convenio = Column(String(20), nullable=False)  # SUS, convenio, particular
    centro_custo = Column(String(100), nullable=False, index=True)
    queixa_principal = Column(String(500), nullable=True)
    diagnostico = Column(String(500), nullable=True)
    observacoes = Column(String(1000), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
