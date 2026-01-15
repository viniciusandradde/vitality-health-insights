#!/bin/bash
# Script para corrigir erro 'ContainerConfig' do Docker Compose

set -e

echo "🔧 Corrigindo containers Docker..."

cd "$(dirname "$0")/.."

# Parar todos os containers
echo "📦 Parando containers..."
sudo docker-compose -f docker/docker-compose.dev.yml down

# Remover containers órfãos
echo "🧹 Removendo containers órfãos..."
sudo docker-compose -f docker/docker-compose.dev.yml rm -f

# Remover imagens antigas do admin se existirem
echo "🗑️  Removendo imagens antigas do admin..."
sudo docker rmi vsa-analytics-health-full-admin:latest 2>/dev/null || true
sudo docker rmi $(sudo docker images | grep "admin" | awk '{print $3}') 2>/dev/null || true

# Limpar volumes não utilizados (opcional, com cuidado)
# sudo docker volume prune -f

# Reconstruir e iniciar
echo "🚀 Reconstruindo e iniciando containers..."
sudo docker-compose -f docker/docker-compose.dev.yml up -d --build

echo "✅ Concluído! Verifique os logs com:"
echo "   sudo docker-compose -f docker/docker-compose.dev.yml logs -f admin"
