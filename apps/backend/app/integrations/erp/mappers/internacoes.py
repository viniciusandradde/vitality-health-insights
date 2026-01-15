"""Mapper for Internacoes Dashboard."""
from typing import List, Dict, Any
from app.integrations.erp.schemas.internacoes import (
    InternacoesKPIs,
    EntradaSaidaData,
    PacienteDiaLeitoDiaData,
    OcupacaoCentroCustoData,
    ProvenienciaData,
    ClassificacaoRiscoData,
)


class InternacoesMapper:
    """Mapper para traduzir dados ERP -> InternacoesDashboard"""
    
    @staticmethod
    def map_kpis(erp_data: Dict[str, Any], total_leitos: int) -> InternacoesKPIs:
        """
        Tela: InternacoesDashboard - KPIs principais
        Query: internacoes_indicadores.sql
        """
        ocupados = int(erp_data.get("total_internacoes", 0))
        taxa_ocupacao = (ocupados / total_leitos * 100) if total_leitos > 0 else 0
        
        return InternacoesKPIs(
            taxa_ocupacao=round(taxa_ocupacao, 2),
            media_permanencia=float(erp_data.get("media_permanencia", 0) or 0),
            intervalo_substituicao=0,  # Calculado separadamente
            rotatividade_leitos=int(erp_data.get("entradas_hoje", 0)) + int(erp_data.get("saidas_hoje", 0)),
            obitos=int(erp_data.get("obitos", 0)),
            internacoes_ps=int(erp_data.get("internacoes_ps", 0)),
            taxa_infeccao=0,  # Dados de CCIH separados
        )
    
    @staticmethod
    def map_entradas_saidas(erp_rows: List[Dict[str, Any]]) -> List[EntradaSaidaData]:
        """
        Tela: InternacoesDashboard - Grafico Entradas x Saidas
        Query: entradas_saidas.sql
        """
        return [
            EntradaSaidaData(
                data=row.get("data", ""),
                entradas=int(row.get("entradas", 0)),
                saidas=int(row.get("saidas", 0)),
            )
            for row in erp_rows
        ]
    
    @staticmethod
    def map_ocupacao_centro_custo(erp_rows: List[Dict[str, Any]]) -> List[OcupacaoCentroCustoData]:
        """
        Tela: InternacoesDashboard - Ocupacao por Centro de Custo
        Query: leitos_ocupacao.sql
        """
        return [
            OcupacaoCentroCustoData(
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
    def map_proveniencias(erp_rows: List[Dict[str, Any]]) -> List[ProvenienciaData]:
        """
        Tela: InternacoesDashboard - Top Proveniencias
        Query: proveniencias.sql (se existir)
        """
        return [
            ProvenienciaData(
                proveniencia=row.get("proveniencia", "Outros"),
                quantidade=int(row.get("quantidade", 0)),
            )
            for row in erp_rows[:10]
        ]
