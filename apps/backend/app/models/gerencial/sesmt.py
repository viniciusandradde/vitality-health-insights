"""SESMT models."""
from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class OcorrenciaSESMT(BaseModel):
    """Ocorrência SESMT model."""

    __tablename__ = "ocorrencias_sesmt"

    tipo_ocorrencia = Column(String(100), nullable=False)  # acidente, incidente, quase_acidente
    data = Column(String, nullable=False, index=True)
    setor = Column(String(100), nullable=False, index=True)
    funcionario = Column(String(255), nullable=True)
    descricao = Column(String(1000), nullable=False)
    gravidade = Column(String(50), nullable=False)  # leve, moderada, grave, fatal
    status = Column(String(50), default="registrado", nullable=False)  # registrado, em_analise, concluido
    medidas_tomadas = Column(String(1000), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
