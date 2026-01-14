#!/bin/bash

# Script específico para testar conexão do backend com banco

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Detectar se precisa usar sudo
DOCKER_CMD="docker"
if ! docker ps > /dev/null 2>&1; then
    DOCKER_CMD="sudo docker"
fi

echo "🔍 Testando conexão do backend com banco de dados..."
echo ""

# Verificar se container backend está rodando
if ! $DOCKER_CMD ps | grep -q vsa_backend_dev; then
    echo "❌ Container backend não está rodando!"
    echo ""
    echo "Para iniciar:"
    echo "  docker-compose -f docker/docker-compose.dev.yml up -d backend"
    exit 1
fi

echo "✅ Container backend está rodando"
echo ""

# Verificar variáveis de ambiente
echo "📋 Verificando configuração do backend..."
echo ""
echo "DATABASE_URL:"
$DOCKER_CMD exec vsa_backend_dev env | grep DATABASE_URL || echo "   ⚠️  DATABASE_URL não encontrado"
echo ""

# Testar conexão Python
echo "🧪 Testando conexão Python com SQLAlchemy..."
echo ""

RESULT=$($DOCKER_CMD exec vsa_backend_dev python -c "
import asyncio
import sys

async def test_connection():
    try:
        from app.core.database import engine, AsyncSessionLocal
        
        # Teste 1: Verificar engine
        print('✅ Engine importado com sucesso')
        
        # Teste 2: Criar sessão e testar query
        async with AsyncSessionLocal() as session:
            from sqlalchemy import text
            result = await session.execute(text('SELECT 1 as test, version() as version'))
            row = result.fetchone()
            if row:
                print(f'✅ Query executada com sucesso')
                print(f'   Test value: {row[0]}')
                print(f'   PostgreSQL version: {row[1][:50]}...')
                return True
            else:
                print('❌ Query não retornou resultado')
                return False
    except ImportError as e:
        print(f'❌ Erro de importação: {e}')
        return False
    except Exception as e:
        print(f'❌ Erro na conexão: {type(e).__name__}: {e}')
        import traceback
        traceback.print_exc()
        return False

result = asyncio.run(test_connection())
sys.exit(0 if result else 1)
" 2>&1)

EXIT_CODE=$?

echo "$RESULT"
echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "═══════════════════════════════════════════════════════════"
    echo "✅ Conexão do backend com banco de dados OK!"
    echo "═══════════════════════════════════════════════════════════"
else
    echo "═══════════════════════════════════════════════════════════"
    echo "❌ Falha na conexão do backend com banco de dados"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "💡 Troubleshooting:"
    echo ""
    echo "1. Verificar se PostgreSQL está rodando:"
    echo "   $DOCKER_CMD ps | grep postgres"
    echo ""
    echo "2. Verificar DATABASE_URL no container:"
    echo "   $DOCKER_CMD exec vsa_backend_dev env | grep DATABASE"
    echo ""
    echo "3. Testar conexão direta do backend para postgres:"
    echo "   $DOCKER_CMD exec vsa_backend_dev ping -c 1 postgres"
    echo ""
    echo "4. Ver logs do backend:"
    echo "   $DOCKER_CMD logs vsa_backend_dev"
    echo ""
    echo "5. Verificar rede Docker:"
    echo "   $DOCKER_CMD network inspect vsa_network"
    exit 1
fi
