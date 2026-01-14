"""Settings Notificações schemas."""
from pydantic import BaseModel


class NotificacoesResponse(BaseModel):
    """Notificações response schema."""

    email_enabled: bool
    email_kpis_diarios: bool
    email_alertas: bool
    push_enabled: bool
    push_alertas_criticos: bool
    sms_enabled: bool
    sms_alertas_criticos: bool

    class Config:
        from_attributes = True


class NotificacoesUpdate(BaseModel):
    """Notificações update schema."""

    email_enabled: bool = None
    email_kpis_diarios: bool = None
    email_alertas: bool = None
    push_enabled: bool = None
    push_alertas_criticos: bool = None
    sms_enabled: bool = None
    sms_alertas_criticos: bool = None
