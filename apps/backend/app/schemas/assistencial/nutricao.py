"""Nutrição schemas."""
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class AvaliacaoNutricionalBase(BaseModel):
    """Base avaliação nutricional schema."""

    paciente_id: UUID
    paciente_nome: str
    data: str
    tipo_avaliacao: str
    imc: Optional[Decimal] = None
    peso: Optional[Decimal] = None
    altura: Optional[Decimal] = None
    diagnostico: Optional[str] = None
    dieta: Optional[str] = None
    profissional: str
    centro_custo: str
    observacoes: Optional[str] = None


class AvaliacaoNutricionalCreate(AvaliacaoNutricionalBase):
    """Avaliação nutricional creation schema."""

    pass


class AvaliacaoNutricionalUpdate(BaseModel):
    """Avaliação nutricional update schema."""

    paciente_nome: Optional[str] = None
    data: Optional[str] = None
    tipo_avaliacao: Optional[str] = None
    imc: Optional[Decimal] = None
    peso: Optional[Decimal] = None
    altura: Optional[Decimal] = None
    diagnostico: Optional[str] = None
    dieta: Optional[str] = None
    profissional: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None


class AvaliacaoNutricionalResponse(AvaliacaoNutricionalBase):
    """Avaliação nutricional response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
