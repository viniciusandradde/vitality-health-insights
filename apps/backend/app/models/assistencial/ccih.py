"""CCIH models."""
from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class Infeccao(BaseModel):
    """Infecção hospitalar model."""

    __tablename__ = "infeccoes"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data_diagnostico = Column(String, nullable=False, index=True)
    tipo_infeccao = Column(String(100), nullable=False, index=True)  # iras, icca, pneumonia, uti, etc
    topografia = Column(String(100), nullable=False)  # local da infecção
    agente = Column(String(255), nullable=True)  # agente causador
    antibiotico = Column(String(255), nullable=True)  # antibiótico utilizado
    status = Column(String(50), default="em_tratamento", nullable=False)  # em_tratamento, curada, obito
    classificacao = Column(String(50), nullable=False)  # comunitária, hospitalar, associada_cuidados
    setor = Column(String(100), nullable=False, index=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
