"""Dashboard internacoes schemas."""
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from decimal import Decimal


class InternacaoDashboardItem(BaseModel):
    """Internacao dashboard item."""

    id: UUID
    paciente_nome: str
    data_entrada: str
    data_saida: Optional[str] = None
    centro_custo: str
    especialidade: str
    status: str
    dias_permanencia: Optional[int] = None

    class Config:
        from_attributes = True


class InternacoesResponse(BaseModel):
    """Internacoes response schema."""

    total: int
    internados: int
    altas: int
    obitos: int
    transferencias: int
    items: List[InternacaoDashboardItem]
    taxa_ocupacao: Decimal
    tempo_medio_permanencia: Decimal
