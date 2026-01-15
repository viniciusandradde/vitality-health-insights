"""Dashboard KPIs schemas."""
from typing import Optional
from pydantic import BaseModel
from decimal import Decimal


class KPIsResponse(BaseModel):
    """KPIs response schema."""

    total_internacoes: int
    total_atendimentos: int
    taxa_ocupacao: Decimal
    tempo_medio_permanencia: Decimal
    total_leitos: int
    leitos_ocupados: int
    leitos_disponiveis: int
    pacientes_dia: int
    leitos_dia: int
