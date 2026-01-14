"""Exames laboratoriais models."""
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class ExameLaboratorial(BaseModel):
    """Exame laboratorial model."""

    __tablename__ = "exames_laboratoriais"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data_solicitacao = Column(String, nullable=False, index=True)
    data_coleta = Column(String, nullable=True)
    data_resultado = Column(String, nullable=True)
    tipo_exame = Column(String(100), nullable=False, index=True)
    codigo_exame = Column(String(50), nullable=True)
    status = Column(String(50), default="solicitado", nullable=False)  # solicitado, coletado, em_analise, concluido, cancelado
    resultado = Column(String, nullable=True)
    valor_referencia = Column(String, nullable=True)
    medico_solicitante = Column(String(255), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    convenio = Column(String(100), nullable=True, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
