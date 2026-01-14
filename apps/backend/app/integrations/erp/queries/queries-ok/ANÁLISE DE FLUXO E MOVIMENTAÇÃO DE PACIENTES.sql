-- ========================================================================
-- PAINEL 2: ANÁLISE DE FLUXO E MOVIMENTAÇÃO DE PACIENTES
-- ========================================================================
--
-- OBJETIVO: Fornecer visão detalhada do fluxo de entrada, saída e 
-- movimentação interna de pacientes internados
--
-- COMPONENTES DO DASHBOARD:
-- 1. Cards: Entradas, Saídas, Transferências e Tempo Médio
-- 2. Linha do Tempo: Admissões vs Altas (últimos 30 dias)
-- 3. Motivos de Alta (Gráfico de Barras)
-- 4. Origem das Internações (Pie Chart)
-- 5. Transferências entre Setores (Sankey/Matriz)
-- 6. Tempo de Permanência por Setor (Boxplot)
-- 7. Censo por Hora do Dia (Heatmap)
--
-- AUTOR: VSA Analytics Health | Sr. Vinícius
-- DATA: 2025-01-12
-- VERSÃO: 1.0
-- ========================================================================

-- =======================================================================
-- SEÇÃO 1: CARDS PRINCIPAIS - MOVIMENTAÇÃO DO DIA
-- =======================================================================
WITH movimentacao_dia AS (
    SELECT 
        aa.numatend,
        aa.tipoatend,
        aa.datatend,
        aa.datasai,
        ai.codtipsai,
        aa.codcc,
        DATE(aa.datatend) as data_admissao,
        DATE(aa.datasai) as data_alta,
        EXTRACT(EPOCH FROM (COALESCE(aa.datasai, CURRENT_TIMESTAMP) - aa.datatend)) / 86400 as dias_permanencia
    FROM "PACIENTE".arqatend aa
    LEFT JOIN "PACIENTE".arqint ai ON ai.numatend = aa.numatend
    WHERE aa.tipoatend = 'I'
      AND aa.datatend >= CURRENT_DATE - INTERVAL '30 days'
)

SELECT 
    'CARDS_MOVIMENTACAO' as componente,
    
    -- CARD 1: Admissões do Dia
    COUNT(*) FILTER (WHERE data_admissao = CURRENT_DATE) as admissoes_hoje,
    
    -- CARD 2: Altas do Dia
    COUNT(*) FILTER (WHERE data_alta = CURRENT_DATE) as altas_hoje,
    
    -- CARD 3: Transferências do Dia (estimativa)
    COUNT(*) FILTER (
        WHERE data_admissao = CURRENT_DATE 
        AND codcc IN (
            SELECT DISTINCT codcc 
            FROM "PACIENTE".arqatend 
            WHERE datatend < CURRENT_DATE
        )
    ) as transferencias_hoje,
    
    -- CARD 4: Tempo Médio de Permanência (dias)
    ROUND(AVG(dias_permanencia) FILTER (WHERE datasai IS NOT NULL)::NUMERIC, 2) as tempo_medio_permanencia

FROM movimentacao_dia;


-- =======================================================================
-- SEÇÃO 2: LINHA DO TEMPO - ADMISSÕES VS ALTAS (30 DIAS)
-- =======================================================================
WITH calendario AS (
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '29 days',
        CURRENT_DATE,
        INTERVAL '1 day'
    )::DATE as data
),

admissoes_diarias AS (
    SELECT 
        DATE(aa.datatend) as data,
        COUNT(*) as total_admissoes
    FROM "PACIENTE".arqatend aa
    WHERE aa.tipoatend = 'I'
      AND aa.datatend >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(aa.datatend)
),

altas_diarias AS (
    SELECT 
        DATE(aa.datasai) as data,
        COUNT(*) as total_altas
    FROM "PACIENTE".arqatend aa
    WHERE aa.tipoatend = 'I'
      AND aa.datasai >= CURRENT_DATE - INTERVAL '29 days'
      AND aa.datasai IS NOT NULL
    GROUP BY DATE(aa.datasai)
)

SELECT 
    'TIMELINE_ADMISSOES_ALTAS' as componente,
    c.data,
    COALESCE(ad.total_admissoes, 0) as admissoes,
    COALESCE(al.total_altas, 0) as altas,
    COALESCE(ad.total_admissoes, 0) - COALESCE(al.total_altas, 0) as saldo_dia
FROM calendario c
LEFT JOIN admissoes_diarias ad ON ad.data = c.data
LEFT JOIN altas_diarias al ON al.data = c.data
ORDER BY c.data;



-- =======================================================================
-- SEÇÃO 6: TEMPO DE PERMANÊNCIA POR SETOR (ESTATÍSTICAS)
-- =======================================================================
SELECT 
    'PERMANENCIA_POR_SETOR' as componente,
    cc.nomecc as setor,
    COUNT(*) as total_pacientes,
    ROUND(MIN(EXTRACT(EPOCH FROM (COALESCE(aa.datasai, CURRENT_TIMESTAMP) - aa.datatend)) / 86400)::NUMERIC, 2) as minimo_dias,
    ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (COALESCE(aa.datasai, CURRENT_TIMESTAMP) - aa.datatend)) / 86400)::NUMERIC, 2) as quartil_25,
    ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (COALESCE(aa.datasai, CURRENT_TIMESTAMP) - aa.datatend)) / 86400)::NUMERIC, 2) as mediana_dias,
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (COALESCE(aa.datasai, CURRENT_TIMESTAMP) - aa.datatend)) / 86400)::NUMERIC, 2) as quartil_75,
    ROUND(MAX(EXTRACT(EPOCH FROM (COALESCE(aa.datasai, CURRENT_TIMESTAMP) - aa.datatend)) / 86400)::NUMERIC, 2) as maximo_dias,
    ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(aa.datasai, CURRENT_TIMESTAMP) - aa.datatend)) / 86400)::NUMERIC, 2) as media_dias
FROM "PACIENTE".arqatend aa
INNER JOIN "PACIENTE".arqint ai ON ai.numatend = aa.numatend
INNER JOIN "PACIENTE".cadcc cc ON cc.codcc = aa.codcc
WHERE aa.tipoatend = 'I'
  AND aa.datatend >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY cc.nomecc
ORDER BY total_pacientes DESC;


-- =======================================================================
-- SEÇÃO 7: CENSO POR HORA DO DIA (HEATMAP)
-- =======================================================================
WITH horas AS (
    SELECT generate_series(0, 23) as hora
),

internacoes_hora AS (
    SELECT 
        EXTRACT(HOUR FROM aa.datatend) as hora_admissao,
        COUNT(*) as total_admissoes
    FROM "PACIENTE".arqatend aa
    WHERE aa.tipoatend = 'I'
      AND aa.datatend >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY EXTRACT(HOUR FROM aa.datatend)
),

altas_hora AS (
    SELECT 
        EXTRACT(HOUR FROM aa.datasai) as hora_alta,
        COUNT(*) as total_altas
    FROM "PACIENTE".arqatend aa
    WHERE aa.tipoatend = 'I'
      AND aa.datasai >= CURRENT_DATE - INTERVAL '7 days'
      AND aa.datasai IS NOT NULL
    GROUP BY EXTRACT(HOUR FROM aa.datasai)
)

SELECT 
    'CENSO_POR_HORA' as componente,
    h.hora,
    COALESCE(ih.total_admissoes, 0) as admissoes,
    COALESCE(ah.total_altas, 0) as altas,
    COALESCE(ih.total_admissoes, 0) - COALESCE(ah.total_altas, 0) as saldo
FROM horas h
LEFT JOIN internacoes_hora ih ON ih.hora_admissao = h.hora
LEFT JOIN altas_hora ah ON ah.hora_alta = h.hora
ORDER BY h.hora;
