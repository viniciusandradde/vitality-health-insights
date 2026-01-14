"""Alembic environment configuration."""
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# Import models for autogenerate
from app.models import Base
from app.models.tenant import Tenant
from app.models.user import User, Role
from app.models.subscription import Plan, Subscription, Invoice
from app.models.audit import AuditLog
from app.models.assistencial.atendimentos import Atendimento
from app.models.assistencial.internacao import Internacao, Leito
from app.models.assistencial.ambulatorio import AmbulatorioConsulta
from app.models.assistencial.agendas import Agendamento
from app.models.assistencial.exames_lab import ExameLaboratorial
from app.models.assistencial.exames_imagem import ExameImagem
from app.models.assistencial.transfusional import Transfusao
from app.models.assistencial.farmacia import Prescricao
from app.models.assistencial.ccih import Infeccao
from app.models.assistencial.fisioterapia import SessaoFisioterapia
from app.models.assistencial.nutricao import AvaliacaoNutricional
from app.models.assistencial.uti import UTIInternacao
from app.models.gerencial.estoque import ItemEstoque
from app.models.gerencial.faturamento import Faturamento
from app.models.gerencial.financeiro import MovimentacaoFinanceira
from app.models.gerencial.higienizacao import ServicoHigienizacao
from app.models.gerencial.lavanderia import ServicoLavanderia
from app.models.gerencial.sesmt import OcorrenciaSESMT
from app.models.gerencial.ti import ChamadoTI
from app.models.gerencial.hotelaria import ServicoHotelaria
from app.models.gerencial.spp import AtividadeSPP
from app.models.gerencial.nutricao_gerencial import RefeicaoGerencial
from app.models.settings.modulos import ModuloConfig
from app.models.settings.integracoes import Integracao
from app.models.settings.notificacoes import NotificacaoConfig
from app.models.settings.seguranca import SegurancaConfig
from app.core.config import settings

# this is the Alembic Config object
config = context.config

# Override sqlalchemy.url with settings
config.set_main_option("sqlalchemy.url", settings.database_url_async.replace("+asyncpg", ""))

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
