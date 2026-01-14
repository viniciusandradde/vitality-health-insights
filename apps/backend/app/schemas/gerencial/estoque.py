"""Estoque schemas."""
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class ItemEstoqueBase(BaseModel):
    """Base item de estoque schema."""

    codigo: str
    descricao: str
    categoria: str
    unidade_medida: str
    quantidade_atual: int = 0
    quantidade_minima: int = 0
    quantidade_maxima: Optional[int] = None
    valor_unitario: Optional[Decimal] = None
    fornecedor: Optional[str] = None
    localizacao: Optional[str] = None
    status: str = "ativo"
    centro_custo: str
    observacoes: Optional[str] = None


class ItemEstoqueCreate(ItemEstoqueBase):
    """Item de estoque creation schema."""

    pass


class ItemEstoqueUpdate(BaseModel):
    """Item de estoque update schema."""

    descricao: Optional[str] = None
    categoria: Optional[str] = None
    unidade_medida: Optional[str] = None
    quantidade_atual: Optional[int] = None
    quantidade_minima: Optional[int] = None
    quantidade_maxima: Optional[int] = None
    valor_unitario: Optional[Decimal] = None
    fornecedor: Optional[str] = None
    localizacao: Optional[str] = None
    status: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None


class ItemEstoqueResponse(ItemEstoqueBase):
    """Item de estoque response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
