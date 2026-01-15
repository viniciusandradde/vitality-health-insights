-- ========================================================================
-- ENDPOINT: GET /api/v1/dashboard/ocupacao-leitos (Grafico Evolucao)
-- ========================================================================
-- Evolucao de ocupacao nos ultimos N dias
-- Parametro: :dias (padrao 30)
-- ========================================================================

WITH datas AS (
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        '1 day'::interval
    )::date as data
),

ocupacao_diaria AS (
    SELECT 
        d.data,
        COUNT(DISTINCT aa.numatend) FILTER (
            WHERE aa.datatend::date <= d.data 
            AND (aa.datasai IS NULL OR aa.datasai::date > d.data)
        ) as ocupados
    FROM datas d
    CROSS JOIN "PACIENTE".arqatend aa
    INNER JOIN "PACIENTE".arqint ai ON ai.numatend = aa.numatend
    WHERE aa.tipoatend = 'I'
    GROUP BY d.data
)

SELECT 
    'EVOLUCAO_OCUPACAO' as componente,
    TO_CHAR(data, 'YYYY-MM-DD') as data,
    ocupados as ocupacao,
    (SELECT COUNT(*) FROM "PACIENTE".cadlei WHERE leitodia = 'S' AND tipobloq <> 'D') as total
FROM ocupacao_diaria
ORDER BY data;
