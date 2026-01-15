"""Financeiro schemas."""
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class MovimentacaoFinanceiraBase(BaseModel):
    """Base movimentação financeira schema."""

    data: str
    tipo: str
    categoria: str
    descricao: str
    valor: Decimal
    forma_pagamento: Optional[str] = None
    status: str = "pendente"
    centro_custo: str
    fornecedor: Optional[str] = None
    numero_documento: Optional[str] = None
    observacoes: Optional[str] = None


class MovimentacaoFinanceiraCreate(MovimentacaoFinanceiraBase):
    """Movimentação financeira creation schema."""

    pass


class MovimentacaoFinanceiraUpdate(BaseModel):
    """Movimentação financeira update schema."""

    data: Optional[str] = None
    tipo: Optional[str] = None
    categoria: Optional[str] = None
    descricao: Optional[str] = None
    valor: Optional[Decimal] = None
    forma_pagamento: Optional[str] = None
    status: Optional[str] = None
    centro_custo: Optional[str] = None
    fornecedor: Optional[str] = None
    numero_documento: Optional[str] = None
    observacoes: Optional[str] = None


class MovimentacaoFinanceiraResponse(MovimentacaoFinanceiraBase):
    """Movimentação financeira response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
