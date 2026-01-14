"""Settings Segurança schemas."""
from pydantic import BaseModel


class SegurancaResponse(BaseModel):
    """Segurança response schema."""

    mfa_enabled: bool
    password_min_length: int
    password_require_uppercase: bool
    password_require_lowercase: bool
    password_require_numbers: bool
    password_require_special: bool
    session_timeout_minutes: int
    max_login_attempts: int

    class Config:
        from_attributes = True


class SegurancaUpdate(BaseModel):
    """Segurança update schema."""

    mfa_enabled: bool = None
    password_min_length: int = None
    password_require_uppercase: bool = None
    password_require_lowercase: bool = None
    password_require_numbers: bool = None
    password_require_special: bool = None
    session_timeout_minutes: int = None
    max_login_attempts: int = None
