"""Tenant admin routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import require_admin_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.admin.tenant import TenantCreate, TenantResponse, TenantUpdate
from app.services.admin.tenant_service import TenantService

router = APIRouter(prefix="/tenants", tags=["Admin - Tenants"])


@router.get("", response_model=List[TenantResponse], status_code=status.HTTP_200_OK)
async def list_tenants(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
    response: Response = None,
):
    """List all tenants (admin only)."""
    tenants = await TenantService.get_tenants(db, skip=skip, limit=limit)
    
    # Get total count for pagination
    total = await TenantService.get_tenants_count(db)
    
    # Add pagination headers for React Admin
    if response:
        response.headers["X-Total-Count"] = str(total)
        response.headers["Content-Range"] = f"items {skip}-{skip+len(tenants)-1}/{total}"
    
    return tenants


@router.post("", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_data: TenantCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Create a new tenant."""
    tenant = await TenantService.create_tenant(db, tenant_data)
    return tenant


@router.get("/{tenant_id}", response_model=TenantResponse, status_code=status.HTTP_200_OK)
async def get_tenant(
    tenant_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Get tenant by ID."""
    tenant = await TenantService.get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found"
        )
    return tenant


@router.put("/{tenant_id}", response_model=TenantResponse, status_code=status.HTTP_200_OK)
async def update_tenant(
    tenant_id: UUID,
    tenant_data: TenantUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Update tenant."""
    tenant = await TenantService.update_tenant(db, tenant_id, tenant_data)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found"
        )
    return tenant


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(
    tenant_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Delete tenant (soft delete)."""
    success = await TenantService.delete_tenant(db, tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found"
        )
