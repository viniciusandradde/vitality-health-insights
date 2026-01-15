"""Settings Organização schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class OrganizacaoResponse(BaseModel):
    """Organização response schema."""

    id: UUID
    name: str
    slug: str
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    timezone: str
    language: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class OrganizacaoUpdate(BaseModel):
    """Organização update schema."""

    name: Optional[str] = None
    slug: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
