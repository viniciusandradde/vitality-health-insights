-- ========================================================================
-- ENDPOINT: GET /api/v1/dashboard/atendimentos
-- ========================================================================
-- Atendimentos ambulatoriais com filtros
-- Parametros: :data_inicio, :data_fim (opcionais, padrao ultimos 30 dias)
-- ========================================================================

SELECT 
    aa.numatend,
    aa.tipoatend as tipo,
    aa.datatend as data,
    TO_CHAR(aa.datatend, 'HH24:MI') as hora,
    ce.nomeesp as especialidade,
    cv.razaoconv as convenio,
    CASE 
        WHEN UPPER(cv.razaoconv) LIKE '%SUS%' THEN 'SUS'
        WHEN UPPER(cv.razaoconv) LIKE '%PARTICULAR%' THEN 'particular'
        ELSE 'convenio'
    END as categoria_convenio,
    cc.nomecc as centro_custo,
    CASE 
        WHEN p.dtnascimento IS NOT NULL THEN 
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.dtnascimento))::INTEGER
        ELSE NULL
    END as idade
FROM "PACIENTE".arqatend aa
LEFT JOIN "PACIENTE".cadprest pr ON aa.codprest = pr.codprest
LEFT JOIN "PACIENTE".cadesp ce ON ce.codesp = aa.codesp
LEFT JOIN "PACIENTE".cadplaco cp ON cp.codplaco = aa.codplaco
LEFT JOIN "PACIENTE".cadconv cv ON cv.codconv = cp.codconv
LEFT JOIN "PACIENTE".cadcc cc ON cc.codcc = aa.codcc
LEFT JOIN "PACIENTE".cadpac p ON p.codpac = aa.codpac
WHERE aa.tipoatend IN ('A', 'E', 'U')
  AND aa.datatend >= COALESCE($1::DATE, CURRENT_DATE - INTERVAL '30 days')
  AND aa.datatend <= COALESCE($2::DATE, CURRENT_DATE)
ORDER BY aa.datatend DESC;
