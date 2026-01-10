# Product Requirements Document (PRD)
## VSA Analytics Health - Plataforma SaaS Multi-Tenant de Business Intelligence Hospitalar

---

## 1. Visão Geral do Produto

### 1.1 Resumo Executivo

**VSA Analytics Health** é uma plataforma SaaS (Software as a Service) de Business Intelligence especializada para o setor hospitalar. A solução permite que múltiplos hospitais utilizem a mesma infraestrutura de forma completamente isolada e segura, oferecendo dashboards interativos, KPIs em tempo real e análises avançadas para tomada de decisão.

### 1.2 Problema a Resolver

Hospitais e clínicas enfrentam desafios críticos na gestão de dados:

- **Fragmentação de Dados**: Informações espalhadas em múltiplos sistemas (ERP, prontuário eletrônico, faturamento)
- **Falta de Visibilidade**: Ausência de dashboards consolidados para tomada de decisão rápida
- **Análise Manual**: Relatórios gerados manualmente em planilhas, propensos a erros
- **Tempo de Resposta**: Demora na identificação de problemas operacionais
- **Compliance**: Dificuldade em manter conformidade LGPD e regulatória

### 1.3 Solução Proposta

Plataforma centralizada que:

- Integra dados de múltiplas fontes (Wareline, sistemas legados)
- Fornece dashboards interativos em tempo real
- Implementa isolamento multi-tenant com segurança de nível enterprise
- Oferece alertas proativos e notificações
- Garante conformidade LGPD

### 1.4 Proposta de Valor

| Para | Que | Nosso Produto | Diferente De | Benefício |
|------|-----|---------------|--------------|-----------|
| Hospitais e Clínicas | Precisam de visibilidade operacional em tempo real | VSA Analytics Health | Planilhas e relatórios manuais | Decisões mais rápidas e assertivas |
| Gestores de Saúde | Precisam monitorar KPIs críticos | Dashboards interativos | Sistemas complexos de BI | Interface intuitiva, zero configuração |
| TI Hospitalar | Precisam de integração segura | API robusta com RLS | Soluções on-premise caras | Multi-tenant seguro, baixo TCO |

---

## 2. Objetivos e Metas

### 2.1 Objetivos de Negócio

| Objetivo | Meta | Prazo |
|----------|------|-------|
| Aquisição de Clientes | 50 hospitais ativos | 12 meses |
| MRR (Monthly Recurring Revenue) | R$ 500.000 | 12 meses |
| Churn Rate | < 5% mensal | Contínuo |
| NPS (Net Promoter Score) | > 50 | 6 meses |
| Uptime | 99.9% | Contínuo |

### 2.2 Objetivos de Produto

| Objetivo | Métrica de Sucesso | Prazo |
|----------|-------------------|-------|
| Onboarding Rápido | < 24 horas para primeiro dashboard | MVP |
| Adoção de Módulos | > 3 módulos por cliente | 6 meses |
| Engajamento | DAU/MAU > 40% | 3 meses |
| Performance | Tempo de carregamento < 2s | MVP |
| Satisfação | CSAT > 4.5/5 | Contínuo |

---

## 3. Personas e Usuários

### 3.1 Persona Primária: Diretor Administrativo Hospitalar

**Nome**: Dr. Carlos Mendes  
**Idade**: 52 anos  
**Cargo**: Diretor Administrativo  
**Hospital**: Hospital Regional de 200 leitos

**Objetivos**:
- Visão consolidada da operação hospitalar
- Identificar gargalos antes que virem crises
- Reduzir custos operacionais
- Melhorar indicadores de qualidade

**Dores**:
- Reuniões semanais com planilhas desatualizadas
- Demora de semanas para ter relatórios consolidados
- Dificuldade em comparar períodos

**Comportamento**:
- Acessa o sistema diariamente pela manhã
- Prefere visualizações gráficas a tabelas
- Compartilha dashboards em reuniões de diretoria

### 3.2 Persona Secundária: Analista de Faturamento

**Nome**: Marina Silva  
**Idade**: 34 anos  
**Cargo**: Coordenadora de Faturamento  
**Hospital**: Clínica Especializada

**Objetivos**:
- Acompanhar glosas em tempo real
- Identificar padrões de negativa
- Melhorar taxa de recuperação

**Dores**:
- Exportar dados manualmente do ERP
- Cruzar informações de múltiplas fontes
- Gerar relatórios para convênios

**Comportamento**:
- Acessa múltiplas vezes ao dia
- Exporta dados frequentemente
- Cria filtros customizados

### 3.3 Persona Terciária: Enfermeiro Chefe da UTI

**Nome**: Roberto Almeida  
**Idade**: 41 anos  
**Cargo**: Enfermeiro Chefe UTI  
**Hospital**: Hospital de Grande Porte

**Objetivos**:
- Monitorar taxa de ocupação em tempo real
- Planejar escala de equipe
- Acompanhar indicadores de qualidade

**Dores**:
- Não saber quantos leitos estarão disponíveis
- Surpresas com picos de demanda
- Falta de histórico para planejamento

---

## 4. Funcionalidades e Requisitos

### 4.1 Epic 1: Sistema de Autenticação Multi-Tenant

#### User Stories

| ID | Como | Quero | Para |
|----|------|-------|------|
| US-1.1 | Administrador de Hospital | Criar conta para meu hospital | Começar a usar a plataforma |
| US-1.2 | Usuário | Fazer login com email e senha | Acessar o sistema de forma segura |
| US-1.3 | Administrador | Convidar membros da equipe | Dar acesso controlado ao sistema |
| US-1.4 | Master | Definir roles para cada usuário | Controlar permissões de acesso |
| US-1.5 | Usuário | Recuperar minha senha | Voltar a acessar o sistema |
| US-1.6 | Administrador | Ver log de acessos | Auditar uso do sistema |

#### Critérios de Aceitação (US-1.1)

```gherkin
Scenario: Cadastro de novo hospital
  Given que estou na página de signup
  When preencho nome do hospital "Hospital Santa Clara"
  And preencho email "admin@santaclara.com.br"
  And preencho senha válida
  And preencho subdomain "santaclara"
  And clico em "Criar Conta"
  Then devo receber email de confirmação
  And meu hospital deve ter status "trial"
  And devo ter período de trial de 14 dias
```

#### Requisitos Técnicos

- **RT-1.1**: Autenticação via Supabase Auth
- **RT-1.2**: JWT com claim `tenant_id` para RLS
- **RT-1.3**: Roles armazenados em tabela separada (nunca no profile)
- **RT-1.4**: Sessões com expiração configurável
- **RT-1.5**: Rate limiting em tentativas de login

### 4.2 Epic 2: Dashboard Principal

#### User Stories

| ID | Como | Quero | Para |
|----|------|-------|------|
| US-2.1 | Usuário | Ver KPIs principais na home | Ter visão rápida da operação |
| US-2.2 | Usuário | Ver gráficos de tendência | Entender evolução temporal |
| US-2.3 | Usuário | Filtrar por período | Analisar janelas específicas |
| US-2.4 | Usuário | Exportar dados | Usar em outras ferramentas |
| US-2.5 | Usuário | Personalizar layout | Adaptar às minhas necessidades |

#### KPIs Obrigatórios do Dashboard

| KPI | Descrição | Atualização |
|-----|-----------|-------------|
| Atendimentos Hoje | Total de atendimentos do dia | Real-time |
| Taxa de Ocupação | Leitos ocupados / disponíveis | 15 min |
| Tempo Médio Espera | Média de espera no PS | Real-time |
| NPS | Net Promoter Score | Diário |
| Faturamento Pendente | Valor não faturado | Horário |
| Taxa de Glosas | Glosas / Faturamento total | Diário |

### 4.3 Epic 3: Módulo Assistencial

#### Submódulos

| Módulo | Funcionalidades |
|--------|-----------------|
| Atendimentos | Filas, tempo espera, throughput, origem |
| Internação | Ocupação, permanência, altas, óbitos |
| Agendas | Ocupação, no-show, encaixes |
| Exames | Pendentes, TAT (turnaround time) |
| UTI | Ocupação, APACHE, mortalidade |
| Farmácia | Prescrições, unitarização, vigilância |
| CCIH | Taxa infecção, topografia, antibióticos |

### 4.4 Epic 4: Módulo Gerencial

#### Submódulos

| Módulo | Funcionalidades |
|--------|-----------------|
| Faturamento | Contas, glosas, recurso, NF |
| Financeiro | Contas a pagar/receber, fluxo caixa |
| Estoque | Níveis, consumo, validade |
| Patrimônio | Inventário, depreciação |
| SUS | AIHs, produção, rejeições |

### 4.5 Epic 5: Sistema de Alertas

#### User Stories

| ID | Como | Quero | Para |
|----|------|-------|------|
| US-5.1 | Usuário | Configurar alertas por KPI | Ser notificado de anomalias |
| US-5.2 | Usuário | Receber alertas por email | Saber sem acessar o sistema |
| US-5.3 | Usuário | Receber alertas por WhatsApp | Ter notificação imediata |
| US-5.4 | Usuário | Ver histórico de alertas | Analisar recorrências |

### 4.6 Epic 6: Configurações e Billing

#### User Stories

| ID | Como | Quero | Para |
|----|------|-------|------|
| US-6.1 | Master | Gerenciar usuários | Controlar acessos |
| US-6.2 | Master | Configurar branding | Personalizar a plataforma |
| US-6.3 | Master | Ver/alterar plano | Gerenciar assinatura |
| US-6.4 | Master | Ver histórico de faturas | Controlar custos |
| US-6.5 | Master | Configurar integrações | Conectar sistemas externos |

---

## 5. Requisitos Não-Funcionais

### 5.1 Performance

| Requisito | Especificação |
|-----------|---------------|
| Tempo de resposta API | < 200ms p95 |
| Tempo carregamento página | < 2s (LCP) |
| First Input Delay | < 100ms |
| Cumulative Layout Shift | < 0.1 |
| Queries complexas | < 5s |

### 5.2 Segurança

| Requisito | Especificação |
|-----------|---------------|
| Criptografia em trânsito | TLS 1.3 |
| Criptografia em repouso | AES-256 |
| Autenticação | JWT com refresh tokens |
| Autorização | RBAC + RLS |
| Auditoria | Log de todas ações críticas |
| Compliance | LGPD, HIPAA-ready |

### 5.3 Disponibilidade

| Requisito | Especificação |
|-----------|---------------|
| Uptime | 99.9% (8.76h downtime/ano) |
| RTO | 1 hora |
| RPO | 15 minutos |
| Backups | Contínuo + diário |
| DR | Multi-região |

### 5.4 Escalabilidade

| Requisito | Especificação |
|-----------|---------------|
| Tenants simultâneos | 1000+ |
| Usuários por tenant | 500+ |
| Requisições/segundo | 10.000+ |
| Dados por tenant | 100GB+ |
| Retenção | Até 5 anos |

### 5.5 Usabilidade

| Requisito | Especificação |
|-----------|---------------|
| Responsividade | Desktop + Tablet + Mobile |
| Acessibilidade | WCAG 2.1 AA |
| Idiomas | PT-BR (EN-US futuro) |
| Onboarding | < 30 min para primeiro valor |
| Suporte | Help center + Chat |

---

## 6. Roadmap

### 6.1 Fase 1: MVP (Mês 1-3)

| Feature | Prioridade | Sprint |
|---------|-----------|--------|
| Autenticação Multi-Tenant | P0 | 1-2 |
| Dashboard Principal | P0 | 2-3 |
| Módulo Atendimentos | P0 | 3-4 |
| Integração Wareline Básica | P0 | 4-5 |
| Planos e Pagamento (Stripe) | P0 | 5-6 |

### 6.2 Fase 2: Expansão (Mês 4-6)

| Feature | Prioridade | Sprint |
|---------|-----------|--------|
| Módulo Internação | P1 | 7-8 |
| Módulo Faturamento | P1 | 8-9 |
| Sistema de Alertas | P1 | 9-10 |
| Exportação Avançada | P1 | 10-11 |
| App Mobile (PWA) | P2 | 11-12 |

### 6.3 Fase 3: Enterprise (Mês 7-12)

| Feature | Prioridade | Sprint |
|---------|-----------|--------|
| ML: Predição de Demanda | P2 | 13-15 |
| ML: Detecção de Anomalias | P2 | 15-17 |
| White Label | P2 | 17-18 |
| API Pública | P2 | 18-20 |
| Integrações Adicionais | P2 | 20-24 |

---

## 7. Métricas de Sucesso

### 7.1 North Star Metric

**Hospitais com > 20 usuários ativos mensais**

Indica adoção real e valor entregue.

### 7.2 Métricas de Aquisição

| Métrica | Definição | Meta |
|---------|-----------|------|
| Signups | Novos cadastros/mês | 100 |
| Trial-to-Paid | Conversão trial→pago | 30% |
| CAC | Custo aquisição cliente | < R$2.000 |
| Payback | Meses para recuperar CAC | < 6 |

### 7.3 Métricas de Engajamento

| Métrica | Definição | Meta |
|---------|-----------|------|
| DAU/MAU | Usuários ativos diários/mensais | > 40% |
| Sessões/usuário | Sessões por semana | > 5 |
| Módulos/tenant | Módulos ativos | > 3 |
| Dashboards criados | Por tenant | > 10 |

### 7.4 Métricas de Retenção

| Métrica | Definição | Meta |
|---------|-----------|------|
| Churn Rate | Cancelamentos/mês | < 5% |
| Net Revenue Retention | Expansão - Churn | > 110% |
| LTV | Valor vitalício cliente | > R$30.000 |

### 7.5 Métricas Técnicas

| Métrica | Definição | Meta |
|---------|-----------|------|
| Uptime | Disponibilidade | 99.9% |
| Error Rate | Erros/requisições | < 0.1% |
| P95 Latency | Latência percentil 95 | < 200ms |
| Apdex | Application Performance Index | > 0.95 |

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Integração Wareline complexa | Alta | Alto | POC antecipada, parceria com fornecedor |
| Vazamento de dados | Baixa | Crítico | Auditorias, pen-testing, RLS rigoroso |
| Baixa adoção por usuários | Média | Alto | Onboarding guiado, CS proativo |
| Concorrência agressiva | Média | Médio | Foco em nicho, features específicas |
| Problemas de performance | Média | Alto | Testes de carga, cache agressivo |

---

## 9. Dependências Externas

| Dependência | Tipo | Criticidade | Alternativa |
|-------------|------|-------------|-------------|
| Supabase | Infraestrutura | Alta | AWS/GCP direto |
| Stripe | Pagamentos | Alta | PagSeguro, Mercado Pago |
| Wareline | Integração | Alta | API genérica |
| Resend | Email | Média | SendGrid, SES |
| Twilio | SMS/WhatsApp | Média | Zenvia |

---

## 10. Glossário

| Termo | Definição |
|-------|-----------|
| Tenant | Hospital/clínica cliente da plataforma |
| RLS | Row Level Security - isolamento de dados no banco |
| KPI | Key Performance Indicator - indicador chave |
| Glosa | Recusa de pagamento por convênio |
| AIH | Autorização de Internação Hospitalar (SUS) |
| TAT | Turnaround Time - tempo de resposta |
| CCIH | Comissão de Controle de Infecção Hospitalar |

---

## 11. Aprovações

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Product Owner | | | |
| Tech Lead | | | |
| Design Lead | | | |
| Stakeholder | | | |

---

*Documento versionado. Última atualização: Janeiro 2026*
*Versão: 1.0*
