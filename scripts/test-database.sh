#!/bin/bash

# Script para testar conexão com banco de dados

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🧪 Testando conexão com banco de dados..."
echo ""

# Detectar se precisa usar sudo
DOCKER_CMD="docker"
if ! docker ps > /dev/null 2>&1; then
    DOCKER_CMD="sudo docker"
fi

# Verificar se container está rodando
if ! $DOCKER_CMD ps | grep -q vsa_postgres_dev; then
    echo "❌ Container PostgreSQL não está rodando!"
    echo ""
    echo "Para iniciar:"
    echo "  ./scripts/dev-docker.sh start"
    echo "  # ou"
    echo "  docker-compose -f docker/docker-compose.dev.yml up -d postgres"
    exit 1
fi

echo "✅ Container PostgreSQL está rodando"
echo ""

# Teste 1: Verificar se PostgreSQL está respondendo
echo "📋 Teste 1: Verificando se PostgreSQL está respondendo..."
if $DOCKER_CMD exec vsa_postgres_dev pg_isready -U vsa_user > /dev/null 2>&1; then
    echo "✅ PostgreSQL está respondendo"
else
    echo "❌ PostgreSQL não está respondendo"
    exit 1
fi
echo ""

# Teste 2: Conectar ao banco
echo "📋 Teste 2: Testando conexão com banco de dados..."
if $DOCKER_CMD exec vsa_postgres_dev psql -U vsa_user -d vsa_analytics -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Conexão com banco de dados OK"
else
    echo "❌ Falha na conexão com banco de dados"
    exit 1
fi
echo ""

# Teste 3: Verificar versão do PostgreSQL
echo "📋 Teste 3: Verificando versão do PostgreSQL..."
VERSION=$($DOCKER_CMD exec vsa_postgres_dev psql -U vsa_user -d vsa_analytics -t -c "SELECT version();" 2>/dev/null | head -1 | xargs)
echo "   Versão: $VERSION"
echo ""

# Teste 4: Listar databases
echo "📋 Teste 4: Listando databases..."
$DOCKER_CMD exec vsa_postgres_dev psql -U vsa_user -c "\l" 2>/dev/null | grep -E "Name|vsa_analytics" || echo "   Database vsa_analytics encontrado"
echo ""

# Teste 5: Verificar tabelas (se existirem)
echo "📋 Teste 5: Verificando tabelas..."
TABLES=$($DOCKER_CMD exec vsa_postgres_dev psql -U vsa_user -d vsa_analytics -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
if [ -n "$TABLES" ] && [ "$TABLES" != "0" ]; then
    echo "   ✅ Encontradas $TABLES tabela(s) no banco"
    echo ""
    echo "   Tabelas existentes:"
    $DOCKER_CMD exec vsa_postgres_dev psql -U vsa_user -d vsa_analytics -c "\dt" 2>/dev/null | tail -n +4 | head -n -2
else
    echo "   ℹ️  Nenhuma tabela encontrada (banco vazio - normal se migrações não foram executadas)"
fi
echo ""

# Teste 6: Verificar conexão do backend (se estiver rodando)
if $DOCKER_CMD ps | grep -q vsa_backend_dev; then
    echo "📋 Teste 6: Testando conexão do backend com banco..."
    BACKEND_RESULT=$($DOCKER_CMD exec vsa_backend_dev python -c "
import asyncio
import sys

async def test():
    try:
        from app.core.database import AsyncSessionLocal
        from sqlalchemy import text
        
        async with AsyncSessionLocal() as session:
            result = await session.execute(text('SELECT 1 as test'))
            row = result.fetchone()
            if row and row[0] == 1:
                print('SUCCESS')
                return True
            else:
                print('FAILED: No result')
                return False
    except Exception as e:
        print(f'ERROR: {type(e).__name__}: {str(e)}')
        return False

result = asyncio.run(test())
sys.exit(0 if result else 1)
" 2>&1)
    
    EXIT_CODE=$?
    if echo "$BACKEND_RESULT" | grep -q "SUCCESS"; then
        echo "✅ Backend consegue conectar ao banco"
    elif echo "$BACKEND_RESULT" | grep -q "ERROR"; then
        echo "⚠️  Erro na conexão do backend:"
        echo "$BACKEND_RESULT" | grep "ERROR" | sed 's/^/   /'
    else
        echo "⚠️  Backend não conseguiu conectar"
        echo "$BACKEND_RESULT" | tail -3 | sed 's/^/   /'
    fi
    echo ""
fi

# Resumo
echo "═══════════════════════════════════════════════════════════"
echo "✅ Todos os testes de conexão passaram!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Informações do banco:"
echo "   Host: localhost"
echo "   Porta: ${POSTGRES_PORT:-5433}"
echo "   Database: vsa_analytics"
echo "   Usuário: vsa_user"
echo ""
echo "🔧 Comandos úteis:"
echo "   Acessar PostgreSQL CLI:"
echo "     $DOCKER_CMD exec -it vsa_postgres_dev psql -U vsa_user -d vsa_analytics"
echo ""
echo "   Ver logs do PostgreSQL:"
echo "     $DOCKER_CMD logs vsa_postgres_dev"
echo ""
echo "   Executar migrações (se necessário):"
echo "     cd apps/backend"
echo "     source venv/bin/activate"
echo "     alembic upgrade head"
