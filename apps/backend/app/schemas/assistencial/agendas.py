"""Agendas schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class AgendamentoBase(BaseModel):
    """Base agendamento schema."""

    paciente_id: UUID
    paciente_nome: str
    data: str
    hora: str
    especialidade: str
    profissional: str
    tipo: str
    status: str = "agendado"
    origem: Optional[str] = None
    convenio: Optional[str] = None
    centro_custo: str
    observacoes: Optional[str] = None
    confirmado: Optional[str] = None


class AgendamentoCreate(AgendamentoBase):
    """Agendamento creation schema."""

    pass


class AgendamentoUpdate(BaseModel):
    """Agendamento update schema."""

    paciente_nome: Optional[str] = None
    data: Optional[str] = None
    hora: Optional[str] = None
    especialidade: Optional[str] = None
    profissional: Optional[str] = None
    tipo: Optional[str] = None
    status: Optional[str] = None
    origem: Optional[str] = None
    convenio: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None
    confirmado: Optional[str] = None


class AgendamentoResponse(AgendamentoBase):
    """Agendamento response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
