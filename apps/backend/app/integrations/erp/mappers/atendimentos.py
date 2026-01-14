"""Mapper for Atendimentos Dashboard."""
from typing import List, Dict, Any
from collections import Counter
from app.integrations.erp.schemas.atendimentos import (
    AtendimentosKPIs,
    AtendimentoPorTipoData,
    AtendimentoPorConvenioData,
    AtendimentoPorHorarioData,
)


class AtendimentosMapper:
    """Mapper para traduzir dados ERP -> AtendimentosDashboard"""
    
    @staticmethod
    def map_kpis(erp_rows: List[Dict[str, Any]]) -> AtendimentosKPIs:
        """
        Tela: AtendimentosDashboard - KPIs principais
        Query: atendimentos_ambulatorio.sql
        """
        total = len(erp_rows)
        tipos = set(row.get("tipo", "") for row in erp_rows)
        convenios = set(row.get("convenio", "") for row in erp_rows if row.get("convenio"))
        
        # Top especialidade
        especialidades = Counter(row.get("especialidade", "") for row in erp_rows if row.get("especialidade"))
        top_esp = especialidades.most_common(1)
        
        return AtendimentosKPIs(
            total_ambulatoriais=total,
            tipos_atendimento=len(tipos),
            top_especialidade=top_esp[0][0] if top_esp else "N/A",
            total_convenios=len(convenios),
        )
    
    @staticmethod
    def map_por_tipo(erp_rows: List[Dict[str, Any]]) -> List[AtendimentoPorTipoData]:
        """
        Tela: AtendimentosDashboard - Atendimentos por Tipo
        Query: atendimentos_ambulatorio.sql (agregado)
        """
        tipos = Counter(row.get("tipo", "Outros") for row in erp_rows)
        return [
            AtendimentoPorTipoData(name=tipo, value=count)
            for tipo, count in tipos.most_common()
        ]
    
    @staticmethod
    def map_por_categoria_convenio(erp_rows: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Tela: AtendimentosDashboard - Por Categoria de Convenio
        Query: atendimentos_ambulatorio.sql (agregado)
        """
        categorias = Counter(row.get("categoria_convenio", "outros") for row in erp_rows)
        return dict(categorias)
    
    @staticmethod
    def map_por_faixa_etaria(erp_rows: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Tela: AtendimentosDashboard - Por Faixa Etaria
        Query: atendimentos_ambulatorio.sql (agregado)
        """
        def get_faixa(idade: Any) -> str:
            if idade is None:
                return "Indefinido"
            try:
                idade_int = int(idade)
                if idade_int < 18:
                    return "0-17"
                elif idade_int < 30:
                    return "18-29"
                elif idade_int < 40:
                    return "30-39"
                elif idade_int < 50:
                    return "40-49"
                elif idade_int < 60:
                    return "50-59"
                else:
                    return "60+"
            except (ValueError, TypeError):
                return "Indefinido"
        
        faixas = Counter(get_faixa(row.get("idade")) for row in erp_rows)
        return dict(faixas)
    
    @staticmethod
    def map_por_horario(erp_rows: List[Dict[str, Any]]) -> List[AtendimentoPorHorarioData]:
        """
        Tela: AtendimentosDashboard - Por Faixa Horaria
        Query: atendimentos_hora.sql
        """
        return [
            AtendimentoPorHorarioData(
                horario=row.get("hora", ""),
                quantidade=int(row.get("value", 0)),
            )
            for row in erp_rows
        ]
