"""Internacao schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class InternacaoBase(BaseModel):
    """Base internacao schema."""

    paciente_id: UUID
    paciente_nome: str
    data_entrada: str
    data_saida: Optional[str] = None
    leito_id: Optional[UUID] = None
    centro_custo: str
    medico: Optional[str] = None
    especialidade: str
    diagnostico: Optional[str] = None
    tipo: str
    status: str = "internado"
    convenio: Optional[str] = None
    classificacao_risco: Optional[str] = None
    proveniencia: Optional[str] = None
    vinculado_ps: bool = False
    obito: bool = False
    dias_permanencia: Optional[int] = None


class InternacaoCreate(InternacaoBase):
    """Internacao creation schema."""

    pass


class InternacaoUpdate(BaseModel):
    """Internacao update schema."""

    paciente_nome: Optional[str] = None
    data_entrada: Optional[str] = None
    data_saida: Optional[str] = None
    leito_id: Optional[UUID] = None
    centro_custo: Optional[str] = None
    medico: Optional[str] = None
    especialidade: Optional[str] = None
    diagnostico: Optional[str] = None
    tipo: Optional[str] = None
    status: Optional[str] = None
    convenio: Optional[str] = None
    classificacao_risco: Optional[str] = None
    proveniencia: Optional[str] = None
    vinculado_ps: Optional[bool] = None
    obito: Optional[bool] = None
    dias_permanencia: Optional[int] = None


class InternacaoResponse(InternacaoBase):
    """Internacao response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
