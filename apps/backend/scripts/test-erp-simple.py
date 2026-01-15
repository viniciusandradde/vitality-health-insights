#!/usr/bin/env python3
"""Script para testar query diretamente no ERP sem modelos."""
import asyncio
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Configuração direta do ERP (sem passar pelo banco principal)
ERP_HOST = "10.1.30.2"
ERP_PORT = 5432
ERP_DATABASE = "dbhomologa"
ERP_USERNAME = "TI"
ERP_PASSWORD = "T3cnologia20"

async def test():
    # Conectar diretamente ao ERP
    database_url = f"postgresql+asyncpg://{ERP_USERNAME}:{ERP_PASSWORD}@{ERP_HOST}:{ERP_PORT}/{ERP_DATABASE}"
    
    engine = create_async_engine(
        database_url,
        echo=False,
        connect_args={
            "ssl": False,
            "server_settings": {
                "search_path": '"PACIENTE", public'
            }
        }
    )
    
    print("🔌 Conectando ao ERP...")
    print(f"   Host: {ERP_HOST}:{ERP_PORT}")
    print(f"   Database: {ERP_DATABASE}")
    print("")
    
    async with engine.begin() as conn:
        # Testar CURRENT_DATE
        result = await conn.execute(text("SELECT CURRENT_DATE as data_atual, CURRENT_TIMESTAMP as timestamp_atual"))
        row = result.fetchone()
        print(f"📅 Data atual no ERP: {row[0]}")
        print(f"🕐 Timestamp atual no ERP: {row[1]}")
        print("")
        
        # Carregar query
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
                    tipo = type(value).__name__
                    print(f"   {key}: {value} (tipo: {tipo})")
                    # Se for string numérica, mostrar conversão
                    if isinstance(value, str):
                        if value.isdigit():
                            print(f"      -> como int: {int(value)}")
                        elif value.replace('.', '', 1).replace('-', '', 1).isdigit():
                            print(f"      -> como float: {float(value)}")
            
            print("")
            print("-" * 80)
        else:
            print("⚠️  Query executada, mas nenhum registro encontrado")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test())
