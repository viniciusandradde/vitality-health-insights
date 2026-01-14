#!/bin/bash

# Script para resolver conflitos de porta

set -e

echo "🔍 Verificando portas em uso..."

# Verificar porta 5432
if lsof -i :5432 >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":5432 " || ss -tuln 2>/dev/null | grep -q ":5432 "; then
    echo "⚠️  Porta 5432 está em uso!"
    echo ""
    echo "Opções:"
    echo "1. Parar PostgreSQL local e usar porta 5432"
    echo "2. Usar porta alternativa (5433) - RECOMENDADO"
    echo ""
    read -p "Escolha uma opção (1 ou 2): " choice
    
    case $choice in
        1)
            echo "🛑 Parando PostgreSQL local..."
            if systemctl is-active --quiet postgresql 2>/dev/null; then
                sudo systemctl stop postgresql
                echo "✅ PostgreSQL parado"
            elif docker ps | grep -q postgres; then
                docker stop $(docker ps | grep postgres | awk '{print $1}')
                echo "✅ Container PostgreSQL parado"
            else
                echo "❌ Não foi possível identificar o processo usando a porta 5432"
                echo "   Execute manualmente: sudo lsof -i :5432"
                exit 1
            fi
            ;;
        2)
            echo "✅ Usando porta alternativa 5433"
            export POSTGRES_PORT=5433
            if [ ! -f docker/.env ]; then
                cp docker/.env.example docker/.env
            fi
            echo "POSTGRES_PORT=5433" >> docker/.env
            echo ""
            echo "⚠️  IMPORTANTE: Atualize DATABASE_URL no apps/backend/.env:"
            echo "   DATABASE_URL=postgresql://vsa_user:vsa_dev_password@localhost:5433/vsa_analytics"
            ;;
        *)
            echo "❌ Opção inválida"
            exit 1
            ;;
    esac
else
    echo "✅ Porta 5432 está livre"
fi

# Verificar porta 6379 (Redis)
if lsof -i :6379 >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":6379 " || ss -tuln 2>/dev/null | grep -q ":6379 "; then
    echo "⚠️  Porta 6379 (Redis) está em uso!"
    echo "   Usando porta alternativa 6380..."
    export REDIS_PORT=6380
fi

echo ""
echo "✅ Verificação concluída!"
