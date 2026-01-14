"""User admin routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.admin.user import UserAdminCreate, UserAdminUpdate
from app.schemas.user import UserResponse

router = APIRouter(prefix="/tenants/{tenant_id}/users", tags=["Admin - Users"])


@router.get("", response_model=List[UserResponse], status_code=status.HTTP_200_OK)
async def list_tenant_users(
    tenant_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List users for a tenant."""
    result = await db.execute(
        select(User).where(User.tenant_id == tenant_id).offset(skip).limit(limit)
    )
    users = list(result.scalars().all())
    return users


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant_user(
    tenant_id: UUID,
    user_data: UserAdminCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new user for a tenant."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        tenant_id=tenant_id,
        role_id=user_data.role_id,
        phone=user_data.phone,
        department=user_data.department,
        avatar_url=user_data.avatar_url,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_tenant_user(
    tenant_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user by ID."""
    result = await db.execute(
        select(User).where(User.id == user_id, User.tenant_id == tenant_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def update_tenant_user(
    tenant_id: UUID,
    user_id: UUID,
    user_data: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user."""
    result = await db.execute(
        select(User).where(User.id == user_id, User.tenant_id == tenant_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant_user(
    tenant_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete user."""
    result = await db.execute(
        select(User).where(User.id == user_id, User.tenant_id == tenant_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    from datetime import datetime
    user.deleted_at = datetime.utcnow()
    await db.commit()
