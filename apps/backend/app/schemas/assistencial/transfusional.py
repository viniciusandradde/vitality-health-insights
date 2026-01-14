"""Agência transfusional schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class TransfusaoBase(BaseModel):
    """Base transfusão schema."""

    paciente_id: UUID
    paciente_nome: str
    data: str
    hora: Optional[str] = None
    tipo_sangue: str
    quantidade: int
    hemocomponente: str
    status: str = "solicitado"
    reacao: Optional[str] = None
    medico_solicitante: Optional[str] = None
    centro_custo: str
    observacoes: Optional[str] = None


class TransfusaoCreate(TransfusaoBase):
    """Transfusão creation schema."""

    pass


class TransfusaoUpdate(BaseModel):
    """Transfusão update schema."""

    paciente_nome: Optional[str] = None
    data: Optional[str] = None
    hora: Optional[str] = None
    tipo_sangue: Optional[str] = None
    quantidade: Optional[int] = None
    hemocomponente: Optional[str] = None
    status: Optional[str] = None
    reacao: Optional[str] = None
    medico_solicitante: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None


class TransfusaoResponse(TransfusaoBase):
    """Transfusão response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
