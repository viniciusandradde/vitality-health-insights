"""Ambulatorio schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class AmbulatorioConsultaBase(BaseModel):
    """Base ambulatorio consulta schema."""

    paciente_id: UUID
    paciente_nome: str
    data: str
    hora: Optional[str] = None
    especialidade: str
    medico: Optional[str] = None
    tipo_consulta: str
    status: str = "agendada"
    convenio: Optional[str] = None
    categoria_convenio: str
    centro_custo: str
    queixa_principal: Optional[str] = None
    diagnostico: Optional[str] = None
    observacoes: Optional[str] = None


class AmbulatorioConsultaCreate(AmbulatorioConsultaBase):
    """Ambulatorio consulta creation schema."""

    pass


class AmbulatorioConsultaUpdate(BaseModel):
    """Ambulatorio consulta update schema."""

    paciente_nome: Optional[str] = None
    data: Optional[str] = None
    hora: Optional[str] = None
    especialidade: Optional[str] = None
    medico: Optional[str] = None
    tipo_consulta: Optional[str] = None
    status: Optional[str] = None
    convenio: Optional[str] = None
    categoria_convenio: Optional[str] = None
    centro_custo: Optional[str] = None
    queixa_principal: Optional[str] = None
    diagnostico: Optional[str] = None
    observacoes: Optional[str] = None


class AmbulatorioConsultaResponse(AmbulatorioConsultaBase):
    """Ambulatorio consulta response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
