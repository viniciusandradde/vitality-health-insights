# 🧪 Teste de Migration

## Como executar o teste

### Opção 1: Usando o script (Recomendado)

```bash
cd apps/backend
./scripts/test-migration-docker.sh
```

### Opção 2: Executar diretamente no container

```bash
# Verificar status
docker ps | grep backend

# Criar migration
docker exec vsa_backend_dev python -m alembic revision --autogenerate -m "initial_migration_all_models"

# Aplicar migration
docker exec vsa_backend_dev python -m alembic upgrade head

# Verificar status
docker exec vsa_backend_dev python -m alembic current
```

### Opção 3: Usando o ambiente virtual local

Se você tiver o venv configurado localmente:

```bash
cd apps/backend
source venv/bin/activate
export DATABASE_URL="postgresql://vsa_user:vsa_dev_password@localhost:5433/vsa_analytics"
python -m alembic revision --autogenerate -m "initial_migration_all_models"
python -m alembic upgrade head
```

## Verificar resultados

Após criar a migration, verifique:

1. **Arquivo criado**: `apps/backend/alembic/versions/XXXX_initial_migration_all_models.py`
2. **Tabelas criadas**: Execute no banco:
   ```sql
   \dt
   ```
3. **Status da migration**: 
   ```bash
   docker exec vsa_backend_dev python -m alembic current
   ```

## Troubleshooting

### Erro: "permission denied" no Docker
- Adicione seu usuário ao grupo docker: `sudo usermod -aG docker $USER`
- Faça logout/login ou execute: `newgrp docker`

### Erro: "ModuleNotFoundError"
- Execute dentro do container do backend (já tem todas as dependências)
- Ou instale localmente: `pip install -r requirements.txt`

### Erro: "connection refused"
- Verifique se o PostgreSQL está rodando: `docker ps | grep postgres`
- Inicie se necessário: `./scripts/dev-docker.sh start`
