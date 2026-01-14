"""User admin schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserAdminCreate(BaseModel):
    """User creation schema for admin."""

    email: EmailStr
    password: str
    full_name: str
    role_id: UUID
    phone: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None


class UserAdminUpdate(BaseModel):
    """User update schema for admin."""

    full_name: Optional[str] = None
    role_id: Optional[UUID] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
