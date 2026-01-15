"""Service for Indicadores Gerais Dashboard."""
from typing import Optional
from uuid import UUID

from app.integrations.erp.repository import ERPRepository
from app.integrations.erp.config import ERPConfig
from app.integrations.erp.cache import ERPCache
from app.integrations.erp.mappers.indicadores_gerais import IndicadoresGeraisMapper
from app.integrations.erp.schemas.indicadores_gerais import IndicadoresGeraisResponse
from app.core.database import AsyncSessionLocal


class IndicadoresGeraisService:
    """
    Service para dashboard de Indicadores Gerais
    
    Tela: IndicadoresGeraisDashboard
    
    Queries utilizadas:
        - ocupacao_geral.sql (KPIs principais)
        - atendimentos_hora.sql (grafico por hora)
    """
    
    def __init__(self, config: ERPConfig):
        self.repository = ERPRepository(config)
        self.cache = ERPCache()
        self.mapper = IndicadoresGeraisMapper()
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
        periodo: str = "dia",
        setor: Optional[str] = None,
    ) -> IndicadoresGeraisResponse:
        """Retorna todos os dados do dashboard de indicadores gerais."""
        
        # Buscar KPIs principais
        ocupacao_data = await self.repository.execute_query("ocupacao_geral")
        kpis_data = ocupacao_data[0] if ocupacao_data else {}
        kpis = self.mapper.map_kpis(kpis_data)
        
        # Atendimentos por hora
        atendimentos_hora_data = await self.repository.execute_query("atendimentos_hora")
        atendimentos_hora = self.mapper.map_atendimentos_hora(atendimentos_hora_data)
        
        # Top especialidades (agregado - pode ser calculado depois)
        top_especialidades = []
        
        # Distribuicao convenio (agregado - pode ser calculado depois)
        distribuicao_convenio = []
        
        # Ocupacao semanal (pode ser calculado depois)
        ocupacao_semanal = []
        
        return IndicadoresGeraisResponse(
            kpis=kpis,
            atendimentos_hora=atendimentos_hora,
            ocupacao_semanal=ocupacao_semanal,
            top_especialidades=top_especialidades,
            distribuicao_convenio=distribuicao_convenio,
        )
