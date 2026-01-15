-- ========================================================================
-- ENDPOINT: GET /api/v1/dashboard/indicadores-gerais
-- ========================================================================
--
-- OBJETIVO: Fornecer KPIs principais do dashboard em tempo real
--
-- METRICAS INCLUIDAS:
-- 1. Atendimentos (hoje vs ontem)
-- 2. Ocupacao UTI (pacientes / total leitos)
-- 3. Cirurgias realizadas hoje
-- 4. Leitos disponiveis (total geral)
--
-- AUTOR: VSA Analytics Health | Sr. Vinicius
-- DATA: 2025-01-14
-- VERSAO: 2.0 (CORRIGIDA - SEM CARACTERES ESPECIAIS UTF-8)
-- ========================================================================

WITH
-- =====================================================================
-- CTE 1: ATENDIMENTOS DO DIA
-- =====================================================================
atendimentos_dia AS (
    SELECT
        COUNT(*) FILTER (WHERE DATE(datatend) = CURRENT_DATE) as hoje,
        COUNT(*) FILTER (WHERE DATE(datatend) = CURRENT_DATE - 1) as ontem,
        COUNT(*) FILTER (WHERE DATE(datatend) = CURRENT_DATE
            AND tipoatend = 'I') as internacoes_hoje,
        COUNT(*) FILTER (WHERE DATE(datatend) = CURRENT_DATE
            AND tipoatend IN ('A', 'E')) as ambulatoriais_hoje
    FROM "PACIENTE".arqatend
    WHERE datatend >= CURRENT_DATE - 1
),

-- =====================================================================
-- CTE 2: OCUPACAO UTI
-- =====================================================================
ocupacao_uti AS (
    SELECT
        -- Pacientes atualmente em UTI (sem alta)
        COUNT(DISTINCT aa.numatend) as ocupados,
        -- Total de leitos de UTI disponiveis
        (SELECT COUNT(*)
         FROM "PACIENTE".cadlei cl
         INNER JOIN "PACIENTE".cadaco ca ON ca.codaco = cl.codaco
         INNER JOIN "PACIENTE".cadcc cc ON cc.codcc = ca.codcc
         WHERE cl.leitodia = 'D'
         AND cl.tipobloq <> 'I'
         AND UPPER(cc.nomecc) LIKE '%UTI%'
        ) as total_leitos
    FROM "PACIENTE".arqatend aa
    INNER JOIN "PACIENTE".cadcc cc ON cc.codcc = aa.codcc
    WHERE aa.tipoatend = 'I'
      AND aa.datasai IS NULL
      AND UPPER(cc.nomecc) LIKE '%UTI%'
),

-- =====================================================================
-- CTE 3: CIRURGIAS DO DIA
-- =====================================================================
cirurgias_dia AS (
    SELECT
        COUNT(DISTINCT ic.numatend) as total_cirurgias,
        COUNT(DISTINCT ic.numatend) FILTER (
            WHERE aa.situacao = 'R'
        ) as cirurgias_realizadas,
        COUNT(DISTINCT ic.numatend) FILTER (
            WHERE aa.situacao = 'P'
        ) as cirurgias_pendentes
    FROM "PACIENTE".ihcirurg ic
    INNER JOIN "PACIENTE".arqatend aa ON aa.numatend = ic.numatend
    WHERE DATE(aa.datatend) = CURRENT_DATE
),

-- =====================================================================
-- CTE 4: LEITOS DISPONIVEIS (TODOS OS TIPOS)
-- =====================================================================
leitos_geral AS (
    SELECT
        COUNT(*) as total_leitos,
        COUNT(*) FILTER (WHERE tipobloq <> 'I') as leitos_disponiveis,
        COUNT(*) FILTER (WHERE tipobloq = 'I') as leitos_bloqueados,
        -- Leitos ocupados (com paciente internado sem alta)
        COUNT(DISTINCT CASE
            WHEN ai.numatend IS NOT NULL AND aa.datasai IS NULL
            THEN cl.codlei
        END) as leitos_ocupados
    FROM "PACIENTE".cadlei cl
    LEFT JOIN "PACIENTE".arqint ai ON ai.codlei = cl.codlei
    LEFT JOIN "PACIENTE".arqatend aa ON aa.numatend = ai.numatend
        AND aa.datasai IS NULL
    WHERE cl.leitodia = 'D'
),

-- =====================================================================
-- CTE 5: COMPARATIVOS E TENDENCIAS
-- =====================================================================
tendencias AS (
    SELECT
        -- Variacao percentual dia a dia
        CASE
            WHEN ad.ontem > 0
            THEN ROUND(((ad.hoje - ad.ontem)::NUMERIC * 100.0 / ad.ontem), 1)
            ELSE 0
        END as variacao_atendimentos_pct,
        -- Taxa de ocupacao UTI
        CASE
            WHEN ou.total_leitos > 0
            THEN ROUND((ou.ocupados::NUMERIC * 100.0 / ou.total_leitos), 1)
            ELSE 0
        END as taxa_ocupacao_uti_pct,
        -- Taxa de ocupacao geral
        CASE
            WHEN lg.leitos_disponiveis > 0
            THEN ROUND((lg.leitos_ocupados::NUMERIC * 100.0 / lg.leitos_disponiveis), 1)
            ELSE 0
        END as taxa_ocupacao_geral_pct
    FROM atendimentos_dia ad
    CROSS JOIN ocupacao_uti ou
    CROSS JOIN leitos_geral lg
)

-- =====================================================================
-- RESULTADO FINAL: JSON ESTRUTURADO
-- =====================================================================
SELECT
    'INDICADORES_GERAIS' as componente,
    CURRENT_TIMESTAMP as data_atualizacao,
    -- SECAO 1: ATENDIMENTOS
    json_build_object(
        'hoje', ad.hoje,
        'ontem', ad.ontem,
        'variacao_percentual', t.variacao_atendimentos_pct,
        'internacoes_hoje', ad.internacoes_hoje,
        'ambulatoriais_hoje', ad.ambulatoriais_hoje,
        'tendencia', CASE
            WHEN ad.hoje > ad.ontem THEN 'crescente'
            WHEN ad.hoje < ad.ontem THEN 'decrescente'
            ELSE 'estavel'
        END
    ) as atendimentos,
    -- SECAO 2: OCUPACAO UTI
    json_build_object(
        'ocupados', COALESCE(ou.ocupados, 0),
        'total_leitos', COALESCE(ou.total_leitos, 0),
        'taxa_ocupacao', t.taxa_ocupacao_uti_pct,
        'disponiveis', COALESCE(ou.total_leitos - ou.ocupados, 0),
        'status', CASE
            WHEN t.taxa_ocupacao_uti_pct >= 90 THEN 'critico'
            WHEN t.taxa_ocupacao_uti_pct >= 80 THEN 'atencao'
            ELSE 'normal'
        END
    ) as ocupacao_uti,
    -- SECAO 3: CIRURGIAS
    json_build_object(
        'total_hoje', COALESCE(cd.total_cirurgias, 0),
        'realizadas', COALESCE(cd.cirurgias_realizadas, 0),
        'pendentes', COALESCE(cd.cirurgias_pendentes, 0),
        'taxa_conclusao', CASE
            WHEN cd.total_cirurgias > 0
            THEN ROUND((cd.cirurgias_realizadas::NUMERIC * 100.0 / cd.total_cirurgias), 1)
            ELSE 0
        END
    ) as cirurgias,
    -- SECAO 4: LEITOS GERAIS
    json_build_object(
        'total', lg.total_leitos,
        'disponiveis', lg.leitos_disponiveis,
        'ocupados', lg.leitos_ocupados,
        'bloqueados', lg.leitos_bloqueados,
        'taxa_ocupacao', t.taxa_ocupacao_geral_pct,
        'livres', lg.leitos_disponiveis - lg.leitos_ocupados,
        'status', CASE
            WHEN t.taxa_ocupacao_geral_pct >= 90 THEN 'critico'
            WHEN t.taxa_ocupacao_geral_pct >= 75 THEN 'atencao'
            ELSE 'normal'
        END
    ) as leitos_gerais,
    -- SECAO 5: METRICAS ADICIONAIS
    json_build_object(
        'leitos_criticos_disponiveis', (
            SELECT COUNT(*)
            FROM "PACIENTE".cadlei cl
            INNER JOIN "PACIENTE".cadaco ca ON ca.codaco = cl.codaco
            INNER JOIN "PACIENTE".cadcc cc ON cc.codcc = ca.codcc
            WHERE cl.leitodia = 'D'
            AND cl.tipobloq <> 'I'
            AND UPPER(cc.nomecc) LIKE '%UTI%'
            AND NOT EXISTS (
                SELECT 1 FROM "PACIENTE".arqint ai
                INNER JOIN "PACIENTE".arqatend aa ON aa.numatend = ai.numatend
                WHERE ai.codlei = cl.codlei
                AND aa.datasai IS NULL
            )
        ),
        'tempo_medio_permanencia_dias', (
            SELECT ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(datasai, CURRENT_TIMESTAMP) - datatend)) / 86400)::NUMERIC, 1)
            FROM "PACIENTE".arqatend
            WHERE tipoatend = 'I'
            AND datatend >= CURRENT_DATE - 30
        )
    ) as metricas_adicionais
FROM atendimentos_dia ad
CROSS JOIN ocupacao_uti ou
CROSS JOIN cirurgias_dia cd
CROSS JOIN leitos_geral lg
CROSS JOIN tendencias t;
