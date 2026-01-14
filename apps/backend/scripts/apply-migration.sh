#!/bin/bash

# Script para aplicar migrations
# Execute este script para aplicar todas as migrations pendentes

cd "$(dirname "$0")/.." || exit 1

echo "📝 Aplicando migrations..."
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
    exit 1
}

echo ""
echo "🔨 Aplicando migrations..."
python -m alembic upgrade head

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations aplicadas com sucesso!"
    echo ""
else
    echo ""
    echo "❌ Erro ao aplicar migrations"
    exit 1
fi
