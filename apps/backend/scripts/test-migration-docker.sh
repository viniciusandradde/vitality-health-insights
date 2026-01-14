#!/bin/bash

# Script para testar criação de migration usando Docker
# Este script executa dentro do container do backend

cd "$(dirname "$0")/.." || exit 1

echo "🧪 Testando criação de migration com Docker..."
echo ""

# Verificar se o container está rodando
if ! docker ps | grep -q vsa_backend_dev; then
    echo "❌ Container vsa_backend_dev não está rodando"
    echo "   Inicie com: ./scripts/dev-docker.sh start-all"
    exit 1
fi

echo "✅ Container backend encontrado"
echo ""

# Verificar conexão com banco
echo "📋 Verificando conexão com banco..."
docker exec vsa_backend_dev python -c "
from app.core.config import settings
import psycopg2
try:
    conn = psycopg2.connect(settings.DATABASE_URL.replace('+asyncpg', ''))
    conn.close()
    print('✅ Conexão com banco OK')
except Exception as e:
    print(f'❌ Erro: {e}')
    exit(1)
" || {
    echo "❌ Erro ao conectar com banco"
    exit 1
}

echo ""
echo "🔨 Criando migration..."
docker exec vsa_backend_dev python -m alembic revision --autogenerate -m "initial_migration_all_models"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration criada com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "  1. Revisar a migration em: alembic/versions/"
    echo "  2. Aplicar: docker exec vsa_backend_dev python -m alembic upgrade head"
    echo ""
else
    echo ""
    echo "❌ Erro ao criar migration"
    exit 1
fi
