-- ========================================================================
-- ENDPOINT: GET /api/v1/dashboard/ocupacao-leitos (Pie Chart Convenios)
-- ========================================================================
-- Top 10 convenios por ocupacao de internacoes ativas
-- ========================================================================

WITH centros_custo_ativos AS (
    SELECT unnest(ARRAY['000012', '000007', '000014', '000017', '000008']) as codcc
)

SELECT 
    'OCUPACAO_POR_CONVENIO' as componente,
    COALESCE(cv.razaoconv, 'SEM CONVENIO') as convenio,
    COUNT(DISTINCT aa.numatend) as quantidade,
    ROUND(
        COUNT(DISTINCT aa.numatend)::NUMERIC * 100.0 / 
        NULLIF(SUM(COUNT(DISTINCT aa.numatend)) OVER (), 0), 
        2
    ) as percentual
FROM "PACIENTE".arqatend aa
INNER JOIN centros_custo_ativos cca ON cca.codcc = aa.codcc
INNER JOIN "PACIENTE".arqint ai ON ai.numatend = aa.numatend
LEFT JOIN "PACIENTE".cadplaco cp ON cp.codplaco = aa.codplaco
LEFT JOIN "PACIENTE".cadconv cv ON cv.codconv = cp.codconv
WHERE aa.tipoatend = 'I'
  AND aa.datasai IS NULL
GROUP BY cv.razaoconv
ORDER BY quantidade DESC
LIMIT 10;
