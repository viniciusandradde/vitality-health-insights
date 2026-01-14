-- ========================================================================
-- ENDPOINT: GET /api/v1/dashboard/internacoes
-- ========================================================================
-- Indicadores completos de internacoes
-- Parametros: :data_inicio, :data_fim (opcionais, padrao ultimos 30 dias)
-- ========================================================================

WITH internacoes AS (
    SELECT 
        aa.numatend,
        aa.datatend as data_entrada,
        aa.datasai as data_saida,
        cc.nomecc as centro_custo,
        ce.nomeesp as especialidade,
        pr.nomeprest as medico,
        cv.razaoconv as convenio,
        aa.proveniencia,
        ai.obito,
        EXTRACT(EPOCH FROM (COALESCE(aa.datasai, CURRENT_TIMESTAMP) - aa.datatend)) / 86400 as dias_permanencia
    FROM "PACIENTE".arqatend aa
    LEFT JOIN "PACIENTE".arqint ai ON ai.numatend = aa.numatend
    LEFT JOIN "PACIENTE".cadcc cc ON cc.codcc = aa.codcc
    LEFT JOIN "PACIENTE".cadprest pr ON pr.codprest = aa.codprest
    LEFT JOIN "PACIENTE".cadesp ce ON ce.codesp = aa.codesp
    LEFT JOIN "PACIENTE".cadplaco cp ON cp.codplaco = aa.codplaco
    LEFT JOIN "PACIENTE".cadconv cv ON cv.codconv = cp.codconv
    WHERE aa.tipoatend = 'I'
      AND aa.datatend >= COALESCE($1::DATE, CURRENT_DATE - INTERVAL '30 days')
      AND aa.datatend <= COALESCE($2::DATE, CURRENT_DATE)
)

SELECT 
    'INTERNACOES_INDICADORES' as componente,
    ROUND(AVG(dias_permanencia) FILTER (WHERE data_saida IS NOT NULL)::NUMERIC, 2) as media_permanencia,
    COUNT(*) FILTER (WHERE obito = true) as obitos,
    COUNT(*) FILTER (WHERE proveniencia = 'PS') as internacoes_ps,
    COUNT(*) FILTER (WHERE DATE(data_entrada) = CURRENT_DATE) as entradas_hoje,
    COUNT(*) FILTER (WHERE DATE(data_saida) = CURRENT_DATE) as saidas_hoje,
    COUNT(*) as total_internacoes
FROM internacoes;
