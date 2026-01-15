"""Mapper for Ocupacao Leitos Dashboard."""
from typing import List, Dict, Any
from app.integrations.erp.schemas.ocupacao_leitos import (
    LeitosOperacionaisResponse,
    OcupacaoCentroCustoResponse,
    DonutChartData,
    PieChartData,
    TreeMapData,
)


class OcupacaoLeitosMapper:
    """Mapper para traduzir dados ERP -> formato frontend"""
    
    @staticmethod
    def map_cards_operacionais(erp_data: Dict[str, Any]) -> LeitosOperacionaisResponse:
        """
        Tela: OcupacaoLeitosDashboard - Cards principais
        Query: leitos_operacionais.sql
        """
        return LeitosOperacionaisResponse(
            convenio_particular=int(erp_data.get("convenio_particular", 0)),
            sus=int(erp_data.get("sus", 0)),
            ocupado=int(erp_data.get("ocupado", 0)),
            livre=int(erp_data.get("livre", 0)),
            leitos_dia_sim=int(erp_data.get("leitos_dia_sim", 0)),
            total_leitos=int(erp_data.get("total_leitos", 0)),
        )
    
    @staticmethod
    def map_donut_ocupacao(ocupados: int, livres: int) -> List[DonutChartData]:
        """
        Tela: OcupacaoLeitosDashboard - Donut Taxa de Ocupacao
        Query: leitos_operacionais.sql
        """
        return [
            DonutChartData(name="Ocupado", value=ocupados, color="hsl(0, 72%, 50%)"),
            DonutChartData(name="Livre", value=livres, color="hsl(142, 76%, 36%)"),
        ]
    
    @staticmethod
    def map_tabela_centro_custo(erp_rows: List[Dict[str, Any]]) -> List[OcupacaoCentroCustoResponse]:
        """
        Tela: OcupacaoLeitosDashboard - Tabela Ocupacao por CC
        Query: leitos_ocupacao.sql
        """
        return [
            OcupacaoCentroCustoResponse(
                centro_custo=row.get("centro_custo", ""),
                leitos_cadastrados=int(row.get("leitos_cadastrados", 0)),
                leitos_ocupados=int(row.get("leitos_ocupados", 0)),
                leitos_vagos=int(row.get("leitos_vagos", 0)),
                leitos_censo=int(row.get("leitos_censo", 0)),
                taxa_ocupacao=float(row.get("taxa_ocupacao", 0)),
            )
            for row in erp_rows
        ]
    
    @staticmethod
    def map_pie_convenio(erp_rows: List[Dict[str, Any]]) -> List[PieChartData]:
        """
        Tela: OcupacaoLeitosDashboard - Pie Ocupacao por Convenio
        Query: convenios_ocupacao.sql
        """
        total = sum(float(row.get("quantidade", 0)) for row in erp_rows)
        return [
            PieChartData(
                name=row.get("convenio", "Outros"),
                value=round((float(row.get("quantidade", 0)) / total) * 100, 2) if total > 0 else 0,
            )
            for row in erp_rows[:10]  # Top 10
        ]
    
    @staticmethod
    def map_pie_especialidade(erp_rows: List[Dict[str, Any]]) -> List[PieChartData]:
        """
        Tela: OcupacaoLeitosDashboard - Pie Ocupacao por Especialidade
        Query: especialidades_ocupacao.sql
        """
        total = sum(float(row.get("quantidade", 0)) for row in erp_rows)
        return [
            PieChartData(
                name=row.get("especialidade", "Outros"),
                value=round((float(row.get("quantidade", 0)) / total) * 100, 2) if total > 0 else 0,
            )
            for row in erp_rows[:10]  # Top 10
        ]
    
    @staticmethod
    def map_treemap(erp_rows: List[Dict[str, Any]]) -> List[TreeMapData]:
        """
        Tela: OcupacaoLeitosDashboard - TreeMap Leito-Dia
        Query: (calculado a partir de leitos_ocupacao)
        """
        return [
            TreeMapData(
                name=row.get("centro_custo", "Outros"),
                value=int(row.get("leitos_censo", 0)),
            )
            for row in erp_rows
        ]
