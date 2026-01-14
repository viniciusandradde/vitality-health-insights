#!/usr/bin/env python3
"""Script para testar query de atendimentos no ERP."""
import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Adicionar o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.tenant import Tenant
from app.models.settings.integracoes import Integracao
from app.models.subscription import Subscription
from app.integrations.erp.config import ERPConfig
from app.integrations.erp.client import test_erp_connection
from app.integrations.erp.repository import ERPRepository


async def test_atendimentos_query():
    """Testar query de atendimentos no ERP."""
    # Conectar ao banco principal
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
            try:
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

                # Testar conexão
                print("🔌 Testando conexão com ERP...")
                try:
                    connected = await test_erp_connection(config)
                    if connected:
                        print("✅ Conexão com ERP estabelecida com sucesso!")
                    else:
                        print("❌ Falha ao conectar com ERP")
                        return
                except Exception as e:
                    print(f"❌ Erro ao conectar: {e}")
                    import traceback
                    traceback.print_exc()
                    return

                print("")

                # Criar repository
                repository = ERPRepository(config)

                # Executar query de atendimentos
                print("📊 Executando query de atendimentos...")
                print("   Query: atendimentos.sql")
                print("   Parâmetros: limit=10, offset=0")
                print("")

                try:
                    # Parâmetros para a query
                    # O repository vai preencher data_inicio/data_fim automaticamente se não fornecidos
                    end_date = datetime.now()
                    start_date = end_date - timedelta(days=7)
                    params = {
                        "limit": 10,
                        "offset": 0,
                        "data_inicio": start_date.strftime("%Y-%m-%d"),
                        "data_fim": end_date.strftime("%Y-%m-%d"),
                    }

                    results = await repository.execute_query("atendimentos", params)

                    if results:
                        print(f"✅ Query executada com sucesso! {len(results)} registros encontrados")
                        print("")
                        print("📋 Primeiros resultados (RAW do banco):")
                        print("-" * 80)

                        for i, row in enumerate(results[:5], 1):
                            print(f"\n{i}. Registro (RAW):")
                            for key, value in row.items():
                                print(f"   {key}: {value} (tipo: {type(value).__name__})")
                        
                        print("")
                        print("📋 Após mapper:")
                        print("-" * 80)
                        
                        # Testar o mapper
                        from app.integrations.erp.mappers import AtendimentoMapper
                        for i, row in enumerate(results[:5], 1):
                            mapped = AtendimentoMapper.map_erp_to_domain(row)
                            print(f"\n{i}. Registro (MAPPED):")
                            for key, value in mapped.items():
                                if value is not None:
                                    print(f"   {key}: {value} (tipo: {type(value).__name__})")

                        if len(results) > 5:
                            print(f"\n... e mais {len(results) - 5} registros")

                        print("")
                        print("-" * 80)
                        print(f"✅ Total de registros retornados: {len(results)}")
                    else:
                        print("⚠️  Query executada, mas nenhum registro encontrado")
                        print("   (Isso pode ser normal se não houver atendimentos finalizados hoje)")

                except Exception as e:
                    print(f"❌ Erro ao executar query: {e}")
                    import traceback
                    traceback.print_exc()
            except Exception as e:
                print(f"❌ Erro ao carregar configuração: {e}")
                import traceback
                traceback.print_exc()
    finally:
        await main_engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_atendimentos_query())
