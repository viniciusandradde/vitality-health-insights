#!/bin/bash

# Script para executar queries SQL no banco de dados

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

if [ -z "$1" ]; then
    echo "Uso: $0 '<SQL_QUERY>'"
    echo ""
    echo "Exemplos:"
    echo "  $0 'SELECT version();'"
    echo "  $0 'SELECT COUNT(*) FROM information_schema.tables;'"
    echo "  $0 '\dt'  # Listar tabelas"
    echo "  $0 '\l'   # Listar databases"
    exit 1
fi

QUERY="$1"

# Detectar se precisa usar sudo
DOCKER_CMD="docker"
if ! docker ps > /dev/null 2>&1; then
    DOCKER_CMD="sudo docker"
fi

# Verificar se container está rodando
if ! $DOCKER_CMD ps | grep -q vsa_postgres_dev; then
    echo "❌ Container PostgreSQL não está rodando!"
    echo "Para iniciar: ./scripts/dev-docker.sh start"
    exit 1
fi

# Executar query
$DOCKER_CMD exec vsa_postgres_dev psql -U vsa_user -d vsa_analytics -c "$QUERY"
