-- ========================================================================
-- ENDPOINT: GET /api/v1/dashboard/ocupacao-leitos/cards
-- ========================================================================
-- Cards operacionais: Convenio, SUS, Ocupado, Livre, Leito-Dia, Total
-- Baseado em queries validadas do ERP Wareline
-- ========================================================================

WITH centros_custo_ativos AS (
    SELECT unnest(ARRAY['000012', '000007', '000014', '000017', '000008']) as codcc
),

leitos_base AS (
    SELECT 
        cl.codlei,
        cl.leitodia,
        ca.codcc,
        cc.nomecc,
        (SELECT ml.numatend 
         FROM "PACIENTE".movlei ml 
         WHERE ml.codlei = cl.codlei 
         ORDER BY ml.numseq DESC 
         LIMIT 1) as numatend
    FROM "PACIENTE".cadlei cl
    INNER JOIN "PACIENTE".cadaco ca ON ca.codaco = cl.codaco
    INNER JOIN "PACIENTE".cadcc cc ON cc.codcc = ca.codcc
    INNER JOIN centros_custo_ativos cca ON cca.codcc = ca.codcc
    WHERE cl.tipobloq <> 'D'
      AND cl.leitodia = 'S'
),

atendimentos_internados AS (
    SELECT 
        aa.numatend,
        aa.codplaco,
        cp.codconv,
        ai.codlei
    FROM "PACIENTE".arqatend aa
    INNER JOIN "PACIENTE".arqint ai ON ai.numatend = aa.numatend
    INNER JOIN centros_custo_ativos cca ON cca.codcc = aa.codcc
    LEFT JOIN "PACIENTE".cadplaco cp ON cp.codplaco = aa.codplaco
    LEFT JOIN "PACIENTE".cadconv cv ON cv.codconv = cp.codconv
    WHERE aa.tipoatend = 'I'
      AND aa.datasai IS NULL
),

internacoes_ativas AS (
    SELECT
        aa.numatend,
        CASE WHEN cv.categoria = 'S' THEN 'SUS' ELSE 'CONVENIO' END as tipo_convenio
    FROM "PACIENTE".arqatend aa
    INNER JOIN centros_custo_ativos cca ON cca.codcc = aa.codcc
    LEFT JOIN "PACIENTE".cadplaco pl ON pl.codplaco = aa.codplaco
    LEFT JOIN "PACIENTE".cadconv cv ON cv.codconv = pl.codconv
    WHERE aa.tipoatend = 'I' AND aa.datasai IS NULL
),

totais_internacoes AS (
    SELECT
        COUNT(*) FILTER (WHERE tipo_convenio != 'SUS') as convenio_particular,
        COUNT(*) FILTER (WHERE tipo_convenio = 'SUS') as sus,
        COUNT(*) as total_pacientes
    FROM internacoes_ativas
),

totais_leitos AS (
    SELECT
        COUNT(DISTINCT lb.codlei) FILTER (WHERE lb.numatend IS NULL) as total_leitos_ativos,
        COUNT(DISTINCT lb.codlei) FILTER (WHERE lb.numatend IS NULL) as livre,
        COUNT(DISTINCT lb.codlei) FILTER (WHERE lb.numatend IS NOT NULL) as ocupado_cadastro,
        COUNT(DISTINCT lb.codlei) as total_cadastrados
    FROM leitos_base lb
)

SELECT
    'CARDS_OPERACIONAIS_SIMPLES' as componente,
    ti.convenio_particular,
    ti.sus,
    ti.total_pacientes as ocupado,
    tl.livre,
    ti.total_pacientes as leitos_dia_sim,
    tl.total_leitos_ativos as total_leitos,
    tl.ocupado_cadastro as leitos_ocupados_cadastro,
    ROUND((ti.total_pacientes::NUMERIC * 100.0 / NULLIF(tl.total_leitos_ativos, 0)), 2) as taxa_ocupacao_pct
FROM totais_internacoes ti
CROSS JOIN totais_leitos tl;
