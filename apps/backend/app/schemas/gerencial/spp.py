"""SPP schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class AtividadeSPPBase(BaseModel):
    """Base atividade SPP schema."""

    tipo_atividade: str
    data: str
    setor: str
    responsavel: str
    descricao: str
    status: str = "planejado"
    participantes: Optional[str] = None
    observacoes: Optional[str] = None
    centro_custo: str


class AtividadeSPPCreate(AtividadeSPPBase):
    """Atividade SPP creation schema."""

    pass


class AtividadeSPPUpdate(BaseModel):
    """Atividade SPP update schema."""

    tipo_atividade: Optional[str] = None
    data: Optional[str] = None
    setor: Optional[str] = None
    responsavel: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[str] = None
    participantes: Optional[str] = None
    observacoes: Optional[str] = None
    centro_custo: Optional[str] = None


class AtividadeSPPResponse(AtividadeSPPBase):
    """Atividade SPP response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
