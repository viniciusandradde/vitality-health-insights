"""CCIH schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class InfeccaoBase(BaseModel):
    """Base infecção schema."""

    paciente_id: UUID
    paciente_nome: str
    data_diagnostico: str
    tipo_infeccao: str
    topografia: str
    agente: Optional[str] = None
    antibiotico: Optional[str] = None
    status: str = "em_tratamento"
    classificacao: str
    setor: str
    centro_custo: str
    observacoes: Optional[str] = None


class InfeccaoCreate(InfeccaoBase):
    """Infecção creation schema."""

    pass


class InfeccaoUpdate(BaseModel):
    """Infecção update schema."""

    paciente_nome: Optional[str] = None
    data_diagnostico: Optional[str] = None
    tipo_infeccao: Optional[str] = None
    topografia: Optional[str] = None
    agente: Optional[str] = None
    antibiotico: Optional[str] = None
    status: Optional[str] = None
    classificacao: Optional[str] = None
    setor: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None


class InfeccaoResponse(InfeccaoBase):
    """Infecção response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
