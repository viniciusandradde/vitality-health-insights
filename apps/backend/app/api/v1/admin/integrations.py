"""Integration admin routes."""
import json
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, require_admin_role
from app.core.database import get_db
from app.models.settings.integracoes import Integracao
from app.models.user import User
from app.schemas.admin.integration import IntegrationAdminResponse, IntegrationAdminUpdate

router = APIRouter(prefix="/integrations", tags=["Admin - Integrations"])


@router.get("", response_model=List[IntegrationAdminResponse], status_code=status.HTTP_200_OK)
async def list_integrations(
    skip: int = 0,
    limit: int = 100,
    tenant_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
    response: Response = None,
):
    """List all integrations (admin can filter by tenant)."""
    # Build query
    query = select(Integracao).where(Integracao.deleted_at.is_(None))

    # Filter by tenant if provided (master can see all, admin sees only their tenant)
    if tenant_id:
        query = query.where(Integracao.tenant_id == tenant_id)
    elif current_user.role and current_user.role.name.lower() == "admin":
        # Admin users can only see their own tenant's integrations
        query = query.where(Integracao.tenant_id == current_user.tenant_id)

    # Get total count
    count_query = select(func.count(Integracao.id)).where(
        Integracao.deleted_at.is_(None)
    )
    if tenant_id:
        count_query = count_query.where(Integracao.tenant_id == tenant_id)
    elif current_user.role and current_user.role.name.lower() == "admin":
        count_query = count_query.where(Integracao.tenant_id == current_user.tenant_id)

    count_result = await db.execute(count_query)
    total = count_result.scalar_one()

    # Get integrations
    result = await db.execute(query.offset(skip).limit(limit))
    integrations = list(result.scalars().all())

    # Parse config JSON strings
    for integration in integrations:
        if integration.config and isinstance(integration.config, str):
            try:
                integration.config = json.loads(integration.config)
            except json.JSONDecodeError:
                integration.config = {}

    # Add pagination headers for React Admin
    if response:
        response.headers["X-Total-Count"] = str(total)
        response.headers["Content-Range"] = (
            f"items {skip}-{skip+len(integrations)-1}/{total}"
        )

    return integrations


@router.get(
    "/{integration_id}", response_model=IntegrationAdminResponse, status_code=status.HTTP_200_OK
)
async def get_integration(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Get integration by ID."""
    query = select(Integracao).where(Integracao.id == integration_id)

    # Admin users can only see their own tenant's integrations
    if current_user.role and current_user.role.name.lower() == "admin":
        query = query.where(Integracao.tenant_id == current_user.tenant_id)

    result = await db.execute(query)
    integration = result.scalar_one_or_none()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found"
        )

    # Parse config JSON string
    if integration.config and isinstance(integration.config, str):
        try:
            integration.config = json.loads(integration.config)
        except json.JSONDecodeError:
            integration.config = {}

    return integration


@router.put(
    "/{integration_id}",
    response_model=IntegrationAdminResponse,
    status_code=status.HTTP_200_OK,
)
async def update_integration(
    integration_id: UUID,
    integration_data: IntegrationAdminUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role),
):
    """Update integration."""
    query = select(Integracao).where(Integracao.id == integration_id)

    # Admin users can only update their own tenant's integrations
    if current_user.role and current_user.role.name.lower() == "admin":
        query = query.where(Integracao.tenant_id == current_user.tenant_id)

    result = await db.execute(query)
    integration = result.scalar_one_or_none()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found"
        )

    update_data = integration_data.model_dump(exclude_unset=True)

    # Convert config dict to JSON string if provided
    if "config" in update_data and update_data["config"] is not None:
        update_data["config"] = json.dumps(update_data["config"])

    for field, value in update_data.items():
        setattr(integration, field, value)

    await db.commit()
    await db.refresh(integration)

    # Parse config JSON string for response
    if integration.config and isinstance(integration.config, str):
        try:
            integration.config = json.loads(integration.config)
        except json.JSONDecodeError:
            integration.config = {}

    return integration
