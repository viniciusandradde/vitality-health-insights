"""Schemas for Indicadores Gerais Dashboard."""
from pydantic import BaseModel
from typing import List, Optional


class KPICardData(BaseModel):
    """Dados de um card KPI"""
    title: str
    value: str
    trend_value: Optional[float] = None
    trend_label: Optional[str] = None
    description: Optional[str] = None
    variant: str = "default"


class AtendimentoHoraData(BaseModel):
    """Atendimentos por hora"""
    hora: str
    value: int


class OcupacaoSetorData(BaseModel):
    """Ocupacao por setor/dia"""
    dia: str
    uti: int
    enfermaria: int
    emergencia: int


class ChartData(BaseModel):
    """Dados genericos para graficos"""
    name: str
    value: int


class IndicadoresGeraisResponse(BaseModel):
    """Response completo do dashboard de indicadores gerais"""
    kpis: List[KPICardData]
    atendimentos_hora: List[AtendimentoHoraData]
    ocupacao_semanal: List[OcupacaoSetorData]
    top_especialidades: List[ChartData]
    distribuicao_convenio: List[ChartData]
