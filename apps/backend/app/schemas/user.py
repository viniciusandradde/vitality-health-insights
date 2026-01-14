"""User schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema."""

    password: str
    role_id: UUID


class UserUpdate(BaseModel):
    """User update schema."""

    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    role_id: Optional[UUID] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """User response schema."""

    id: UUID
    tenant_id: UUID
    role_id: UUID
    is_active: bool
    is_verified: bool
    last_login_at: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
