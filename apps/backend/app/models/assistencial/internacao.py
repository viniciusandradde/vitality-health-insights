"""Internacao and Leito models."""
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class Leito(BaseModel):
    """Leito model."""

    __tablename__ = "leitos"

    numero = Column(String(50), nullable=False, index=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    tipo = Column(String(50), nullable=False)  # enfermaria, uti, neonatal, outro
    status = Column(String(50), default="disponivel", nullable=False)  # ocupado, disponivel, manutencao, reservado
    paciente_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    paciente_nome = Column(String(255), nullable=True)
    data_ocupacao = Column(String, nullable=True)
    data_liberacao = Column(String, nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)


class Internacao(BaseModel):
    """Internacao model."""

    __tablename__ = "internacoes"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data_entrada = Column(String, nullable=False, index=True)
    data_saida = Column(String, nullable=True)
    leito_id = Column(UUID(as_uuid=True), ForeignKey("leitos.id"), nullable=True, index=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    medico = Column(String(255), nullable=True)
    especialidade = Column(String(100), nullable=False, index=True)
    diagnostico = Column(String(500), nullable=True)
    tipo = Column(String(50), nullable=False)  # enfermaria, uti, isolamento
    status = Column(String(50), default="internado", nullable=False)
    convenio = Column(String(100), nullable=True, index=True)
    classificacao_risco = Column(String(20), nullable=True)
    proveniencia = Column(String(100), nullable=True)
    vinculado_ps = Column(Boolean, default=False, nullable=False)
    obito = Column(Boolean, default=False, nullable=False)
    dias_permanencia = Column(Integer, nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
