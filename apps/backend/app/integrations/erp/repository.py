"""ERP repository - execute queries safely."""
import logging
from pathlib import Path
from typing import Any, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

from app.integrations.erp.client import get_erp_engine, validate_query_readonly
from app.integrations.erp.config import ERPConfig
from app.integrations.erp.exceptions import ERPQueryError, ERPTimeoutError

logger = logging.getLogger(__name__)

# Base path for SQL queries
QUERIES_PATH = Path(__file__).parent / "queries"


class ERPRepository:
    """Repository for executing ERP queries."""

    def __init__(self, config: ERPConfig):
        """Initialize repository with ERP configuration."""
        self.config = config
        self.engine: Optional[AsyncEngine] = None

    async def _get_engine(self) -> AsyncEngine:
        """Get or create engine."""
        if not self.engine:
            self.engine = get_erp_engine(self.config)
        return self.engine

    def _load_query(self, query_name: str) -> str:
        """Load SQL query from file."""
        query_file = QUERIES_PATH / f"{query_name}.sql"
        if not query_file.exists():
            raise ERPQueryError(f"Query file not found: {query_name}.sql")

        return query_file.read_text(encoding="utf-8")

    async def execute_query(
        self, query_name: str, parameters: Optional[dict[str, Any]] = None
    ) -> list[dict[str, Any]]:
        """Execute a named query with parameters."""
        try:
            # Load query
            query_sql = self._load_query(query_name)

            # Validate query is read-only
            validate_query_readonly(query_sql)

            # Get engine
            engine = await self._get_engine()

            # Prepare parameters - ensure all required params are present
            params = parameters or {}
            
            # For atendimentos query (movimentação), não precisa de parâmetros de data
            # A query já usa CURRENT_DATE internamente

            # Execute query
            logger.info(
                f"Executing ERP query: {query_name} for tenant {self.config.tenant_id}"
            )

            async with engine.begin() as conn:
                result = await conn.execute(
                    text(query_sql), params
                )
                rows = result.fetchall()

                # Convert to list of dicts
                columns = result.keys()
                return [dict(zip(columns, row)) for row in rows]

        except ERPQueryError:
            raise
        except TimeoutError as e:
            raise ERPTimeoutError(f"Query timeout: {e}") from e
        except Exception as e:
            logger.error(f"Error executing ERP query {query_name}: {e}")
            raise ERPQueryError(f"Failed to execute query: {e}") from e

    async def execute_raw_query(
        self, query_sql: str, parameters: Optional[dict[str, Any]] = None
    ) -> list[dict[str, Any]]:
        """Execute raw SQL query (use with caution)."""
        # Validate query is read-only
        validate_query_readonly(query_sql)

        try:
            engine = await self._get_engine()

            logger.warning(
                f"Executing raw ERP query for tenant {self.config.tenant_id}"
            )

            async with engine.begin() as conn:
                result = await conn.execute(text(query_sql), parameters or {})
                rows = result.fetchall()

                columns = result.keys()
                return [dict(zip(columns, row)) for row in rows]

        except ERPQueryError:
            raise
        except TimeoutError as e:
            raise ERPTimeoutError(f"Query timeout: {e}") from e
        except Exception as e:
            logger.error(f"Error executing raw ERP query: {e}")
            raise ERPQueryError(f"Failed to execute query: {e}") from e
