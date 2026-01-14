"""Atendimentos model."""
from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class Atendimento(BaseModel):
    """Atendimento model."""

    __tablename__ = "atendimentos"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data = Column(String, nullable=False, index=True)
    hora = Column(String(10), nullable=True)
    tipo = Column(String(50), nullable=False)  # ambulatorial, emergencia, internacao
    tipo_servico = Column(String(100), nullable=True)
    especialidade = Column(String(100), nullable=False, index=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    convenio = Column(String(100), nullable=False, index=True)
    categoria_convenio = Column(String(20), nullable=False)  # SUS, convenio, particular
    profissional = Column(String(255), nullable=True)
    status = Column(String(50), default="aguardando", nullable=False)
    tempo_espera_minutos = Column(Integer, nullable=True)
    valor = Column(Numeric(10, 2), nullable=True)
    faixa_etaria = Column(String(20), nullable=True)
    idade = Column(Integer, nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
