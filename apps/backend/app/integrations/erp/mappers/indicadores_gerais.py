"""Mapper for Indicadores Gerais Dashboard."""
import json
from typing import List, Dict, Any
from app.integrations.erp.schemas.indicadores_gerais import (
    KPICardData,
    AtendimentoHoraData,
    OcupacaoSetorData,
    ChartData,
)


class IndicadoresGeraisMapper:
    """Mapper para traduzir dados ERP -> IndicadoresGeraisDashboard"""
    
    @staticmethod
    def map_kpis(erp_data: Dict[str, Any]) -> List[KPICardData]:
        """
        Tela: IndicadoresGeraisDashboard - KPIs principais
        Query: ocupacao_geral.sql
        """
        atendimentos_data = erp_data.get("atendimentos", {})
        if isinstance(atendimentos_data, str):
            atendimentos_data = json.loads(atendimentos_data)
        
        ocupacao_uti = erp_data.get("ocupacao_uti", {})
        if isinstance(ocupacao_uti, str):
            ocupacao_uti = json.loads(ocupacao_uti)
        
        cirurgias = erp_data.get("cirurgias", {})
        if isinstance(cirurgias, str):
            cirurgias = json.loads(cirurgias)
        
        leitos_gerais = erp_data.get("leitos_gerais", {})
        if isinstance(leitos_gerais, str):
            leitos_gerais = json.loads(leitos_gerais)
        
        variacao = atendimentos_data.get("variacao_percentual", 0)
        trend_label = "crescente" if variacao > 0 else "decrescente" if variacao < 0 else "estavel"
        
        return [
            KPICardData(
                title="Atendimentos Hoje",
                value=str(atendimentos_data.get("hoje", 0)),
                trend_value=abs(variacao),
                trend_label=trend_label,
                description=f"vs. ontem: {atendimentos_data.get('ontem', 0)}",
            ),
            KPICardData(
                title="Taxa Ocupação UTI",
                value=f"{ocupacao_uti.get('taxa_ocupacao', 0)}%",
                trend_value=ocupacao_uti.get("taxa_ocupacao", 0),
                trend_label=ocupacao_uti.get("status", "normal"),
                description=f"{ocupacao_uti.get('ocupados', 0)}/{ocupacao_uti.get('total_leitos', 0)} leitos",
            ),
            KPICardData(
                title="Cirurgias Realizadas",
                value=str(cirurgias.get("realizadas", 0)),
                trend_value=cirurgias.get("taxa_conclusao", 0),
                trend_label="realizadas",
                description=f"Total: {cirurgias.get('total_hoje', 0)}",
            ),
            KPICardData(
                title="Leitos Disponíveis",
                value=str(leitos_gerais.get("disponiveis", 0)),
                description=f"de {leitos_gerais.get('total', 0)} total",
            ),
        ]
    
    @staticmethod
    def map_atendimentos_hora(erp_rows: List[Dict[str, Any]]) -> List[AtendimentoHoraData]:
        """
        Tela: IndicadoresGeraisDashboard - Atendimentos por Hora
        Query: atendimentos_hora.sql
        """
        return [
            AtendimentoHoraData(
                hora=row.get("hora", ""),
                value=int(row.get("value", 0)),
            )
            for row in erp_rows
        ]
    
    @staticmethod
    def map_top_especialidades(erp_rows: List[Dict[str, Any]]) -> List[ChartData]:
        """
        Tela: IndicadoresGeraisDashboard - Top Especialidades
        Query: (agregado de atendimentos)
        """
        return [
            ChartData(
                name=row.get("especialidade", "Outros"),
                value=int(row.get("quantidade", 0)),
            )
            for row in erp_rows[:10]
        ]
    
    @staticmethod
    def map_distribuicao_convenio(erp_rows: List[Dict[str, Any]]) -> List[ChartData]:
        """
        Tela: IndicadoresGeraisDashboard - Distribuicao Convenio
        Query: (agregado de atendimentos)
        """
        return [
            ChartData(
                name=row.get("convenio", "Outros"),
                value=int(row.get("quantidade", 0)),
            )
            for row in erp_rows[:10]
        ]
