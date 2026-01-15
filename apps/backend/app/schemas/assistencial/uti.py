"""UTI schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class UTIInternacaoBase(BaseModel):
    """Base UTI internação schema."""

    paciente_id: UUID
    paciente_nome: str
    data_entrada: str
    data_saida: Optional[str] = None
    apache_score: Optional[int] = None
    ventilacao: bool = False
    dias_ventilacao: Optional[int] = None
    status: str = "internado"
    obito: bool = False
    dias_permanencia: Optional[int] = None
    especialidade: str
    medico: Optional[str] = None
    diagnostico: Optional[str] = None
    centro_custo: str
    observacoes: Optional[str] = None


class UTIInternacaoCreate(UTIInternacaoBase):
    """UTI internação creation schema."""

    pass


class UTIInternacaoUpdate(BaseModel):
    """UTI internação update schema."""

    paciente_nome: Optional[str] = None
    data_entrada: Optional[str] = None
    data_saida: Optional[str] = None
    apache_score: Optional[int] = None
    ventilacao: Optional[bool] = None
    dias_ventilacao: Optional[int] = None
    status: Optional[str] = None
    obito: Optional[bool] = None
    dias_permanencia: Optional[int] = None
    especialidade: Optional[str] = None
    medico: Optional[str] = None
    diagnostico: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None


class UTIInternacaoResponse(UTIInternacaoBase):
    """UTI internação response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
