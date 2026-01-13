# Regras de Negócio - VSA Analytics Health

Este documento descreve todas as regras de negócio implementadas no sistema, organizadas por módulo e categoria.

## Índice

1. [Cálculos e Métricas](#cálculos-e-métricas)
2. [Validações](#validações)
3. [Regras por Módulo](#regras-por-módulo)
4. [Permissões](#permissões)

## Cálculos e Métricas

### Tempo Médio de Espera

**Localização:** `src/lib/business-rules/calculations.ts`

Calcula o tempo médio de espera em minutos para atendimentos.

```typescript
calculateTempoMedioEspera(atendimentos: Atendimento[]): number
```

**Regra:**
- Filtra atendimentos com `tempo_espera_minutos` definido e maior que 0
- Calcula a média aritmética dos tempos
- Retorna valor arredondado

### Taxa de Ocupação

**Localização:** `src/lib/business-rules/calculations.ts`

Calcula a taxa de ocupação em percentual.

```typescript
calculateTaxaOcupacao(ocupados: number, total: number): number
```

**Regra:**
- Fórmula: `(ocupados / total) * 100`
- Retorna valor arredondado
- Retorna 0 se total for 0

### Taxa de No-Show

**Localização:** `src/lib/business-rules/calculations.ts`

Calcula a taxa de no-show para agendamentos.

```typescript
calculateTaxaNoShow(agendamentos: AmbulatorioAgendamento[]): number
```

**Regra:**
- Conta agendamentos com status `no_show`
- Fórmula: `(no_shows / total) * 100`
- Retorna valor arredondado

### Tempo Médio de Permanência

**Localização:** `src/lib/business-rules/calculations.ts`

Calcula o tempo médio de permanência em dias para internações.

```typescript
calculateTempoMedioPermanencia(internacoes: Internacao[]): number
```

**Regra:**
- Filtra internações com `dias_internacao` definido e maior que 0
- Calcula a média aritmética
- Retorna valor com 1 casa decimal

### Taxa de Glosas

**Localização:** `src/lib/business-rules/calculations.ts`

Calcula a taxa de glosas em percentual.

```typescript
calculateTaxaGlosas(faturamentoTotal: number, valorGlosado: number): number
```

**Regra:**
- Fórmula: `(valorGlosado / faturamentoTotal) * 100`
- Retorna valor com 2 casas decimais

### Taxa de Recebimento

**Localização:** `src/lib/business-rules/calculations.ts`

Calcula a taxa de recebimento em percentual.

```typescript
calculateTaxaRecebimento(valorFaturado: number, valorRecebido: number): number
```

**Regra:**
- Fórmula: `(valorRecebido / valorFaturado) * 100`
- Retorna valor arredondado

### Saldo Financeiro

**Localização:** `src/lib/business-rules/calculations.ts`

Calcula o saldo financeiro (receita - despesa).

```typescript
calculateSaldo(receita: number, despesa: number): number
```

**Regra:**
- Fórmula simples: `receita - despesa`
- Pode resultar em valor negativo

## Validações

### Validação de Atendimento

**Localização:** `src/lib/business-rules/validations.ts`

Valida se um atendimento tem todos os campos obrigatórios e formato correto.

```typescript
validateAtendimento(atendimento: Partial<Atendimento>): { valid: boolean; errors: string[] }
```

**Campos Obrigatórios:**
- `paciente_id`
- `paciente_nome`
- `data` (formato: YYYY-MM-DD)
- `hora` (formato: HH:MM)
- `especialidade`
- `profissional`
- `tipo`
- `status`

**Regras de Validação:**
- Data deve estar no formato YYYY-MM-DD
- Hora deve estar no formato HH:MM
- `tempo_espera_minutos` não pode ser negativo
- `valor` não pode ser negativo

### Validação de Agendamento

**Localização:** `src/lib/business-rules/validations.ts`

Valida se um agendamento pode ser criado, verificando conflitos.

```typescript
validateAgendamento(
  agendamento: Partial<AmbulatorioAgendamento>,
  agendamentosExistentes: AmbulatorioAgendamento[]
): { valid: boolean; errors: string[]; warnings: string[] }
```

**Regras:**
- Data, hora e profissional são obrigatórios
- Não pode haver conflito de horário para o mesmo profissional
- Alerta se paciente já tem agendamento no mesmo dia
- Não é possível agendar para datas passadas (novos agendamentos)

### Validação de Internação

**Localização:** `src/lib/business-rules/validations.ts`

Valida se uma internação pode ser realizada.

```typescript
validateInternacao(
  internacao: Partial<Internacao>,
  leitosDisponiveis: number
): { valid: boolean; errors: string[]; warnings: string[] }
```

**Regras:**
- Campos obrigatórios: `paciente_id`, `data_internacao`, `leito`, `setor`, `diagnostico`
- Alerta se não há leitos disponíveis
- Data de alta não pode ser anterior à data de internação

### Validações de Documentos

**Localização:** `src/lib/business-rules/validations.ts`

#### CPF
```typescript
validateCPF(cpf: string): boolean
```
- Remove caracteres não numéricos
- Verifica se tem 11 dígitos
- Valida dígitos verificadores

#### CNPJ
```typescript
validateCNPJ(cnpj: string): boolean
```
- Remove caracteres não numéricos
- Verifica se tem 14 dígitos
- Valida dígitos verificadores

#### Email
```typescript
validateEmail(email: string): boolean
```
- Valida formato básico de email usando regex

#### Telefone
```typescript
validatePhone(phone: string): boolean
```
- Remove caracteres não numéricos
- Verifica se tem entre 10 e 11 dígitos

## Regras por Módulo

### Atendimentos

**Localização:** `src/lib/business-rules/assistencial/atendimentos.ts`

#### Cálculo de KPIs
```typescript
calculateAtendimentosKPIs(atendimentos: Atendimento[])
```

**Retorna:**
- `atendimentosHoje`: Contagem de atendimentos do dia atual
- `tempoMedioEspera`: Tempo médio de espera em minutos
- `atendimentosAguardando`: Quantidade de atendimentos aguardando
- `taxaOcupacao`: Taxa de ocupação baseada em capacidade estimada
- `atendimentosEmAndamento`: Quantidade em atendimento
- `atendimentosFinalizados`: Quantidade finalizados

#### Identificação de Longa Espera
```typescript
identifyAtendimentosLongaEspera(
  atendimentos: Atendimento[],
  limiteMinutos: number = 60
): Atendimento[]
```

**Regra:**
- Identifica atendimentos com status `aguardando` e tempo de espera maior que o limite (padrão: 60 minutos)

#### Estatísticas por Especialidade
```typescript
calculateEstatisticasPorEspecialidade(atendimentos: Atendimento[])
```

**Retorna:**
- Distribuição por especialidade
- Tempo médio de espera por especialidade
- Quantidade em espera por especialidade
- Quantidade finalizados por especialidade

#### Padrões de Demanda
```typescript
identifyPadroesDemanda(atendimentos: Atendimento[])
```

**Retorna:**
- Horário de pico
- Quantidade no pico
- Especialidade mais demandada
- Horários de baixa demanda

### Ambulatório

**Localização:** `src/lib/business-rules/assistencial/ambulatorio.ts`

#### Cálculo de KPIs
```typescript
calculateAmbulatorioKPIs(agendamentos: AmbulatorioAgendamento[])
```

**Retorna:**
- `agendamentosHoje`: Contagem de agendamentos do dia
- `taxaOcupacao`: Taxa de ocupação baseada em capacidade
- `taxaNoShow`: Taxa de no-show em percentual
- `agendados`, `confirmados`, `emAtendimento`, `finalizados`, `noShows`, `cancelados`: Contagens por status
- `encaixesHoje`: Quantidade de encaixes do dia

#### Risco de No-Show
```typescript
identifyRiscoNoShow(
  agendamentos: AmbulatorioAgendamento[],
  historicoNoShow: Record<string, number> = {}
): AmbulatorioAgendamento[]
```

**Regras:**
- Identifica agendamentos com status `agendado` ou `confirmado`
- Considera histórico de no-show do paciente (> 2 ocorrências = alto risco)
- Considera agendamentos feitos com menos de 24h de antecedência (risco médio)

#### Taxa de Encaixes
```typescript
calculateTaxaEncaixes(agendamentos: AmbulatorioAgendamento[]): number
```

**Regra:**
- Conta agendamentos do tipo `consulta` com status `agendado`
- Fórmula: `(encaixes / total) * 100`

#### Horários Disponíveis
```typescript
identifyHorariosDisponiveis(
  agendamentos: AmbulatorioAgendamento[],
  data: string
): string[]
```

**Regra:**
- Filtra agendamentos do dia especificado
- Retorna horários padrão que não estão ocupados
- Horários padrão: 08:00 a 17:30 em intervalos de 30 minutos

## Permissões

**Localização:** `src/lib/business-rules/permissions.ts`

### Matriz de Permissões

O sistema define permissões por módulo e role:

**Roles:**
- `master`: Acesso total, incluindo configurações avançadas
- `admin`: Acesso completo, exceto configurações avançadas
- `analyst`: Visualização e criação/edição, sem exclusão
- `viewer`: Apenas visualização

**Permissões por Ação:**
- `view`: Visualizar dados
- `create`: Criar novos registros
- `edit`: Editar registros existentes
- `delete`: Excluir registros
- `export`: Exportar dados
- `manage`: Gerenciar configurações avançadas (apenas master)

### Funções de Verificação

```typescript
getModulePermissions(module: string, role: AppRole): ModulePermission
hasModulePermission(module: string, role: AppRole, permission: keyof ModulePermission): boolean
canViewModule(module: string, role: AppRole): boolean
canExportModule(module: string, role: AppRole): boolean
```

## Formatação

### Valores Monetários
```typescript
formatCurrency(value: number): string
```
- Formata usando `Intl.NumberFormat` com locale `pt-BR` e moeda `BRL`
- Exemplo: `R$ 1.500,00`

### Duração
```typescript
formatDuration(minutes: number): string
```
- Se < 60 minutos: retorna "X min"
- Se >= 60 minutos: retorna "Xh Ymin" ou "Xh" se não houver minutos restantes

## Observações Importantes

1. **Dados Mock**: Atualmente, os dados mock estão inline nas páginas devido a problemas de permissão. Quando resolvido, devem ser movidos para `src/data/mock/`.

2. **Capacidade Estimada**: Alguns cálculos usam valores de capacidade estimada hardcoded. Em produção, estes devem vir de configurações do sistema.

3. **Histórico**: Funções que dependem de histórico (ex: `identifyRiscoNoShow`) recebem o histórico como parâmetro. Em produção, este histórico deve ser obtido do banco de dados.

4. **Validações de Data**: As validações de data não consideram timezone. Em produção, deve-se considerar o timezone do servidor/banco de dados.

5. **Performance**: Alguns cálculos podem ser otimizados com índices no banco de dados e cache de resultados.
