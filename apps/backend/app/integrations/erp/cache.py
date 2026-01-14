"""ERP integration cache with Redis."""
import hashlib
import json
from typing import Any, Optional
from uuid import UUID

import redis.asyncio as aioredis

from app.core.config import settings
from app.integrations.erp.exceptions import ERPConfigurationError

# Cache TTL por tipo de dado (em segundos)
CACHE_TTL = {
    "pacientes": 3600,  # 1 hora
    "atendimentos": 1800,  # 30 minutos
    "faturamento": 1800,  # 30 minutos
    "estoque": 3600,  # 1 hora
    "internacoes": 1800,  # 30 minutos
}


class ERPCache:
    """Cache manager for ERP data."""

    def __init__(self):
        """Initialize cache with Redis connection."""
        self.redis: Optional[aioredis.Redis] = None

    async def _get_redis(self) -> aioredis.Redis:
        """Get or create Redis connection."""
        if not self.redis:
            try:
                self.redis = await aioredis.from_url(
                    settings.REDIS_URL,
                    encoding="utf-8",
                    decode_responses=True,
                )
            except Exception as e:
                raise ERPConfigurationError(f"Failed to connect to Redis: {e}") from e
        return self.redis

    def _make_cache_key(
        self, tenant_id: UUID, domain: str, params: Optional[dict[str, Any]] = None
    ) -> str:
        """Generate cache key."""
        # Hash parameters for key
        params_str = ""
        if params:
            # Sort params for consistent hashing
            sorted_params = sorted(params.items())
            params_str = json.dumps(sorted_params, sort_keys=True)
            params_hash = hashlib.md5(params_str.encode()).hexdigest()[:8]
            params_str = f":{params_hash}"

        return f"erp:{tenant_id}:{domain}{params_str}"

    async def get(
        self, tenant_id: UUID, domain: str, params: Optional[dict[str, Any]] = None
    ) -> Optional[list[dict[str, Any]]]:
        """Get cached data."""
        try:
            redis = await self._get_redis()
            key = self._make_cache_key(tenant_id, domain, params)

            cached = await redis.get(key)
            if cached:
                return json.loads(cached)
            return None
        except Exception:
            # If cache fails, return None (fail open)
            return None

    async def set(
        self,
        tenant_id: UUID,
        domain: str,
        data: list[dict[str, Any]],
        params: Optional[dict[str, Any]] = None,
        ttl: Optional[int] = None,
    ) -> None:
        """Set cached data."""
        try:
            redis = await self._get_redis()
            key = self._make_cache_key(tenant_id, domain, params)

            # Get TTL for domain
            if ttl is None:
                ttl = CACHE_TTL.get(domain, 1800)  # Default 30 minutes

            # Serialize data
            data_json = json.dumps(data)

            # Set with TTL
            await redis.setex(key, ttl, data_json)
        except Exception:
            # If cache fails, silently continue (fail open)
            pass

    async def invalidate(
        self, tenant_id: UUID, domain: Optional[str] = None
    ) -> None:
        """Invalidate cache for tenant and optionally domain."""
        try:
            redis = await self._get_redis()

            if domain:
                # Invalidate specific domain
                pattern = f"erp:{tenant_id}:{domain}:*"
            else:
                # Invalidate all domains for tenant
                pattern = f"erp:{tenant_id}:*"

            # Find all matching keys
            keys = []
            async for key in redis.scan_iter(match=pattern):
                keys.append(key)

            # Delete keys
            if keys:
                await redis.delete(*keys)
        except Exception:
            # If cache fails, silently continue (fail open)
            pass

    async def close(self) -> None:
        """Close Redis connection."""
        if self.redis:
            await self.redis.close()
            self.redis = None
