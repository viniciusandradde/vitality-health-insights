"""Settings Plano/Faturamento schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class PlanoResponse(BaseModel):
    """Plano response schema."""

    plan_id: Optional[UUID] = None
    plan_name: str
    plan_type: str  # free, starter, professional, enterprise
    status: str  # active, canceled, past_due, trialing
    current_period_start: Optional[str] = None
    current_period_end: Optional[str] = None
    cancel_at_period_end: bool = False

    class Config:
        from_attributes = True
