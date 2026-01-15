"""SESMT schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class OcorrenciaSESMTBase(BaseModel):
    """Base ocorrência SESMT schema."""

    tipo_ocorrencia: str
    data: str
    setor: str
    funcionario: Optional[str] = None
    descricao: str
    gravidade: str
    status: str = "registrado"
    medidas_tomadas: Optional[str] = None
    centro_custo: str
    observacoes: Optional[str] = None


class OcorrenciaSESMTCreate(OcorrenciaSESMTBase):
    """Ocorrência SESMT creation schema."""

    pass


class OcorrenciaSESMTUpdate(BaseModel):
    """Ocorrência SESMT update schema."""

    tipo_ocorrencia: Optional[str] = None
    data: Optional[str] = None
    setor: Optional[str] = None
    funcionario: Optional[str] = None
    descricao: Optional[str] = None
    gravidade: Optional[str] = None
    status: Optional[str] = None
    medidas_tomadas: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None


class OcorrenciaSESMTResponse(OcorrenciaSESMTBase):
    """Ocorrência SESMT response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
