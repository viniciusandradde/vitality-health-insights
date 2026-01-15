"""Nutrição models."""
from sqlalchemy import Column, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class AvaliacaoNutricional(BaseModel):
    """Avaliação nutricional model."""

    __tablename__ = "avaliacoes_nutricionais"

    paciente_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    paciente_nome = Column(String(255), nullable=False)
    data = Column(String, nullable=False, index=True)
    tipo_avaliacao = Column(String(50), nullable=False)  # inicial, seguimento, alta
    imc = Column(Numeric(5, 2), nullable=True)
    peso = Column(Numeric(5, 2), nullable=True)  # em kg
    altura = Column(Numeric(3, 2), nullable=True)  # em metros
    diagnostico = Column(String(100), nullable=True)  # eutrofia, desnutricao, obesidade
    dieta = Column(String(100), nullable=True)  # tipo de dieta prescrita
    profissional = Column(String(255), nullable=False)
    centro_custo = Column(String(100), nullable=False, index=True)
    observacoes = Column(String(500), nullable=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
