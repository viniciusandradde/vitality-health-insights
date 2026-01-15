"""TI models."""
from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class ChamadoTI(BaseModel):
    """Chamado TI model."""

    __tablename__ = "chamados_ti"

    titulo = Column(String(255), nullable=False)
    descricao = Column(String(1000), nullable=False)
    tipo = Column(String(100), nullable=False)  # hardware, software, rede, backup, outro
    prioridade = Column(String(50), nullable=False)  # baixa, media, alta, critica
    setor = Column(String(100), nullable=False, index=True)
    solicitante = Column(String(255), nullable=False)
    data_abertura = Column(String, nullable=False, index=True)
    data_fechamento = Column(String, nullable=True)
    status = Column(String(50), default="aberto", nullable=False)  # aberto, em_andamento, resolvido, cancelado
    tecnico_responsavel = Column(String(255), nullable=True)
    solucao = Column(String(1000), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
