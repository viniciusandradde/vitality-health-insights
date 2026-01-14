# Migrations - VSA Analytics Health

Este documento explica como trabalhar com migrations no projeto.

## 📋 Pré-requisitos

1. **Banco de dados rodando**: PostgreSQL deve estar acessível
2. **Variáveis de ambiente**: `DATABASE_URL` configurada corretamente
3. **Dependências Python**: Todas as dependências instaladas

## 🚀 Como Criar uma Migration

### Opção 1: Usando o Script (Recomendado)

```bash
cd apps/backend
./scripts/create-migration.sh
```

### Opção 2: Manualmente

```bash
cd apps/backend
python -m alembic revision --autogenerate -m "descricao_da_migration"
```

### Opção 3: Dentro do Container Docker

Se o backend estiver rodando no Docker:

```bash
docker exec -it vsa_backend_dev python -m alembic revision --autogenerate -m "descricao_da_migration"
```

## 📝 Aplicar Migrations

### Opção 1: Usando o Script (Recomendado)

```bash
cd apps/backend
./scripts/apply-migration.sh
```

### Opção 2: Manualmente

```bash
cd apps/backend
python -m alembic upgrade head
```

### Opção 3: Dentro do Container Docker

```bash
docker exec -it vsa_backend_dev python -m alembic upgrade head
```

## 🔍 Verificar Status das Migrations

```bash
cd apps/backend
python -m alembic current
python -m alembic history
```

## 📊 Models Incluídos na Migration Inicial

A migration inicial inclui todos os models do sistema:

### Core
- `Tenant` - Organizações/Hospitais
- `User` - Usuários
- `Role` - Roles de usuários
- `Plan` - Planos de assinatura
- `Subscription` - Assinaturas
- `Invoice` - Faturas
- `AuditLog` - Logs de auditoria

### Assistencial (12 módulos)
- `Atendimento` - Atendimentos
- `Internacao` - Internações
- `Leito` - Leitos
- `AmbulatorioConsulta` - Consultas ambulatoriais
- `Agendamento` - Agendamentos
- `ExameLaboratorial` - Exames laboratoriais
- `ExameImagem` - Exames de imagem
- `Transfusao` - Transfusões
- `Prescricao` - Prescrições
- `Infeccao` - Infecções (CCIH)
- `SessaoFisioterapia` - Sessões de fisioterapia
- `AvaliacaoNutricional` - Avaliações nutricionais
- `UTIInternacao` - Internações em UTI

### Gerencial (10 módulos)
- `ItemEstoque` - Itens de estoque
- `Faturamento` - Faturamento
- `MovimentacaoFinanceira` - Movimentações financeiras
- `ServicoHigienizacao` - Serviços de higienização
- `ServicoLavanderia` - Serviços de lavanderia
- `OcorrenciaSESMT` - Ocorrências SESMT
- `ChamadoTI` - Chamados de TI
- `ServicoHotelaria` - Serviços de hotelaria
- `AtividadeSPP` - Atividades SPP
- `RefeicaoGerencial` - Refeições (gerencial)

### Settings (4 módulos)
- `ModuloConfig` - Configurações de módulos
- `Integracao` - Integrações externas
- `NotificacaoConfig` - Configurações de notificações
- `SegurancaConfig` - Configurações de segurança

## ⚠️ Importante

1. **Sempre revise a migration** antes de aplicar
2. **Faça backup** do banco antes de aplicar migrations em produção
3. **Teste em desenvolvimento** primeiro
4. **Não edite migrations já aplicadas** - crie uma nova migration

## 🐛 Troubleshooting

### Erro: "connection refused"

O banco de dados não está acessível. Verifique:

```bash
# Verificar se o container está rodando
docker ps | grep postgres

# Iniciar o banco se necessário
./scripts/dev-docker.sh start
```

### Erro: "ModuleNotFoundError"

Instale as dependências:

```bash
cd apps/backend
pip install -r requirements.txt
```

### Erro: "Target database is not up to date"

Aplique as migrations pendentes:

```bash
python -m alembic upgrade head
```

## 📚 Comandos Úteis

```bash
# Ver migration atual
python -m alembic current

# Ver histórico de migrations
python -m alembic history

# Ver detalhes de uma migration específica
python -m alembic history -v

# Reverter uma migration
python -m alembic downgrade -1

# Reverter todas as migrations
python -m alembic downgrade base
```

## 🔄 Workflow Recomendado

1. Fazer alterações nos models
2. Criar migration: `./scripts/create-migration.sh`
3. Revisar a migration gerada
4. Aplicar migration: `./scripts/apply-migration.sh`
5. Testar a aplicação
