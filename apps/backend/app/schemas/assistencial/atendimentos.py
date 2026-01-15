"""Atendimentos schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr
from decimal import Decimal


class AtendimentoBase(BaseModel):
    """Base atendimento schema."""

    paciente_id: UUID
    paciente_nome: str
    data: str
    hora: Optional[str] = None
    tipo: str
    tipo_servico: Optional[str] = None
    especialidade: str
    centro_custo: str
    convenio: str
    categoria_convenio: str
    profissional: Optional[str] = None
    status: str = "aguardando"
    tempo_espera_minutos: Optional[int] = None
    valor: Optional[Decimal] = None
    faixa_etaria: Optional[str] = None
    idade: Optional[int] = None


class AtendimentoCreate(AtendimentoBase):
    """Atendimento creation schema."""

    pass


class AtendimentoUpdate(BaseModel):
    """Atendimento update schema."""

    paciente_nome: Optional[str] = None
    data: Optional[str] = None
    hora: Optional[str] = None
    tipo: Optional[str] = None
    tipo_servico: Optional[str] = None
    especialidade: Optional[str] = None
    centro_custo: Optional[str] = None
    convenio: Optional[str] = None
    categoria_convenio: Optional[str] = None
    profissional: Optional[str] = None
    status: Optional[str] = None
    tempo_espera_minutos: Optional[int] = None
    valor: Optional[Decimal] = None
    faixa_etaria: Optional[str] = None
    idade: Optional[int] = None


class AtendimentoResponse(AtendimentoBase):
    """Atendimento response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
