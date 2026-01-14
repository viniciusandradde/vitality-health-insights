#!/usr/bin/env python3
"""Script para criar integração ERP."""
import asyncio
import json
import sys
from pathlib import Path

# Adicionar o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
# Importar todos os models para resolver relationships
from app.models import Base
from app.models.tenant import Tenant
from app.models.settings.integracoes import Integracao
from app.models.subscription import Subscription  # Importar para resolver relationship
from app.models.user import User


async def create_erp_integration():
    """Criar integração ERP."""
    engine = create_async_engine(settings.database_url_async)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Buscar tenant de teste
        result = await session.execute(select(Tenant).where(Tenant.slug == "hospital-teste"))
        tenant = result.scalar_one_or_none()

        if not tenant:
            print("❌ Tenant não encontrado")
            return

        # Verificar se já existe integração ERP
        result = await session.execute(
            select(Integracao).where(Integracao.tenant_id == tenant.id, Integracao.tipo == "erp")
        )
        existing = result.scalar_one_or_none()

        config_data = {
            "erp_type": "postgresql",
            "erp_host": "10.10.1.2",
            "erp_port": 5432,
            "erp_database_name": "dbhomologa",
            "erp_username": "TI",
            "erp_password": "T3cnologia20",
            "erp_ssl_mode": "prefer",
            "erp_timeout_seconds": 30,
            "erp_max_connections": 5,
            "erp_enabled": True,
        }

        if existing:
            print(f"⚠️  Integração ERP já existe (ID: {existing.id})")
            # Atualizar existente
            existing.nome = "ERP Hospital Principal"
            existing.ativo = True
            existing.config = json.dumps(config_data)
            await session.commit()
            print("✅ Integração ERP atualizada com sucesso!")
        else:
            # Criar nova integração
            integracao = Integracao(
                nome="ERP Hospital Principal",
                tipo="erp",
                ativo=True,
                tenant_id=tenant.id,
                config=json.dumps(config_data),
            )
            session.add(integracao)
            await session.commit()
            await session.refresh(integracao)
            print(f"✅ Integração ERP criada com sucesso! (ID: {integracao.id})")

        print("")
        print("📋 Configuração:")
        print(f"   Nome: ERP Hospital Principal")
        print(f"   Host: 10.10.1.2:5432")
        print(f"   Database: dbhomologa")
        print(f"   Username: TI")
        print(f"   Tenant: {tenant.slug}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_erp_integration())
