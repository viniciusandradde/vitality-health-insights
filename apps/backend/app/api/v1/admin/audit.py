"""Audit log admin routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user
from app.core.database import get_db
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.admin.audit import AuditLogFilter, AuditLogResponse

router = APIRouter(prefix="/audit-logs", tags=["Admin - Audit"])


@router.get("", response_model=List[AuditLogResponse], status_code=status.HTTP_200_OK)
async def list_audit_logs(
    filters: AuditLogFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List audit logs with filters."""
    query = select(AuditLog)

    conditions = []
    if filters.tenant_id:
        conditions.append(AuditLog.tenant_id == filters.tenant_id)
    if filters.user_id:
        conditions.append(AuditLog.user_id == filters.user_id)
    if filters.action:
        conditions.append(AuditLog.action == filters.action)
    if filters.resource:
        conditions.append(AuditLog.resource == filters.resource)
    if filters.start_date:
        conditions.append(AuditLog.created_at >= filters.start_date)
    if filters.end_date:
        conditions.append(AuditLog.created_at <= filters.end_date)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(AuditLog.created_at.desc())
    query = query.offset(filters.offset).limit(filters.limit)

    result = await db.execute(query)
    logs = list(result.scalars().all())
    return logs


@router.get("/metrics", status_code=status.HTTP_200_OK)
async def get_audit_metrics(
    tenant_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get audit metrics."""
    # TODO: Implement metrics aggregation
    return {
        "total_logs": 0,
        "logs_today": 0,
        "top_actions": [],
        "top_resources": [],
    }
