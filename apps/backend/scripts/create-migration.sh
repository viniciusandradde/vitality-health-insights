#!/bin/bash

# Script para criar migration inicial
# Execute este script quando o banco de dados estiver rodando

cd "$(dirname "$0")/.." || exit 1

echo "📝 Criando migration inicial com todos os models..."
echo ""

# Verificar se o banco está acessível
python -c "
from app.core.config import settings
import psycopg2
try:
    conn = psycopg2.connect(settings.DATABASE_URL.replace('+asyncpg', ''))
    conn.close()
    print('✅ Conexão com banco OK')
except Exception as e:
    print(f'❌ Erro ao conectar: {e}')
    exit(1)
" || {
    echo ""
    echo "⚠️  Banco de dados não está acessível."
    echo "   Certifique-se de que o PostgreSQL está rodando."
    echo ""
    echo "Para iniciar o banco:"
    echo "  ./scripts/dev-docker.sh start"
    echo ""
    exit 1
}

echo ""
echo "🔨 Criando migration com autogenerate..."
python -m alembic revision --autogenerate -m "initial_migration_all_models"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration criada com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "  1. Revisar a migration em: alembic/versions/"
    echo "  2. Aplicar a migration: python -m alembic upgrade head"
    echo ""
else
    echo ""
    echo "❌ Erro ao criar migration"
    exit 1
fi
