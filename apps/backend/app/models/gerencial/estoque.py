"""Estoque models."""
from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class ItemEstoque(BaseModel):
    """Item de estoque model."""

    __tablename__ = "itens_estoque"

    codigo = Column(String(50), nullable=False, unique=True, index=True)
    descricao = Column(String(255), nullable=False)
    categoria = Column(String(100), nullable=False, index=True)  # medicamento, material, equipamento
    unidade_medida = Column(String(20), nullable=False)  # un, cx, fr, etc
    quantidade_atual = Column(Integer, default=0, nullable=False)
    quantidade_minima = Column(Integer, default=0, nullable=False)
    quantidade_maxima = Column(Integer, nullable=True)
    valor_unitario = Column(Numeric(10, 2), nullable=True)
    fornecedor = Column(String(255), nullable=True)
    localizacao = Column(String(100), nullable=True)  # prateleira, setor
    status = Column(String(50), default="ativo", nullable=False)  # ativo, inativo, bloqueado
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
