"""Settings models."""
from app.models.settings.integracoes import Integracao
from app.models.settings.modulos import ModuloConfig
from app.models.settings.notificacoes import NotificacaoConfig
from app.models.settings.seguranca import SegurancaConfig

__all__ = [
    "ModuloConfig",
    "Integracao",
    "NotificacaoConfig",
    "SegurancaConfig",
]
