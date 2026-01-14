#!/bin/bash

# Script para corrigir dependências do backend no Docker

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

cd "$PROJECT_ROOT"

echo "🔧 Corrigindo dependências do backend..."

# Verificar se container está rodando
if docker ps | grep -q vsa_backend_dev; then
    echo "📦 Container backend está rodando, instalando email-validator..."
    docker exec vsa_backend_dev pip install email-validator==2.1.1
    echo "🔄 Reiniciando container..."
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" restart backend
    echo "✅ Dependência instalada e container reiniciado!"
else
    echo "📦 Container não está rodando."
    echo "🔨 Rebuild necessário para aplicar correção..."
    echo ""
    read -p "Deseja fazer rebuild do backend agora? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔨 Fazendo rebuild do backend..."
        export COMPOSE_HTTP_TIMEOUT=300
        docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" build --no-cache backend
        echo "✅ Rebuild concluído!"
        echo ""
        echo "Para iniciar o backend:"
        echo "  docker-compose -f $DOCKER_DIR/docker-compose.dev.yml up -d backend"
    else
        echo "ℹ️  Para aplicar a correção depois, execute:"
        echo "  docker-compose -f $DOCKER_DIR/docker-compose.dev.yml build --no-cache backend"
    fi
fi
