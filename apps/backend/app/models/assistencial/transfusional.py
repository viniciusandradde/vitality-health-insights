"""Agência transfusional models."""
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class Transfusao(BaseModel):
    """Transfusão model."""

    __tablename__ = "transfusoes"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data = Column(String, nullable=False, index=True)
    hora = Column(String(10), nullable=True)
    tipo_sangue = Column(String(10), nullable=False)  # A+, A-, B+, B-, AB+, AB-, O+, O-
    quantidade = Column(Integer, nullable=False)  # em ml
    hemocomponente = Column(String(50), nullable=False)  # concentrado_hemacias, plasma, plaquetas, crioprecipitado
    status = Column(String(50), default="solicitado", nullable=False)  # solicitado, liberado, em_transfusao, concluido, cancelado
    reacao = Column(String(50), nullable=True)  # nenhuma, leve, moderada, grave
    medico_solicitante = Column(String(255), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
