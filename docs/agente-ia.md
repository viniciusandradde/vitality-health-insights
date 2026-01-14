Integração da Stack de Agente IA + RAG
Projeto: vsa-analytics-health
🎯 Objetivo da Integração

Adicionar ao SaaS hospitalar uma camada de Inteligência Artificial corporativa, capaz de:

Responder perguntas em linguagem natural

Consultar dados operacionais, assistenciais e gerenciais

Gerar insights automáticos

Operar em modo multi-tenant seguro

Escalar como feature premium do produto

🧠 Visão Geral da Arquitetura Integrada
React (Dashboard + Chat IA)
        │
        ▼
FastAPI vsa-analytics-health
(API principal + Auth + Tenant)
        │
        ├── Módulos Assistencial / Gerencial / Dashboard
        │
        └── IA Service Layer
             │
             ├── Agents (LangChain + LangGraph)
             ├── RAG Pipeline
             ├── pgvector (PostgreSQL 16)
             └── OpenRouter / OpenAI


👉 A IA NÃO é um sistema separado
👉 Ela é um subdomínio do backend atual

🧩 ETAPA 1 — Organização no Monorepo
📁 Nova Estrutura Final
apps/backend/app/
├── ai/                         # NOVO MÓDULO
│   ├── api/                    # Rotas IA
│   │   ├── chat.py
│   │   ├── rag.py
│   │   └── agents.py
│   │
│   ├── agents/                 # Core Agents
│   │   ├── base.py
│   │   ├── simple.py
│   │   └── workflow.py
│   │
│   ├── rag/                    # RAG Pipeline
│   │   ├── ingestion.py
│   │   ├── loaders.py
│   │   └── tools.py
│   │
│   ├── middleware/
│   │   └── dynamic.py
│   │
│   ├── schemas/
│   │   ├── requests.py
│   │   └── responses.py
│   │
│   └── service.py              # Orquestrador IA
│
├── api/router.py               # incluir /ai

🔐 ETAPA 2 — Integração com Multi-Tenancy EXISTENTE
✅ Regra de Ouro

Toda chamada IA herda tenant_id do JWT

Middleware Atual (mantido)
request.state.tenant_id
request.state.user_id

Uso na IA
config = {
  "configurable": {
    "tenant_id": request.state.tenant_id,
    "user_id": request.state.user_id,
    "empresa": tenant.nome,
  }
}


🔒 Isso garante:

Isolamento de dados

RAG por hospital

Compliance LGPD

🗄️ ETAPA 3 — Integração com PostgreSQL + pgvector
📌 Extensão
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

📌 Tabelas IA (NÃO conflitam com tabelas hospitalares)

kb_docs

kb_chunks

Cada registro contém:

tenant_id / empresa
client_id (opcional)
meta (origem, módulo, tipo de dado)

🔍 Estratégia de Busca

Vector Search (pgvector)

Full-text (GIN + trigram)

Hybrid (RRF)

➡️ Ideal para dashboards e relatórios hospitalares

🤖 ETAPA 4 — Casos de Uso de IA NO PRODUTO
🧠 Assistente Executivo

“Como está a ocupação de leitos hoje comparado à semana passada?”

IA chama:

KPIs

Dados históricos

RAG para contexto

🏥 Assistente Assistencial

“Quais setores tiveram mais infecção hospitalar este mês?”

Busca em:

ccih_*

RAG com protocolos

Geração de insight

💼 Assistente Gerencial

“Explique o aumento do faturamento com base nos atendimentos.”

IA cruza:

financeiro

faturamento

atendimentos

🔁 ETAPA 5 — RAG com Dados do PRÓPRIO SISTEMA
Fontes de Conhecimento
Fonte	Estratégia
Protocolos hospitalares	Markdown
Documentação interna	Markdown
Relatórios SQL	Exportação + ingest
Indicadores históricos	Materialized views
🔌 ETAPA 6 — Rotas de API Integradas
Prefixo padrão
/api/v1/ai

Rotas
Método	Rota	Descrição
POST	/ai/chat	Chat IA
POST	/ai/chat/stream	Streaming SSE
POST	/ai/rag/search	Busca RAG
POST	/ai/rag/ingest	Ingestão
GET	/ai/rag/stats	Estatísticas
POST	/ai/agents/invoke	Invocar agente

➡️ Todas protegidas por JWT + tenant

🧠 ETAPA 7 — Orquestração Inteligente (WorkflowAgent)

O WorkflowAgent decide automaticamente:

Conversa simples

Busca RAG

Web search

Ação customizada (ex: gerar relatório)

Isso permite:

Evoluir para copiloto hospitalar

Automatizar análises

Criar alertas proativos

📊 ETAPA 8 — Integração com o Frontend Atual (React)
Componentes sugeridos

AIChatDrawer

AskAIButton

InsightCard

ExplainThisChart

Exemplo
<ExplainThisChart chartId="ocupacao_leitos" />


➡️ IA recebe:

ID do gráfico

Dados agregados

Contexto do módulo

🚀 ETAPA 9 — Roadmap de Implementação
Fase 1

Estrutura IA no backend

pgvector

RAG básico

Fase 2

Chat streaming

Integração frontend

Assistente geral

Fase 3

WorkflowAgent

Insights automáticos

Alertas

Fase 4

Feature premium

Limite por plano

Métricas de uso IA

🔐 Segurança & LGPD

✔ Dados isolados por tenant
✔ Sem treino com dados sensíveis
✔ Logs anonimizados
✔ Controle por plano
✔ Auditoria de uso IA

✅ Resultado Final

Você terá:

✅ IA nativa do SaaS

✅ RAG hospitalar corporativo

✅ Copiloto analítico

✅ Diferencial competitivo real

✅ Arquitetura escalável e premium