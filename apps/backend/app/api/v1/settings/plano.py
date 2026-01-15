"""Settings Plano/Faturamento routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.subscription import Plan, Subscription
from app.models.user import User
from app.schemas.settings.plano import PlanoResponse

router = APIRouter(prefix="/plano", tags=["Settings - Plano/Faturamento"])


@router.get("", response_model=PlanoResponse, status_code=status.HTTP_200_OK)
async def get_plano(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get plano e faturamento atual do tenant."""
    # Buscar subscription ativa (mais recente)
    result = await db.execute(
        select(Subscription)
        .where(Subscription.tenant_id == tenant_id)
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        return PlanoResponse(
            plan_id=None,
            plan_name="Sem plano",
            plan_type="free",
            status="inactive",
            current_period_start=None,
            current_period_end=None,
            cancel_at_period_end=False,
        )

    # Buscar plan
    result = await db.execute(
        select(Plan).where(Plan.id == subscription.plan_id)
    )
    plan = result.scalar_one_or_none()

    # Plan não tem campo type, usar name para inferir
    plan_type = "unknown"
    if plan:
        plan_name_lower = plan.name.lower()
        if "starter" in plan_name_lower:
            plan_type = "starter"
        elif "professional" in plan_name_lower:
            plan_type = "professional"
        elif "enterprise" in plan_name_lower:
            plan_type = "enterprise"
        elif "free" in plan_name_lower:
            plan_type = "free"

    return PlanoResponse(
        plan_id=subscription.plan_id,
        plan_name=plan.name if plan else "Plano não encontrado",
        plan_type=plan_type,
        status=subscription.status,
        current_period_start=subscription.current_period_start if subscription.current_period_start else None,
        current_period_end=subscription.current_period_end if subscription.current_period_end else None,
        cancel_at_period_end=False,  # TODO: Adicionar campo no model
    )
