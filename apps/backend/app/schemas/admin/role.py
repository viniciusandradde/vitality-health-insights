"""Role admin schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RoleBase(BaseModel):
    """Base role schema."""

    name: str
    description: Optional[str] = None
    permissions: Optional[str] = None  # JSON string


class RoleCreate(RoleBase):
    """Role creation schema."""

    pass


class RoleUpdate(BaseModel):
    """Role update schema."""

    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[str] = None


class RoleResponse(RoleBase):
    """Role response schema."""

    id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
