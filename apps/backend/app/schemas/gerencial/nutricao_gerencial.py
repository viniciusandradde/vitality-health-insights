"""Nutrição gerencial schemas."""
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class RefeicaoGerencialBase(BaseModel):
    """Base refeição gerencial schema."""

    data: str
    tipo_refeicao: str
    quantidade_refeicoes: int
    setor: str
    cardapio: Optional[str] = None
    fornecedor: Optional[str] = None
    valor_unitario: Optional[Decimal] = None
    status: str = "planejado"
    observacoes: Optional[str] = None
    centro_custo: str


class RefeicaoGerencialCreate(RefeicaoGerencialBase):
    """Refeição gerencial creation schema."""

    pass


class RefeicaoGerencialUpdate(BaseModel):
    """Refeição gerencial update schema."""

    data: Optional[str] = None
    tipo_refeicao: Optional[str] = None
    quantidade_refeicoes: Optional[int] = None
    setor: Optional[str] = None
    cardapio: Optional[str] = None
    fornecedor: Optional[str] = None
    valor_unitario: Optional[Decimal] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None
    centro_custo: Optional[str] = None


class RefeicaoGerencialResponse(RefeicaoGerencialBase):
    """Refeição gerencial response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
