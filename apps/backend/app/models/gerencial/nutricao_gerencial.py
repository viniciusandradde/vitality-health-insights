"""Nutrição gerencial models."""
from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class RefeicaoGerencial(BaseModel):
    """Refeição gerencial model."""

    __tablename__ = "refeicoes_gerenciais"

    data = Column(String, nullable=False, index=True)
    tipo_refeicao = Column(String(50), nullable=False)  # cafe_manha, almoco, lanche, jantar, ceia
    quantidade_refeicoes = Column(Integer, nullable=False)
    setor = Column(String(100), nullable=False, index=True)
    cardapio = Column(String(500), nullable=True)
    fornecedor = Column(String(255), nullable=True)
    valor_unitario = Column(Numeric(10, 2), nullable=True)
    status = Column(String(50), default="planejado", nullable=False)  # planejado, em_preparo, servido, cancelado
    observacoes = Column(String(500), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
