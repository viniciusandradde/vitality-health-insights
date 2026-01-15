"""ERP integration service - orchestration and business logic."""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.erp.cache import ERPCache
from app.integrations.erp.config import ERPConfig
from app.integrations.erp.exceptions import (
    ERPConnectionError,
    ERPRateLimitError,
    ERPTimeoutError,
)
from app.integrations.erp.mappers import (
    AtendimentoMapper,
    EstoqueMapper,
    FaturamentoMapper,
    InternacaoMapper,
    PacienteMapper,
)
from app.integrations.erp.repository import ERPRepository

logger = logging.getLogger(__name__)

# Rate limiting: queries per minute per tenant
RATE_LIMIT_QUERIES_PER_MINUTE = 60

# Rate limit tracking: {tenant_id: [timestamps]}
_rate_limit_tracker: dict[UUID, list[datetime]] = {}


class ERPService:
    """Service for ERP integration."""

    def __init__(self, config: ERPConfig):
        """Initialize service with ERP configuration."""
        self.config = config
        self.repository = ERPRepository(config)
        self.cache = ERPCache()

    async def _check_rate_limit(self) -> None:
        """Check and enforce rate limiting."""
        now = datetime.utcnow()
        minute_ago = now - timedelta(minutes=1)

        # Get or create tracker for tenant
        if self.config.tenant_id not in _rate_limit_tracker:
            _rate_limit_tracker[self.config.tenant_id] = []

        # Clean old timestamps
        tracker = _rate_limit_tracker[self.config.tenant_id]
        tracker[:] = [ts for ts in tracker if ts > minute_ago]

        # Check limit
        if len(tracker) >= RATE_LIMIT_QUERIES_PER_MINUTE:
            raise ERPRateLimitError(
                f"Rate limit exceeded: {RATE_LIMIT_QUERIES_PER_MINUTE} queries per minute"
            )

        # Add current timestamp
        tracker.append(now)

    async def _get_with_cache(
        self,
        domain: str,
        query_name: str,
        params: dict[str, Any],
        mapper_class: type,
    ) -> list[dict[str, Any]]:
        """Get data with cache support."""
        # Check cache first
        cached = await self.cache.get(self.config.tenant_id, domain, params)
        if cached:
            logger.info(f"Cache hit for {domain} (tenant {self.config.tenant_id})")
            return cached

        # Check rate limit
        await self._check_rate_limit()

        # Execute query
        logger.info(f"Cache miss for {domain} (tenant {self.config.tenant_id})")
        erp_data = await self.repository.execute_query(query_name, params)

        # Map to domain
        mapped_data = [mapper_class.map_erp_to_domain(row) for row in erp_data]

        # Cache result
        await self.cache.set(self.config.tenant_id, domain, mapped_data, params)

        return mapped_data

    async def get_pacientes(
        self, limit: int = 20, offset: int = 0
    ) -> list[dict[str, Any]]:
        """Get pacientes from ERP."""
        params = {"limit": limit, "offset": offset}
        return await self._get_with_cache(
            "pacientes", "pacientes", params, PacienteMapper
        )

    async def get_atendimentos(
        self, data_inicio: Optional[str] = None, data_fim: Optional[str] = None, limit: int = 20, offset: int = 0
    ) -> list[dict[str, Any]]:
        """Get movimentação (admissões, altas, transferências) from ERP."""
        # A query de movimentação não precisa de parâmetros de data
        # Ela usa CURRENT_DATE internamente
        params = {}
        return await self._get_with_cache(
            "atendimentos", "atendimentos", params, AtendimentoMapper
        )

    async def get_faturamento(
        self, data_inicio: str, data_fim: str, limit: int = 20, offset: int = 0
    ) -> list[dict[str, Any]]:
        """Get faturamento from ERP."""
        params = {
            "data_inicio": data_inicio,
            "data_fim": data_fim,
            "limit": limit,
            "offset": offset,
        }
        return await self._get_with_cache(
            "faturamento", "faturamento", params, FaturamentoMapper
        )

    async def get_estoque(
        self,
        categoria: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """Get estoque from ERP."""
        params = {"categoria": categoria, "limit": limit, "offset": offset}
        return await self._get_with_cache("estoque", "estoque", params, EstoqueMapper)

    async def get_internacoes(
        self, data_inicio: str, data_fim: str, limit: int = 20, offset: int = 0
    ) -> list[dict[str, Any]]:
        """Get internacoes from ERP."""
        params = {
            "data_inicio": data_inicio,
            "data_fim": data_fim,
            "limit": limit,
            "offset": offset,
        }
        return await self._get_with_cache(
            "internacoes", "internacoes", params, InternacaoMapper
        )

    async def test_connection(self) -> bool:
        """Test ERP connection."""
        try:
            from app.integrations.erp.client import test_erp_connection

            return await test_erp_connection(self.config)
        except Exception as e:
            logger.error(f"ERP connection test failed: {e}")
            return False

    async def invalidate_cache(self, domain: Optional[str] = None) -> None:
        """Invalidate cache for tenant."""
        await self.cache.invalidate(self.config.tenant_id, domain)

    async def close(self) -> None:
        """Close connections and cleanup."""
        await self.cache.close()
