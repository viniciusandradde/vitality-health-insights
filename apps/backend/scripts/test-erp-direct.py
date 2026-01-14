#!/usr/bin/env python3
"""Script para testar query de atendimentos diretamente no ERP."""
import asyncio
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Adicionar o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.tenant import Tenant
from app.models.settings.integracoes import Integracao
from app.integrations.erp.config import ERPConfig
from app.integrations.erp.client import get_erp_engine


async def test_direct_erp():
    """Testar query diretamente no ERP."""
    # Conectar ao banco principal apenas para buscar config
    main_engine = create_async_engine(settings.database_url_async)
    main_session = sessionmaker(main_engine, class_=AsyncSession, expire_on_commit=False)

    try:
        async with main_session() as session:
            # Buscar tenant
            result = await session.execute(select(Tenant).where(Tenant.slug == "hospital-teste"))
            tenant = result.scalar_one_or_none()

            if not tenant:
                print("❌ Tenant não encontrado")
                return

            # Buscar integração ERP
            result = await session.execute(
                select(Integracao).where(
                    Integracao.tenant_id == tenant.id,
                    Integracao.tipo == "erp",
                    Integracao.ativo == True,
                )
            )
            integracao = result.scalar_one_or_none()

            if not integracao:
                print("❌ Integração ERP não encontrada ou inativa")
                return

            print("✅ Integração ERP encontrada")
            print(f"   Nome: {integracao.nome}")
            print("")

            # Carregar configuração
            config = await ERPConfig.from_tenant(tenant.id, session)
            if not config:
                print("❌ Falha ao carregar configuração ERP")
                return

            print("📋 Configuração ERP:")
            print(f"   Host: {config.host}:{config.port}")
            print(f"   Database: {config.database}")
            print(f"   Username: {config.username}")
            print(f"   Tipo: {config.erp_type}")
            print("")

            # Conectar ao ERP
            erp_engine = get_erp_engine(config)
            print("🔌 Conectado ao ERP")
            print("")

            # Testar CURRENT_DATE no ERP
            async with erp_engine.begin() as conn:
                result = await conn.execute(text("SELECT CURRENT_DATE as data_atual, CURRENT_TIMESTAMP as timestamp_atual"))
                row = result.fetchone()
                print(f"📅 Data atual no ERP: {row[0]}")
                print(f"🕐 Timestamp atual no ERP: {row[1]}")
                print("")

                # Carregar query do arquivo
                query_path = Path(__file__).parent.parent / "app" / "integrations" / "erp" / "queries" / "atendimentos.sql"
                query_sql = query_path.read_text(encoding="utf-8")
                
                print("📊 Executando query de atendimentos...")
                print("")

                # Executar query
                result = await conn.execute(text(query_sql))
                rows = result.fetchall()
                columns = result.keys()

                if rows:
                    print(f"✅ Query executada com sucesso! {len(rows)} registros encontrados")
                    print("")
                    print("📋 Resultados:")
                    print("-" * 80)

                    for i, row in enumerate(rows, 1):
                        data = dict(zip(columns, row))
                        print(f"\n{i}. Registro:")
                        for key, value in data.items():
                            print(f"   {key}: {value} (tipo: {type(value).__name__})")
                            # Se for string, mostrar também o valor numérico
                            if isinstance(value, str) and value.isdigit():
                                print(f"      -> valor numérico: {int(value)}")
                            elif isinstance(value, str) and value.replace('.', '', 1).isdigit():
                                print(f"      -> valor numérico: {float(value)}")

                    print("")
                    print("-" * 80)
                else:
                    print("⚠️  Query executada, mas nenhum registro encontrado")

            await erp_engine.dispose()

    finally:
        await main_engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_direct_erp())
