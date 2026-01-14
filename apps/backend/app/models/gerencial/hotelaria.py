"""Hotelaria models."""
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class ServicoHotelaria(BaseModel):
    """Serviço de hotelaria model."""

    __tablename__ = "servicos_hotelaria"

    setor = Column(String(100), nullable=False, index=True)
    tipo_servico = Column(String(100), nullable=False)  # alimentacao, limpeza_quarto, recepcao, etc
    data = Column(String, nullable=False, index=True)
    hora = Column(String(10), nullable=True)
    quantidade = Column(Integer, nullable=True)
    profissional = Column(String(255), nullable=False)
    status = Column(String(50), default="agendado", nullable=False)  # agendado, em_andamento, concluido, cancelado
    observacoes = Column(String(500), nullable=True)
    centro_custo = Column(String(100), nullable=False, index=True)

    # Foreign keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
