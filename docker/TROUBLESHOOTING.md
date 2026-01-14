# 🔧 Troubleshooting - Docker

## Problema: Porta 5432 já está em uso

### Sintoma
```
ERROR: failed to bind host port for 0.0.0.0:5432: address already in use
```

### Solução 1: Usar porta alternativa (RECOMENDADO)

```bash
# 1. Criar arquivo .env
cat > docker/.env << EOL
POSTGRES_PORT=5433
DB_PASSWORD=vsa_dev_password
JWT_SECRET=dev-secret-change-in-production
EOL

# 2. Atualizar DATABASE_URL no backend
# Edite apps/backend/.env:
# DATABASE_URL=postgresql://vsa_user:vsa_dev_password@localhost:5433/vsa_analytics

# 3. Iniciar serviços
docker-compose -f docker/docker-compose.dev.yml up -d postgres redis
```

### Solução 2: Parar PostgreSQL local

```bash
# Verificar se está rodando
sudo systemctl status postgresql

# Parar serviço
sudo systemctl stop postgresql

# Desabilitar auto-start (opcional)
sudo systemctl disable postgresql
```

### Solução 3: Usar script automático

```bash
./scripts/fix-port-conflict.sh
```

## Problema: Permission denied no Docker

### Sintoma
```
PermissionError: [Errno 13] Permission denied
Error while fetching server API version
```

### Solução

```bash
# 1. Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# 2. Aplicar mudanças (escolha uma opção):

# Opção A: Fazer logout e login novamente
# (recomendado)

# Opção B: Usar newgrp (temporário)
newgrp docker

# Opção C: Usar sudo (não recomendado, mas funciona)
sudo docker-compose -f docker/docker-compose.dev.yml up -d postgres redis
```

### Verificar se funcionou

```bash
# Testar acesso
docker ps

# Se funcionar, você verá a lista de containers
```

## Problema: ContainerConfig KeyError

### Sintoma
```
KeyError: 'ContainerConfig'
ERROR: for backend 'ContainerConfig'
```

### Solução: Limpar containers corrompidos

```bash
# Opção 1: Script específico para o serviço (RECOMENDADO)
./scripts/fix-container-config.sh backend
# ou
./scripts/fix-container-config.sh frontend

# Opção 2: Usar script de limpeza completa
./scripts/clean-docker.sh

# Opção 3: Limpeza manual do serviço específico
docker rm -f vsa_backend_dev
docker-compose -f docker/docker-compose.dev.yml rm -f backend
docker-compose -f docker/docker-compose.dev.yml build --no-cache backend
docker-compose -f docker/docker-compose.dev.yml up -d backend

# Opção 4: Reset completo
./scripts/dev-docker.sh reset
```

## Problema: Porta 6379 (Redis) já está em uso

### Solução

```bash
# Usar porta alternativa
export REDIS_PORT=6380
docker-compose -f docker/docker-compose.dev.yml up -d redis
```

## Problema: Container não inicia

### Verificar logs
```bash
docker-compose -f docker/docker-compose.dev.yml logs <service_name>
```

### Rebuild containers
```bash
docker-compose -f docker/docker-compose.dev.yml build --no-cache
```

## Problema: Banco de dados não conecta

### Verificar se PostgreSQL está rodando
```bash
docker ps | grep postgres
```

### Testar conexão
```bash
# Do host
docker exec -it vsa_postgres_dev psql -U vsa_user -d vsa_analytics -c "SELECT 1;"

# Do container backend
docker exec -it vsa_backend_dev python -c "from app.core.database import engine; print('OK')"
```

### Verificar variáveis de ambiente
```bash
docker exec -it vsa_backend_dev env | grep DATABASE
```

## Problema: Hot-reload não funciona

### Verificar volumes
```bash
docker inspect vsa_backend_dev | grep -A 10 Mounts
```

### Rebuild com volumes
```bash
docker-compose -f docker/docker-compose.dev.yml down
docker-compose -f docker/docker-compose.dev.yml up -d --build
```

## Problema: email-validator não encontrado

### Sintoma
```
ModuleNotFoundError: No module named 'email_validator'
ImportError: email-validator is not installed
```

### Solução

```bash
# Opção 1: Usar script automático
./scripts/fix-backend-deps.sh

# Opção 2: Instalar no container em execução
docker exec vsa_backend_dev pip install email-validator==2.1.1
docker-compose -f docker/docker-compose.dev.yml restart backend

# Opção 3: Rebuild do container
docker-compose -f docker/docker-compose.dev.yml build --no-cache backend
docker-compose -f docker/docker-compose.dev.yml up -d backend
```

## Limpar tudo e recomeçar

```bash
# Parar e remover tudo
docker-compose -f docker/docker-compose.dev.yml down -v

# Remover imagens
docker-compose -f docker/docker-compose.dev.yml down --rmi all

# Limpar sistema Docker (CUIDADO)
docker system prune -a --volumes
```

## Comandos úteis de diagnóstico

```bash
# Ver status de todos os containers
docker ps -a

# Ver logs em tempo real
docker-compose -f docker/docker-compose.dev.yml logs -f

# Ver uso de recursos
docker stats

# Ver informações de rede
docker network ls
docker network inspect vsa_network

# Ver volumes
docker volume ls
docker volume inspect postgres_dev_data
```
