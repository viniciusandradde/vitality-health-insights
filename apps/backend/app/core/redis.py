"""Redis configuration for caching."""
import json
from typing import Optional

import redis.asyncio as redis
from app.core.config import settings

# Global redis client
redis_client: Optional[redis.Redis] = None


async def init_redis() -> None:
    """Initialize Redis connection."""
    global redis_client
    redis_client = await redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )


async def close_redis() -> None:
    """Close Redis connection."""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


async def get_redis() -> redis.Redis:
    """Get Redis client."""
    if redis_client is None:
        await init_redis()
    return redis_client


async def cache_get(key: str) -> Optional[str]:
    """Get value from cache."""
    client = await get_redis()
    return await client.get(key)


async def cache_set(key: str, value: str, ttl: Optional[int] = None) -> None:
    """Set value in cache."""
    client = await get_redis()
    ttl = ttl or settings.REDIS_TTL
    await client.setex(key, ttl, value)


async def cache_delete(key: str) -> None:
    """Delete key from cache."""
    client = await get_redis()
    await client.delete(key)


async def cache_get_json(key: str) -> Optional[dict]:
    """Get JSON value from cache."""
    value = await cache_get(key)
    if value:
        return json.loads(value)
    return None


async def cache_set_json(key: str, value: dict, ttl: Optional[int] = None) -> None:
    """Set JSON value in cache."""
    await cache_set(key, json.dumps(value), ttl)
