"""Exames de imagem models."""
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class ExameImagem(BaseModel):
    """Exame de imagem model."""

    __tablename__ = "exames_imagem"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data_solicitacao = Column(String, nullable=False, index=True)
    data_realizacao = Column(String, nullable=True)
    tipo_exame = Column(String(100), nullable=False, index=True)
    modalidade = Column(String(50), nullable=False)  # raio_x, tomografia, ressonancia, ultrassom, mamografia
    status = Column(String(50), default="solicitado", nullable=False)  # solicitado, agendado, realizado, laudo_liberado, cancelado
    laudo = Column(String, nullable=True)
    medico_solicitante = Column(String(255), nullable=True)
    medico_laudador = Column(String(255), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    convenio = Column(String(100), nullable=True, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
