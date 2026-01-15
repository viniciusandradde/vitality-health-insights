"""Role admin routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, require_admin_role
from app.core.database import get_db
from app.models.user import Role, User
from app.schemas.admin.role import RoleCreate, RoleResponse, RoleUpdate

router = APIRouter(prefix="/roles", tags=["Admin - Roles"])


@router.get("", response_model=List[RoleResponse], status_code=status.HTTP_200_OK)
async def list_roles(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
    response: Response = None,
):
    """List all roles."""
    # Get total count
    count_result = await db.execute(select(func.count(Role.id)))
    total = count_result.scalar_one()

    # Get roles
    result = await db.execute(
        select(Role).where(Role.deleted_at.is_(None)).offset(skip).limit(limit)
    )
    roles = list(result.scalars().all())

    # Add pagination headers for React Admin
    if response:
        response.headers["X-Total-Count"] = str(total)
        response.headers["Content-Range"] = f"items {skip}-{skip+len(roles)-1}/{total}"

    return roles


@router.post("", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_data: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Create a new role."""
    # Check if role name already exists
    result = await db.execute(select(Role).where(Role.name == role_data.name))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Role name already exists"
        )

    role = Role(
        name=role_data.name,
        description=role_data.description,
        permissions=role_data.permissions,
    )
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return role


@router.get("/{role_id}", response_model=RoleResponse, status_code=status.HTTP_200_OK)
async def get_role(
    role_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Get role by ID."""
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
        )
    return role


@router.put("/{role_id}", response_model=RoleResponse, status_code=status.HTTP_200_OK)
async def update_role(
    role_id: UUID,
    role_data: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Update role."""
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
        )

    # Check if new name conflicts with existing role
    if role_data.name and role_data.name != role.name:
        existing = await db.execute(
            select(Role).where(Role.name == role_data.name, Role.id != role_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already exists",
            )

    update_data = role_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(role, field, value)

    await db.commit()
    await db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Delete role (soft delete)."""
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
        )

    # Check if role is in use
    users_result = await db.execute(
        select(func.count(User.id)).where(User.role_id == role_id)
    )
    user_count = users_result.scalar_one()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete role. {user_count} user(s) are using this role.",
        )

    from datetime import datetime

    role.deleted_at = datetime.utcnow()
    await db.commit()
