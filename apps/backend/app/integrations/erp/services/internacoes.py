"""Service for Internacoes Dashboard."""
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.erp.repository import ERPRepository
from app.integrations.erp.config import ERPConfig
from app.integrations.erp.cache import ERPCache
from app.integrations.erp.mappers.internacoes import InternacoesMapper
from app.integrations.erp.schemas.internacoes import InternacoesDashboardResponse
from app.core.database import get_db


class InternacoesService:
    """
    Service para dashboard de Internacoes
    
    Tela: InternacoesDashboard
    
    Queries utilizadas:
        - internacoes_indicadores.sql (KPIs)
        - entradas_saidas.sql (grafico)
        - leitos_ocupacao.sql (tabela)
    """
    
    def __init__(self, config: ERPConfig):
        self.repository = ERPRepository(config)
        self.cache = ERPCache()
        self.mapper = InternacoesMapper()
        self.config = config
    
    @classmethod
    async def create(cls, tenant_id: UUID):
        """Factory method para criar o service com configuracao do tenant."""
        async for db in get_db():
            config = await ERPConfig.from_tenant(tenant_id, db)
            if not config:
                raise ValueError(f"ERP config not found for tenant {tenant_id}")
            return cls(config)
    
    async def get_dashboard_completo(
        self,
        periodo: str = "mes",
        centro_custo: Optional[str] = None,
    ) -> InternacoesDashboardResponse:
        """Retorna todos os dados do dashboard de internacoes."""
        
        # Definir intervalo de datas
        from datetime import date, timedelta
        data_fim = date.today()
        data_inicio = data_fim - timedelta(days=30 if periodo == "mes" else 7)
        params = {
            "data_inicio": data_inicio.isoformat(),
            "data_fim": data_fim.isoformat(),
        }
        
        # KPIs principais
        indicadores = await self.repository.execute_query("internacoes_indicadores", params)
        total_leitos = await self._get_total_leitos()
        kpis = self.mapper.map_kpis(indicadores[0] if indicadores else {}, total_leitos)
        
        # Graficos
        entradas_saidas = await self.repository.execute_query("entradas_saidas")
        entradas_saidas_mapped = self.mapper.map_entradas_saidas(entradas_saidas)
        
        # Tabela ocupacao
        ocupacao_cc = await self.repository.execute_query("leitos_ocupacao")
        ocupacao_mapped = self.mapper.map_ocupacao_centro_custo(ocupacao_cc)
        
        # Top proveniencias (vazio por enquanto)
        proveniencias_mapped = []
        
        return InternacoesDashboardResponse(
            kpis=kpis,
            entradas_saidas=entradas_saidas_mapped,
            paciente_dia_leito_dia=[],  # Calculado separadamente
            ocupacao_centro_custo=ocupacao_mapped,
            top_proveniencias=proveniencias_mapped,
            classificacao_risco=[],
            internacoes_ps_medico=[],
            internacoes_ps_especialidade=[],
        )
    
    async def _get_total_leitos(self) -> int:
        """Busca total de leitos cadastrados."""
        result = await self.repository.execute_raw_query(
            'SELECT COUNT(*) as total FROM "PACIENTE".cadlei WHERE leitodia = \'S\' AND tipobloq <> \'D\''
        )
        return int(result[0]["total"]) if result else 0
