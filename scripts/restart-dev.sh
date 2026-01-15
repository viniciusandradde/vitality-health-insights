#!/bin/bash

# ==============================================================================
# Script para reiniciar containers de desenvolvimento SEM perder dados do banco
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.dev.yml"

echo "🔄 Reiniciando containers de desenvolvimento..."
echo "📁 Projeto: $PROJECT_ROOT"
echo ""

# Função para reiniciar apenas containers específicos (preserva banco)
restart_app_containers() {
    echo "⏹️  Parando containers de aplicação..."
    sudo docker-compose -f "$COMPOSE_FILE" stop backend frontend admin
    
    echo "🗑️  Removendo containers de aplicação..."
    sudo docker-compose -f "$COMPOSE_FILE" rm -f backend frontend admin
    
    echo "🔨 Reconstruindo containers..."
    sudo docker-compose -f "$COMPOSE_FILE" build --no-cache backend frontend admin
    
    echo "🚀 Iniciando todos os containers..."
    sudo docker-compose -f "$COMPOSE_FILE" up -d
    
    echo ""
    echo "✅ Containers reiniciados! O banco de dados foi preservado."
}

# Função para reiniciar TUDO (incluindo banco - CUIDADO!)
restart_all() {
    echo "⚠️  ATENÇÃO: Isso vai APAGAR o banco de dados!"
    read -p "Tem certeza? (digite 'sim' para confirmar): " confirm
    if [ "$confirm" != "sim" ]; then
        echo "Operação cancelada."
        exit 0
    fi
    
    echo "⏹️  Parando todos os containers..."
    sudo docker-compose -f "$COMPOSE_FILE" down -v
    
    echo "🔨 Reconstruindo containers..."
    sudo docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    echo "🚀 Iniciando containers..."
    sudo docker-compose -f "$COMPOSE_FILE" up -d
    
    echo ""
    echo "✅ Todos os containers foram recriados do zero."
}

# Menu
echo "Escolha uma opção:"
echo "  1) Reiniciar apenas apps (backend, frontend, admin) - PRESERVA banco"
echo "  2) Reiniciar TUDO incluindo banco - APAGA dados"
echo "  3) Apenas rebuild do admin"
echo ""
read -p "Opção (1/2/3): " option

case $option in
    1)
        restart_app_containers
        ;;
    2)
        restart_all
        ;;
    3)
        echo "🔄 Reconstruindo apenas o admin..."
        sudo docker-compose -f "$COMPOSE_FILE" stop admin
        sudo docker-compose -f "$COMPOSE_FILE" rm -f admin
        sudo docker volume rm docker_admin_node_modules 2>/dev/null || true
        sudo docker-compose -f "$COMPOSE_FILE" build --no-cache admin
        sudo docker-compose -f "$COMPOSE_FILE" up -d admin
        echo "✅ Admin reconstruído!"
        ;;
    *)
        echo "Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "📊 Status dos containers:"
sudo docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo "📋 URLs disponíveis:"
echo "   Frontend: http://localhost:3000"
echo "   Admin:    http://localhost:3001"
echo "   API:      http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
