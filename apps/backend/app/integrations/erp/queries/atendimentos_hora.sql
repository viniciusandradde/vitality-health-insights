-- ========================================================================
-- ENDPOINT: GET /api/v1/dashboard/atendimentos (Grafico por Hora)
-- ========================================================================
-- Atendimentos por hora do dia
-- ========================================================================

SELECT 
    'ATENDIMENTOS_HORA' as componente,
    TO_CHAR(datatend, 'HH24') || 'h' as hora,
    COUNT(*) as value
FROM "PACIENTE".arqatend
WHERE datatend >= CURRENT_DATE
  AND tipoatend IN ('A', 'E', 'U', 'C')
GROUP BY TO_CHAR(datatend, 'HH24')
ORDER BY hora;
