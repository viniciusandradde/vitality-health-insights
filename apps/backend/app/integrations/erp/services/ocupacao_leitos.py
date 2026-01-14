"""Service for Ocupacao Leitos Dashboard."""
from typing import Optional
from uuid import UUID

from app.integrations.erp.repository import ERPRepository
from app.integrations.erp.config import ERPConfig
from app.integrations.erp.cache import ERPCache
from app.integrations.erp.mappers.ocupacao_leitos import OcupacaoLeitosMapper
from app.integrations.erp.schemas.ocupacao_leitos import OcupacaoLeitosDashboardResponse
from app.core.database import AsyncSessionLocal


class OcupacaoLeitosService:
    """
    Service para dashboard de Ocupacao de Leitos
    
    Tela: OcupacaoLeitosDashboard
    
    Queries utilizadas:
        - leitos_operacionais.sql (cards)
        - leitos_ocupacao.sql (tabela)
        - convenios_ocupacao.sql (pie convenio)
        - especialidades_ocupacao.sql (pie especialidade)
        - evolucao_ocupacao.sql (grafico)
    """
    
    def __init__(self, config: ERPConfig):
        self.repository = ERPRepository(config)
        self.cache = ERPCache()
        self.mapper = OcupacaoLeitosMapper()
        self.config = config
    
    @classmethod
    async def create(cls, tenant_id: UUID):
        """Factory method para criar o service com configuracao do tenant."""
        async with AsyncSessionLocal() as db:
            config = await ERPConfig.from_tenant(tenant_id, db)
            if not config:
                raise ValueError(f"ERP config not found for tenant {tenant_id}")
            return cls(config)
    
    async def get_dashboard_completo(
        self,
        periodo: str = "mes",
        centro_custo: Optional[str] = None,
    ) -> OcupacaoLeitosDashboardResponse:
        """Retorna todos os dados do dashboard de ocupacao de leitos."""
        
        # Buscar cards operacionais
        cards_data = await self.repository.execute_query("leitos_operacionais")
        cards = self.mapper.map_cards_operacionais(cards_data[0] if cards_data else {})
        
        # Donut chart
        donut = self.mapper.map_donut_ocupacao(cards.ocupado, cards.livre)
        
        # Tabela por centro de custo
        tabela_data = await self.repository.execute_query("leitos_ocupacao")
        tabela = self.mapper.map_tabela_centro_custo(tabela_data)
        
        # Pie charts
        convenio_data = await self.repository.execute_query("convenios_ocupacao")
        pie_convenio = self.mapper.map_pie_convenio(convenio_data)
        
        especialidade_data = await self.repository.execute_query("especialidades_ocupacao")
        pie_especialidade = self.mapper.map_pie_especialidade(especialidade_data)
        
        # TreeMap e evolucao
        treemap = self.mapper.map_treemap(tabela_data)
        
        evolucao_data = await self.repository.execute_query("evolucao_ocupacao")
        evolucao_ocupacao = [
            {
                "data": row.get("data", ""),
                "ocupacao": int(row.get("ocupacao", 0)),
                "total": int(row.get("total", 0)),
            }
            for row in evolucao_data
        ]
        
        return OcupacaoLeitosDashboardResponse(
            cards=cards,
            donut_ocupacao=donut,
            tabela_centro_custo=tabela,
            pie_convenio=pie_convenio,
            pie_especialidade=pie_especialidade,
            treemap_leito_dia=treemap,
            evolucao_ocupacao=evolucao_ocupacao,
        )
