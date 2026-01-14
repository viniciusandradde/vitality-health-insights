"""Audit log schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    """Audit log response schema."""

    id: UUID
    user_id: UUID
    user_name: str
    user_email: str
    tenant_id: UUID
    action: str
    resource: str
    resource_id: Optional[UUID] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class AuditLogFilter(BaseModel):
    """Audit log filter schema."""

    tenant_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    action: Optional[str] = None
    resource: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    limit: int = 100
    offset: int = 0
