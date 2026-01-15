"""Dashboard ocupacao schemas."""
from typing import List
from pydantic import BaseModel
from decimal import Decimal


class OcupacaoLeitoItem(BaseModel):
    """Ocupacao leito item."""

    centro_custo: str
    leitos_cadastrados: int
    leitos_ocupados: int
    leitos_vagos: int
    taxa_ocupacao: Decimal


class OcupacaoResponse(BaseModel):
    """Ocupacao response schema."""

    total_leitos: int
    leitos_ocupados: int
    leitos_disponiveis: int
    taxa_ocupacao_geral: Decimal
    por_centro_custo: List[OcupacaoLeitoItem]
    por_tipo: dict[str, int]
    por_convenio: dict[str, int]
