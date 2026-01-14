"""Authentication schemas."""
from typing import Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """Token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token data schema."""

    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    email: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Register request schema."""

    email: EmailStr
    password: str
    full_name: str
    tenant_name: str
    tenant_slug: str


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""

    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request schema."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request schema."""

    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    """Verify email request schema."""

    token: str
