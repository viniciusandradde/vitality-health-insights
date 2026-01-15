"""Authentication service."""
from datetime import timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import Token, TokenData


class AuthService:
    """Authentication service."""

    @staticmethod
    async def authenticate_user(
        db: AsyncSession, email: str, password: str
    ) -> Optional[User]:
        """Authenticate user by email and password."""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        if not user.is_active:
            return None

        return user

    @staticmethod
    async def create_tokens(user: User) -> Token:
        """Create access and refresh tokens for user."""
        token_data = TokenData(
            user_id=str(user.id),
            tenant_id=str(user.tenant_id),
            email=user.email,
        )

        access_token = create_access_token(
            data=token_data.model_dump(),
            expires_delta=timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        refresh_token = create_refresh_token(data=token_data.model_dump())

        return Token(access_token=access_token, refresh_token=refresh_token)

    @staticmethod
    async def verify_token(token: str) -> Optional[TokenData]:
        """Verify and decode token."""
        payload = decode_token(token)
        if not payload:
            return None

        return TokenData(**payload)

    @staticmethod
    async def hash_password(password: str) -> str:
        """Hash password."""
        return get_password_hash(password)
