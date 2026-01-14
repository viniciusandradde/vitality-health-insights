"""Billing admin routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user
from app.core.database import get_db
from app.models.audit import AuditLog
from app.models.subscription import Invoice, Subscription
from app.models.user import User
from app.schemas.admin.billing import CheckoutRequest, CheckoutResponse, InvoiceResponse

router = APIRouter(prefix="/billing", tags=["Admin - Billing"])


@router.get("/invoices", response_model=List[InvoiceResponse], status_code=status.HTTP_200_OK)
async def list_invoices(
    tenant_id: UUID | None = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List invoices."""
    query = select(Invoice)
    if tenant_id:
        query = query.where(Invoice.tenant_id == tenant_id)
    result = await db.execute(query.offset(skip).limit(limit))
    invoices = list(result.scalars().all())
    return invoices


@router.post("/checkout", response_model=CheckoutResponse, status_code=status.HTTP_200_OK)
async def create_checkout(
    checkout_data: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create checkout session."""
    # TODO: Integrate with payment provider (Stripe, etc)
    # For now, return mock response
    return CheckoutResponse(
        checkout_url="https://checkout.example.com/session_123",
        session_id="session_123",
    )


@router.put("/tenants/{tenant_id}/plan", status_code=status.HTTP_200_OK)
async def update_tenant_plan(
    tenant_id: UUID,
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update tenant subscription plan."""
    # Get active subscription
    result = await db.execute(
        select(Subscription).where(
            Subscription.tenant_id == tenant_id, Subscription.status == "active"
        )
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active subscription not found",
        )

    subscription.plan_id = plan_id
    await db.commit()
    await db.refresh(subscription)
    return {"message": "Plan updated successfully"}
