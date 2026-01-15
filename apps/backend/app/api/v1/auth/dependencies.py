"""Authentication dependencies."""
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, get_db_with_tenant
from app.core.security import decode_token
from app.models.user import User
from app.schemas.auth import TokenData

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user."""
    token = credentials.credentials
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return user


async def get_current_tenant_id(
    current_user: User = Depends(get_current_user),
) -> UUID:
    """Get current tenant ID from authenticated user."""
    return current_user.tenant_id


async def get_db_with_rls(
    tenant_id: UUID = Depends(get_current_tenant_id),
) -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session with RLS configured for current tenant.
    
    This automatically configures Row Level Security by setting the tenant_id
    in the PostgreSQL session, ensuring all queries are filtered by tenant.
    """
    async for session in get_db_with_tenant(tenant_id=tenant_id):
        yield session


async def require_admin_role(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Require user to have admin or master role."""
    from app.models.user import Role
    
    # Load role if not already loaded
    if not current_user.role:
        result = await db.execute(
            select(Role).where(Role.id == current_user.role_id)
        )
        current_user.role = result.scalar_one_or_none()
    
    if not current_user.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User role not found",
        )
    
    # Check if role is admin or master
    role_name = current_user.role.name.lower()
    if role_name not in ["admin", "master"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin or master role required.",
        )
    
    return current_user
