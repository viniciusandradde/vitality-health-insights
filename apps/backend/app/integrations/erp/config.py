"""ERP integration configuration."""
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.erp.exceptions import ERPConfigurationError
from app.models.settings.integracoes import Integracao


class ERPConfig:
    """ERP connection configuration."""

    def __init__(
        self,
        tenant_id: UUID,
        erp_type: str,
        host: str,
        port: int,
        database: str,
        username: str,
        password: str,
        ssl_mode: Optional[str] = None,
        timeout_seconds: int = 30,
        max_connections: int = 5,
        enabled: bool = True,
    ):
        """Initialize ERP configuration."""
        self.tenant_id = tenant_id
        self.erp_type = erp_type.lower()
        self.host = host
        self.port = port
        self.database = database
        self.username = username
        self.password = password
        self.ssl_mode = ssl_mode or "prefer"
        self.timeout_seconds = timeout_seconds
        self.max_connections = max_connections
        self.enabled = enabled

        self._validate()

    def _validate(self) -> None:
        """Validate configuration."""
        if not self.enabled:
            raise ERPConfigurationError("ERP integration is disabled for this tenant")

        if self.erp_type not in ["postgresql", "sqlserver", "oracle", "mysql"]:
            raise ERPConfigurationError(f"Unsupported ERP type: {self.erp_type}")

        if not all([self.host, self.database, self.username, self.password]):
            raise ERPConfigurationError("Missing required ERP configuration fields")

        if self.port < 1 or self.port > 65535:
            raise ERPConfigurationError(f"Invalid port: {self.port}")

    @property
    def database_url(self) -> str:
        """Get database URL for connection."""
        if self.erp_type == "postgresql":
            ssl_param = f"?sslmode={self.ssl_mode}" if self.ssl_mode else ""
            return f"postgresql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}{ssl_param}"
        elif self.erp_type == "sqlserver":
            return f"mssql+pyodbc://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}?driver=ODBC+Driver+17+for+SQL+Server"
        elif self.erp_type == "mysql":
            return f"mysql+pymysql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"
        elif self.erp_type == "oracle":
            return f"oracle+cx_oracle://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"
        else:
            raise ERPConfigurationError(f"Database URL not implemented for type: {self.erp_type}")

    @property
    def database_url_async(self) -> str:
        """Get async database URL for connection."""
        if self.erp_type == "postgresql":
            # asyncpg não usa sslmode na URL, será configurado via connect_args
            return f"postgresql+asyncpg://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"
        else:
            # Para outros tipos, usar sync por enquanto
            return self.database_url

    @classmethod
    async def from_tenant(
        cls, tenant_id: UUID, db: AsyncSession
    ) -> Optional["ERPConfig"]:
        """Load ERP configuration from Integracao model."""
        result = await db.execute(
            select(Integracao).where(
                Integracao.tenant_id == tenant_id,
                Integracao.tipo == "erp",
                Integracao.ativo == True,
            )
        )
        integracao = result.scalar_one_or_none()

        if not integracao:
            return None

        # Load configuration from JSON
        import json

        try:
            config = json.loads(integracao.config) if integracao.config else {}
        except (json.JSONDecodeError, TypeError):
            config = {}

        try:
            return cls(
                tenant_id=tenant_id,
                erp_type=config.get("erp_type", "postgresql"),
                host=config.get("erp_host", ""),
                port=int(config.get("erp_port", 5432)),
                database=config.get("erp_database_name", ""),
                username=config.get("erp_username", ""),
                password=config.get("erp_password", ""),
                ssl_mode=config.get("erp_ssl_mode", "prefer"),
                timeout_seconds=int(config.get("erp_timeout_seconds", 30)),
                max_connections=int(config.get("erp_max_connections", 5)),
                enabled=config.get("erp_enabled", True),
            )
        except (KeyError, ValueError, TypeError) as e:
            raise ERPConfigurationError(f"Invalid ERP configuration: {e}")
