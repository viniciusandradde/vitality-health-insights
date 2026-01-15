"""ERP integration exceptions."""


class ERPIntegrationError(Exception):
    """Base exception for ERP integration errors."""

    pass


class ERPConnectionError(ERPIntegrationError):
    """Failed to connect to ERP database."""

    pass


class ERPQueryError(ERPIntegrationError):
    """Error executing query on ERP database."""

    pass


class ERPMappingError(ERPIntegrationError):
    """Error mapping ERP data to internal domain."""

    pass


class ERPRateLimitError(ERPIntegrationError):
    """Rate limit exceeded for ERP queries."""

    pass


class ERPTimeoutError(ERPIntegrationError):
    """Timeout executing query on ERP."""

    pass


class ERPConfigurationError(ERPIntegrationError):
    """Error in ERP configuration."""

    pass
