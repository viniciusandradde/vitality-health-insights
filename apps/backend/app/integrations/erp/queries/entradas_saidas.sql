-- ========================================================================
-- ENDPOINT: GET /api/v1/dashboard/internacoes (Grafico Entradas x Saidas)
-- ========================================================================
-- Entradas e saidas por dia (ultimos 30 dias)
-- ========================================================================

WITH datas AS (
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        '1 day'::interval
    )::date as data
)

SELECT 
    'ENTRADAS_SAIDAS' as componente,
    TO_CHAR(d.data, 'YYYY-MM-DD') as data,
    COUNT(*) FILTER (WHERE aa.datatend::date = d.data) as entradas,
    COUNT(*) FILTER (WHERE aa.datasai::date = d.data) as saidas
FROM datas d
LEFT JOIN "PACIENTE".arqatend aa ON (
    aa.tipoatend = 'I' 
    AND (aa.datatend::date = d.data OR aa.datasai::date = d.data)
)
GROUP BY d.data
ORDER BY d.data;
