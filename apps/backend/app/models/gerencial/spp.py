"""SPP models."""
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class AtividadeSPP(BaseModel):
    """Atividade SPP model."""

    __tablename__ = "atividades_spp"

    tipo_atividade = Column(String(100), nullable=False)  # treinamento, inspecao, auditoria, etc
    data = Column(String, nullable=False, index=True)
    setor = Column(String(100), nullable=False, index=True)
    responsavel = Column(String(255), nullable=False)
    descricao = Column(String(1000), nullable=False)
    status = Column(String(50), default="planejado", nullable=False)  # planejado, em_execucao, concluido, cancelado
    participantes = Column(String(500), nullable=True)
    observacoes = Column(String(500), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
