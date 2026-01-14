"""Schemas for Ocupacao Leitos Dashboard."""
from pydantic import BaseModel
from typing import List, Dict, Any


class LeitosOperacionaisResponse(BaseModel):
    """Cards principais do dashboard de ocupacao"""
    convenio_particular: int
    sus: int
    ocupado: int
    livre: int
    leitos_dia_sim: int
    total_leitos: int


class OcupacaoCentroCustoResponse(BaseModel):
    """Linha da tabela de ocupacao por centro de custo"""
    centro_custo: str
    leitos_cadastrados: int
    leitos_ocupados: int
    leitos_vagos: int
    leitos_censo: int
    taxa_ocupacao: float


class DonutChartData(BaseModel):
    """Dados para donut chart"""
    name: str
    value: int
    color: str


class PieChartData(BaseModel):
    """Dados para pie chart"""
    name: str
    value: float


class TreeMapData(BaseModel):
    """Dados para TreeMap"""
    name: str
    value: int


class OcupacaoLeitosDashboardResponse(BaseModel):
    """Response completo do dashboard de ocupacao"""
    cards: LeitosOperacionaisResponse
    donut_ocupacao: List[DonutChartData]
    tabela_centro_custo: List[OcupacaoCentroCustoResponse]
    pie_convenio: List[PieChartData]
    pie_especialidade: List[PieChartData]
    treemap_leito_dia: List[TreeMapData]
    evolucao_ocupacao: List[Dict[str, Any]]
