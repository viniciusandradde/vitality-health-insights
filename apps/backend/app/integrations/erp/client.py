"""ERP database client - read-only connection."""
import re
from typing import Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.pool import QueuePool

from app.integrations.erp.config import ERPConfig
from app.integrations.erp.exceptions import (
    ERPConnectionError,
    ERPQueryError,
    ERPTimeoutError,
)

# Cache de engines por tenant
_engines_cache: dict[UUID, AsyncEngine] = {}


def validate_query_readonly(query: str) -> None:
    """Validate that query is read-only (only SELECT statements)."""
    # Remove comments and normalize
    query_clean = re.sub(r"--.*$", "", query, flags=re.MULTILINE)
    query_clean = re.sub(r"/\*.*?\*/", "", query_clean, flags=re.DOTALL)
    query_clean = query_clean.strip().upper()

    # Check for forbidden keywords
    forbidden_keywords = [
        "INSERT",
        "UPDATE",
        "DELETE",
        "DROP",
        "CREATE",
        "ALTER",
        "TRUNCATE",
        "GRANT",
        "REVOKE",
        "EXEC",
        "EXECUTE",
        "CALL",
    ]

    for keyword in forbidden_keywords:
        if re.search(rf"\b{keyword}\b", query_clean):
            raise ERPQueryError(f"Forbidden keyword in query: {keyword}")

    # Must start with SELECT or WITH (CTE)
    if not (query_clean.startswith("SELECT") or query_clean.startswith("WITH")):
        raise ERPQueryError("Only SELECT queries are allowed (WITH clauses are permitted)")


def get_erp_engine(config: ERPConfig) -> AsyncEngine:
    """Get or create async engine for ERP connection."""
    if config.tenant_id in _engines_cache:
        return _engines_cache[config.tenant_id]

    # Create async engine with read-only settings
    connect_args = {}
    if config.erp_type == "postgresql":
        # SSL desabilitado por padrão
        connect_args = {
            "server_settings": {
                "application_name": "vsa_analytics_erp_integration",
                "search_path": '"PACIENTE", public',  # Configurar search_path para encontrar tabelas do schema PACIENTE
            },
            "command_timeout": config.timeout_seconds,
            "ssl": False,  # SSL desabilitado
        }
    
    engine = create_async_engine(
        config.database_url_async,
        poolclass=QueuePool,
        pool_size=config.max_connections,
        max_overflow=2,
        pool_pre_ping=True,  # Verify connections before using
        echo=False,
        connect_args=connect_args,
    )

    # Note: Query validation is done in repository before execution
    # Event listeners don't work well with async engines
    
    _engines_cache[config.tenant_id] = engine
    return engine


async def test_erp_connection(config: ERPConfig) -> bool:
    """Test connection to ERP database."""
    try:
        engine = get_erp_engine(config)
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        raise ERPConnectionError(f"Failed to connect to ERP: {e}") from e


async def close_erp_engine(tenant_id: UUID) -> None:
    """Close and remove engine for tenant."""
    if tenant_id in _engines_cache:
        engine = _engines_cache[tenant_id]
        await engine.dispose()
        del _engines_cache[tenant_id]


async def close_all_erp_engines() -> None:
    """Close all ERP engines."""
    for tenant_id in list(_engines_cache.keys()):
        await close_erp_engine(tenant_id)
