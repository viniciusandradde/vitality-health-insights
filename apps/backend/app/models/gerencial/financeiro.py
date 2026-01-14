"""Financeiro models."""
from sqlalchemy import Column, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class MovimentacaoFinanceira(BaseModel):
    """Movimentação financeira model."""

    __tablename__ = "movimentacoes_financeiras"

    data = Column(String, nullable=False, index=True)
    tipo = Column(String(50), nullable=False)  # receita, despesa
    categoria = Column(String(100), nullable=False, index=True)  # salarios, medicamentos, equipamentos, etc
    descricao = Column(String(255), nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)
    forma_pagamento = Column(String(50), nullable=True)  # dinheiro, cartao, transferencia, cheque
    status = Column(String(50), default="pendente", nullable=False)  # pendente, pago, cancelado
    centro_custo = Column(String(100), nullable=False, index=True)
    fornecedor = Column(String(255), nullable=True)
    numero_documento = Column(String(100), nullable=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
