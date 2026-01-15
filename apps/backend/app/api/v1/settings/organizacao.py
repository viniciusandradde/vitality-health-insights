"""Settings Organização routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.settings.organizacao import OrganizacaoResponse, OrganizacaoUpdate

router = APIRouter(prefix="/organizacao", tags=["Settings - Organização"])


@router.get("", response_model=OrganizacaoResponse, status_code=status.HTTP_200_OK)
async def get_organizacao(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get configurações da organização (tenant)."""
    from sqlalchemy import select

    result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant não encontrado"
        )

    return OrganizacaoResponse(
        id=tenant.id,
        name=tenant.name,
        slug=tenant.slug,
        logo_url=tenant.logo_url,
        primary_color=tenant.primary_color,
        timezone=tenant.timezone or "America/Sao_Paulo",
        language=tenant.language or "pt-BR",
        created_at=tenant.created_at.isoformat() if tenant.created_at else None,
        updated_at=tenant.updated_at.isoformat() if tenant.updated_at else None,
    )


@router.put("", response_model=OrganizacaoResponse, status_code=status.HTTP_200_OK)
async def update_organizacao(
    organizacao_data: OrganizacaoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update configurações da organização (tenant)."""
    from sqlalchemy import select

    result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant não encontrado"
        )

    update_data = organizacao_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tenant, field, value)

    await db.commit()
    await db.refresh(tenant)

    return OrganizacaoResponse(
        id=tenant.id,
        name=tenant.name,
        slug=tenant.slug,
        logo_url=tenant.logo_url,
        primary_color=tenant.primary_color,
        timezone=tenant.timezone or "America/Sao_Paulo",
        language=tenant.language or "pt-BR",
        created_at=tenant.created_at.isoformat() if tenant.created_at else None,
        updated_at=tenant.updated_at.isoformat() if tenant.updated_at else None,
    )
