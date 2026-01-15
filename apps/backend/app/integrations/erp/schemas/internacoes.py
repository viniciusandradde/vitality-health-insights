"""Schemas for Internacoes Dashboard."""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class InternacoesKPIs(BaseModel):
    """KPIs principais de internacoes"""
    taxa_ocupacao: float
    media_permanencia: float
    intervalo_substituicao: float
    rotatividade_leitos: int
    obitos: int
    internacoes_ps: int
    taxa_infeccao: float


class EntradaSaidaData(BaseModel):
    """Entradas e saidas por data"""
    data: str
    entradas: int
    saidas: int


class PacienteDiaLeitoDiaData(BaseModel):
    """Paciente-dia x Leito-dia"""
    data: str
    paciente_dia: int
    leito_dia: int


class OcupacaoCentroCustoData(BaseModel):
    """Ocupacao por centro de custo"""
    centro_custo: str
    leitos_cadastrados: int
    leitos_ocupados: int
    leitos_vagos: int
    leitos_censo: int
    taxa_ocupacao: float


class ProvenienciaData(BaseModel):
    """Proveniencia de internacoes"""
    proveniencia: str
    quantidade: int


class ClassificacaoRiscoData(BaseModel):
    """Classificacao de risco"""
    classificacao: str
    quantidade: int


class InternacoesDashboardResponse(BaseModel):
    """Response completo do dashboard de internacoes"""
    kpis: InternacoesKPIs
    entradas_saidas: List[EntradaSaidaData]
    paciente_dia_leito_dia: List[PacienteDiaLeitoDiaData]
    ocupacao_centro_custo: List[OcupacaoCentroCustoData]
    top_proveniencias: List[ProvenienciaData]
    classificacao_risco: List[ClassificacaoRiscoData]
    internacoes_ps_medico: List[Dict[str, Any]]
    internacoes_ps_especialidade: List[Dict[str, Any]]
