-- ========================================================================
-- PAINEL COMPLETO DE OCUPAÇÃO DE LEITOS - WARELINE
-- ========================================================================
-- 
-- DESCRIÇÃO: Query unificada para gerar todos os componentes do dashboard
-- de ocupação de leitos hospitalares
--
-- COMPONENTES DO DASHBOARD:
-- 1. Cards Principais (6 indicadores)
-- 2. Taxa de Ocupação (Donut Chart)
-- 3. Tipo de Leito (Pie Chart)
-- 4. Leitos por Setor (Tabela)
-- 5. Ocupação por Convênio (Pie Chart)
-- 6. Ocupação por Especialidade (Pie Chart)
-- 7. TreeMap de Leito Dia por Centro de Custo
--
-- AUTOR: VSA Analytics Health | Sr. Vinícius
-- DATA: 2025-01-12
-- VERSÃO: 2.0
-- ========================================================================

-- =======================================================================
-- SEÇÃO 1: CARDS PRINCIPAIS DO DASHBOARD
-- =======================================================================
WITH leitos_base AS (
    SELECT 
        cl.codlei,
        cl.leitodia,
        ca.codtipaco,
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
    LEFT JOIN "PACIENTE".cadplaco cp ON cp.codplaco = aa.codplaco
    WHERE aa.datatend >= '2026-01-01'
      AND aa.datasai IS NULL
)

SELECT 
    'CARDS_PRINCIPAIS' as componente,
    
    -- CARD 1: Convênio e Particulares (convênios diferentes de SUS)
    COUNT(DISTINCT CASE 
        WHEN at.codconv IS NOT NULL AND at.codconv <> 'SIH' 
        THEN at.numatend 
    END) as convenio_particulares,
    
    -- CARD 2: SUS
    COUNT(DISTINCT CASE 
        WHEN at.codconv = 'SIH' 
        THEN at.numatend 
    END) as sus,
    
    -- CARD 3: Leitos Ocupados
    COUNT(DISTINCT lb.codlei) FILTER (WHERE lb.numatend IS NOT NULL) as ocupado,
    
    -- CARD 4: Leitos Livres
    COUNT(DISTINCT lb.codlei) FILTER (WHERE lb.numatend IS NULL) as livre,
    
    -- CARD 5: Total Leitos Dia Sim
    COUNT(DISTINCT lb.codlei) as leitos_dia_sim,
    
    -- CARD 6: Total Geral de Leitos
    (SELECT COUNT(*) 
     FROM "PACIENTE".cadlei 
     WHERE leitodia = 'S' AND tipobloq <> 'D') as total_leitos

FROM leitos_base lb
LEFT JOIN atendimentos_internados at ON at.codlei = lb.codlei;


-- =======================================================================
-- SEÇÃO 2: TAXA DE OCUPAÇÃO DE LEITOS (DONUT CHART)
-- =======================================================================
SELECT 
    'TAXA_OCUPACAO' as componente,
    COUNT(CASE WHEN numatend IS NOT NULL THEN 1 END) as ocupado,
    COUNT(CASE WHEN numatend IS NULL THEN 1 END) as livre,
    ROUND(
        COUNT(CASE WHEN numatend IS NOT NULL THEN 1 END)::NUMERIC * 100.0 / 
        NULLIF(COUNT(*), 0), 
        2
    ) as percentual_ocupacao
FROM (
    SELECT 
        cl.codlei,
        (SELECT ml.numatend 
         FROM "PACIENTE".movlei ml 
         WHERE ml.codlei = cl.codlei 
         ORDER BY ml.numseq DESC 
         LIMIT 1) as numatend
    FROM "PACIENTE".cadlei cl
    WHERE cl.leitodia = 'S' AND cl.tipobloq <> 'D'
) leitos;


-- =======================================================================
-- SEÇÃO 3: TIPO DE LEITO (PIE CHART)
-- =======================================================================
SELECT 
    'TIPO_LEITO' as componente,
    CASE 
        WHEN ca.codtipaco = 'ENF' THEN 'ENF'
        WHEN ca.codtipaco = 'UTI' THEN 'UTI'
        WHEN ca.codtipaco = 'APT' THEN 'APT'
        WHEN ca.codtipaco = 'SUI' THEN 'SUI'
        ELSE 'OUTROS'
    END as tipo_leito,
    COUNT(*) as quantidade,
    ROUND(COUNT(*)::NUMERIC * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM "PACIENTE".cadlei cl
INNER JOIN "PACIENTE".cadaco ca ON ca.codaco = cl.codaco
WHERE cl.leitodia = 'S' AND cl.tipobloq <> 'D'
GROUP BY ca.codtipaco
ORDER BY quantidade DESC;


-- =======================================================================
-- SEÇÃO 4: LEITOS POR SETOR (TABELA)
-- =======================================================================
SELECT 
    'LEITOS_POR_SETOR' as componente,
    cc.nomecc as centro_custo,
    COUNT(CASE WHEN numatend IS NULL THEN 1 END) as livre,
    COUNT(CASE WHEN numatend IS NOT NULL THEN 1 END) as ocupado,
    COUNT(*) as total
FROM (
    SELECT 
        cl.codlei,
        ca.codcc,
        (SELECT ml.numatend 
         FROM "PACIENTE".movlei ml 
         WHERE ml.codlei = cl.codlei 
         ORDER BY ml.numseq DESC 
         LIMIT 1) as numatend
    FROM "PACIENTE".cadlei cl
    INNER JOIN "PACIENTE".cadaco ca ON ca.codaco = cl.codaco
    WHERE cl.leitodia = 'S' AND cl.tipobloq <> 'D'
) leitos
INNER JOIN "PACIENTE".cadcc cc ON cc.codcc = leitos.codcc
GROUP BY cc.nomecc
ORDER BY total DESC;


-- =======================================================================
-- SEÇÃO 5: OCUPAÇÃO DE LEITO POR CONVÊNIO (PIE CHART)
-- =======================================================================
SELECT 
    'OCUPACAO_POR_CONVENIO' as componente,
    COALESCE(cv.razaoconv, 'SEM CONVÊNIO') as convenio,
    COUNT(DISTINCT aa.numatend) as quantidade,
    ROUND(
        COUNT(DISTINCT aa.numatend)::NUMERIC * 100.0 / 
        SUM(COUNT(DISTINCT aa.numatend)) OVER (), 
        2
    ) as percentual
FROM "PACIENTE".arqatend aa
INNER JOIN "PACIENTE".arqint ai ON ai.numatend = aa.numatend
LEFT JOIN "PACIENTE".cadplaco cp ON cp.codplaco = aa.codplaco
LEFT JOIN "PACIENTE".cadconv cv ON cv.codconv = cp.codconv
WHERE aa.datatend >= '2026-01-01'
  AND aa.datasai IS NULL
GROUP BY cv.razaoconv
ORDER BY quantidade DESC
LIMIT 10;


-- =======================================================================
-- SEÇÃO 6: OCUPAÇÃO POR ESPECIALIDADE (PIE CHART)
-- =======================================================================
SELECT 
    'OCUPACAO_POR_ESPECIALIDADE' as componente,
    COALESCE(ce.nomeesp, 'SEM ESPECIALIDADE') as especialidade,
    COUNT(DISTINCT aa.numatend) as quantidade,
    ROUND(
        COUNT(DISTINCT aa.numatend)::NUMERIC * 100.0 / 
        SUM(COUNT(DISTINCT aa.numatend)) OVER (), 
        2
    ) as percentual
FROM "PACIENTE".arqatend aa
INNER JOIN "PACIENTE".arqint ai ON ai.numatend = aa.numatend
LEFT JOIN "PACIENTE".cadesp ce ON ce.codesp = aa.codesp
WHERE aa.datatend >= '2026-01-01'
  AND aa.datasai IS NULL
GROUP BY ce.nomeesp
ORDER BY quantidade DESC
LIMIT 10;


-- =======================================================================
-- SEÇÃO 7: TREEMAP - LEITO DIA POR CENTRO DE CUSTO
-- =======================================================================
SELECT 
    'TREEMAP_LEITO_DIA' as componente,
    cc.nomecc as centro_custo,
    COUNT(*) as total_leitos,
    ROUND(
        COUNT(*)::NUMERIC * 100.0 / 
        SUM(COUNT(*)) OVER (), 
        2
    ) as percentual
FROM "PACIENTE".cadlei cl
INNER JOIN "PACIENTE".cadaco ca ON ca.codaco = cl.codaco
INNER JOIN "PACIENTE".cadcc cc ON cc.codcc = ca.codcc
WHERE cl.leitodia = 'S' AND cl.tipobloq <> 'D'
GROUP BY cc.nomecc
ORDER BY total_leitos DESC;
