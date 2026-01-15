-- ========================================================================
-- ENDPOINT: GET /api/v1/dashboard/ocupacao-leitos (Pie Chart Especialidades)
-- ========================================================================
-- Top 10 especialidades por ocupacao de internacoes ativas
-- ========================================================================

WITH centros_custo_ativos AS (
    SELECT unnest(ARRAY['000012', '000007', '000014', '000017', '000008']) as codcc
)

SELECT 
    'OCUPACAO_POR_ESPECIALIDADE' as componente,
    COALESCE(ce.nomeesp, 'SEM ESPECIALIDADE') as especialidade,
    COUNT(DISTINCT aa.numatend) as quantidade,
    ROUND(
        COUNT(DISTINCT aa.numatend)::NUMERIC * 100.0 / 
        NULLIF(SUM(COUNT(DISTINCT aa.numatend)) OVER (), 0), 
        2
    ) as percentual
FROM "PACIENTE".arqatend aa
INNER JOIN centros_custo_ativos cca ON cca.codcc = aa.codcc
INNER JOIN "PACIENTE".arqint ai ON ai.numatend = aa.numatend
LEFT JOIN "PACIENTE".cadesp ce ON ce.codesp = aa.codesp
WHERE aa.tipoatend = 'I'
  AND aa.datasai IS NULL
GROUP BY ce.nomeesp
ORDER BY quantidade DESC
LIMIT 10;
