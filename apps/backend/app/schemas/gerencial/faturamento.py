"""Faturamento schemas."""
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class FaturamentoBase(BaseModel):
    """Base faturamento schema."""

    paciente_id: Optional[UUID] = None
    paciente_nome: Optional[str] = None
    data_faturamento: str
    tipo_faturamento: str
    convenio: Optional[str] = None
    categoria_convenio: str
    valor_total: Decimal
    valor_glosado: Decimal = 0
    valor_recebido: Decimal = 0
    status: str = "pendente"
    data_recebimento: Optional[str] = None
    numero_guia: Optional[str] = None
    centro_custo: str
    observacoes: Optional[str] = None


class FaturamentoCreate(FaturamentoBase):
    """Faturamento creation schema."""

    pass


class FaturamentoUpdate(BaseModel):
    """Faturamento update schema."""

    paciente_nome: Optional[str] = None
    data_faturamento: Optional[str] = None
    tipo_faturamento: Optional[str] = None
    convenio: Optional[str] = None
    categoria_convenio: Optional[str] = None
    valor_total: Optional[Decimal] = None
    valor_glosado: Optional[Decimal] = None
    valor_recebido: Optional[Decimal] = None
    status: Optional[str] = None
    data_recebimento: Optional[str] = None
    numero_guia: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None


class FaturamentoResponse(FaturamentoBase):
    """Faturamento response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
