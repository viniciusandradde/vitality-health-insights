"""Tenant service."""
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tenant import Tenant
from app.schemas.admin.tenant import TenantCreate, TenantUpdate


class TenantService:
    """Tenant service."""

    @staticmethod
    async def create_tenant(db: AsyncSession, tenant_data: TenantCreate) -> Tenant:
        """Create a new tenant."""
        tenant = Tenant(**tenant_data.model_dump())
        db.add(tenant)
        await db.commit()
        await db.refresh(tenant)
        return tenant

    @staticmethod
    async def get_tenant(db: AsyncSession, tenant_id: UUID) -> Optional[Tenant]:
        """Get tenant by ID."""
        result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_tenants(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> list[Tenant]:
        """Get all tenants."""
        result = await db.execute(select(Tenant).offset(skip).limit(limit))
        return list(result.scalars().all())

    @staticmethod
    async def get_tenants_count(db: AsyncSession) -> int:
        """Get total count of tenants."""
        from sqlalchemy import func
        result = await db.execute(select(func.count(Tenant.id)))
        return result.scalar_one()

    @staticmethod
    async def update_tenant(
        db: AsyncSession, tenant_id: UUID, tenant_data: TenantUpdate
    ) -> Optional[Tenant]:
        """Update tenant."""
        tenant = await TenantService.get_tenant(db, tenant_id)
        if not tenant:
            return None

        update_data = tenant_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tenant, field, value)

        await db.commit()
        await db.refresh(tenant)
        return tenant

    @staticmethod
    async def delete_tenant(db: AsyncSession, tenant_id: UUID) -> bool:
        """Delete tenant (soft delete)."""
        tenant = await TenantService.get_tenant(db, tenant_id)
        if not tenant:
            return False

        # Soft delete
        from datetime import datetime
        tenant.deleted_at = datetime.utcnow()
        await db.commit()
        return True
