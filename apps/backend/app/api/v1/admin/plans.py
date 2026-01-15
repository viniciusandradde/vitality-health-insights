"""Plan admin routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user
from app.core.database import get_db
from app.models.subscription import Plan
from app.models.user import User
from app.schemas.admin.plan import PlanCreate, PlanResponse, PlanUpdate

router = APIRouter(prefix="/plans", tags=["Admin - Plans"])


@router.get("", response_model=List[PlanResponse], status_code=status.HTTP_200_OK)
async def list_plans(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all plans."""
    result = await db.execute(select(Plan).offset(skip).limit(limit))
    plans = list(result.scalars().all())
    return plans


@router.post("", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    plan_data: PlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new plan."""
    plan = Plan(**plan_data.model_dump())
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan


@router.get("/{plan_id}", response_model=PlanResponse, status_code=status.HTTP_200_OK)
async def get_plan(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get plan by ID."""
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found"
        )
    return plan


@router.put("/{plan_id}", response_model=PlanResponse, status_code=status.HTTP_200_OK)
async def update_plan(
    plan_id: UUID,
    plan_data: PlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update plan."""
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found"
        )

    update_data = plan_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)

    await db.commit()
    await db.refresh(plan)
    return plan
