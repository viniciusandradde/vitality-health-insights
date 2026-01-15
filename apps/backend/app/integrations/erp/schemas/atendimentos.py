"""Schemas for Atendimentos Dashboard."""
from pydantic import BaseModel
from typing import List, Dict


class AtendimentosKPIs(BaseModel):
    """KPIs principais de atendimentos"""
    total_ambulatoriais: int
    tipos_atendimento: int
    top_especialidade: str
    total_convenios: int


class AtendimentoPorTipoData(BaseModel):
    """Atendimentos por tipo"""
    name: str
    value: int


class AtendimentoPorConvenioData(BaseModel):
    """Atendimentos por convenio"""
    convenio: str
    total: int


class AtendimentoPorHorarioData(BaseModel):
    """Atendimentos por horario"""
    horario: str
    quantidade: int


class AtendimentosDashboardResponse(BaseModel):
    """Response completo do dashboard de atendimentos"""
    kpis: AtendimentosKPIs
    por_tipo: List[AtendimentoPorTipoData]
    por_categoria_convenio: Dict[str, int]
    por_convenio: List[AtendimentoPorConvenioData]
    por_tipo_servico: Dict[str, int]
    top_especialidades: List[AtendimentoPorTipoData]
    por_faixa_etaria: Dict[str, int]
    por_horario: List[AtendimentoPorHorarioData]
