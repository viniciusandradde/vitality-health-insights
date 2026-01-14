"""Service for Atendimentos Dashboard."""
from typing import Optional
from datetime import date, timedelta
from uuid import UUID

from app.integrations.erp.repository import ERPRepository
from app.integrations.erp.config import ERPConfig
from app.integrations.erp.cache import ERPCache
from app.integrations.erp.mappers.atendimentos import AtendimentosMapper
from app.integrations.erp.schemas.atendimentos import AtendimentosDashboardResponse
from app.core.database import get_db


class AtendimentosService:
    """
    Service para dashboard de Atendimentos
    
    Tela: AtendimentosDashboard
    
    Queries utilizadas:
        - atendimentos_ambulatorio.sql (lista completa)
        - atendimentos_hora.sql (grafico horario)
    """
    
    def __init__(self, config: ERPConfig):
        self.repository = ERPRepository(config)
        self.cache = ERPCache()
        self.mapper = AtendimentosMapper()
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
    ) -> AtendimentosDashboardResponse:
        """Retorna todos os dados do dashboard de atendimentos."""
        
        # Definir intervalo de datas
        data_fim = date.today()
        data_inicio = data_fim - timedelta(days=30 if periodo == "mes" else 7)
        params = {
            "data_inicio": data_inicio.isoformat(),
            "data_fim": data_fim.isoformat(),
        }
        
        # Buscar atendimentos
        atendimentos = await self.repository.execute_query("atendimentos_ambulatorio", params)
        
        # KPIs
        kpis = self.mapper.map_kpis(atendimentos)
        
        # Agregacoes
        por_tipo = self.mapper.map_por_tipo(atendimentos)
        por_categoria = self.mapper.map_por_categoria_convenio(atendimentos)
        por_faixa = self.mapper.map_por_faixa_etaria(atendimentos)
        
        # Por convenio
        from collections import Counter
        from app.integrations.erp.schemas.atendimentos import AtendimentoPorConvenioData
        
        convenios = Counter(row.get("convenio", "Outros") for row in atendimentos if row.get("convenio"))
        por_convenio = [
            AtendimentoPorConvenioData(convenio=k, total=v)
            for k, v in convenios.most_common(10)
        ]
        
        # Top especialidades
        from app.integrations.erp.schemas.atendimentos import AtendimentoPorTipoData
        especialidades = Counter(row.get("especialidade", "Outros") for row in atendimentos if row.get("especialidade"))
        top_esp = [
            AtendimentoPorTipoData(name=k, value=v)
            for k, v in especialidades.most_common(10)
        ]
        
        # Por horario
        horarios = await self.repository.execute_query("atendimentos_hora")
        por_horario = self.mapper.map_por_horario(horarios)
        
        return AtendimentosDashboardResponse(
            kpis=kpis,
            por_tipo=por_tipo,
            por_categoria_convenio=por_categoria,
            por_convenio=por_convenio,
            por_tipo_servico={},
            top_especialidades=top_esp,
            por_faixa_etaria=por_faixa,
            por_horario=por_horario,
        )
