-- ========================================================================
-- ENDPOINT: GET /api/v1/dashboard/ocupacao-leitos
-- ========================================================================
-- Ocupacao de leitos APENAS dos centros de custo de internacao ATIVOS
-- CENTROS DE CUSTO VALIDOS: 000012 (ALA 3), 000007 (ALA 1), 000014 (UTI),
-- 000017 (UTI NEO-NATAL), 000008 (ALA 2 - CLINICA CIRURGICA)
-- ========================================================================

WITH centros_custo_ativos AS (
    SELECT unnest(ARRAY['000012', '000007', '000014', '000017', '000008']) as codcc
),

leitos_por_cc AS (
    SELECT
        COALESCE(cc.nomecc, 'NAO ESPECIFICADO') as centro_custo,
        ca.codcc as codigo_cc,
        COUNT(DISTINCT cl.codlei) as leitos_cadastrados,
        COUNT(DISTINCT cl.codlei) FILTER (
            WHERE EXISTS (
                SELECT 1 FROM "PACIENTE".movlei ml
                INNER JOIN "PACIENTE".arqatend aa ON aa.numatend = ml.numatend
                WHERE ml.codlei = cl.codlei
                AND aa.datasai IS NULL
                ORDER BY ml.numseq DESC
                LIMIT 1
            )
        ) as leitos_ocupados,
        COUNT(DISTINCT cl.codlei) FILTER (
            WHERE NOT EXISTS (
                SELECT 1 FROM "PACIENTE".movlei ml
                INNER JOIN "PACIENTE".arqatend aa ON aa.numatend = ml.numatend
                WHERE ml.codlei = cl.codlei
                AND aa.datasai IS NULL
                ORDER BY ml.numseq DESC
                LIMIT 1
            )
        ) as leitos_disponiveis,
        COUNT(DISTINCT cl.codlei) FILTER (WHERE cl.tipobloq = 'I') as leitos_bloqueados
    FROM "PACIENTE".cadlei cl
    INNER JOIN "PACIENTE".cadaco ca ON ca.codaco = cl.codaco
    INNER JOIN centros_custo_ativos cca ON cca.codcc = ca.codcc
    LEFT JOIN "PACIENTE".cadcc cc ON cc.codcc = ca.codcc
    WHERE cl.tipobloq <> 'D'
      AND cl.leitodia = 'S'
    GROUP BY ca.codcc, cc.nomecc
)

SELECT
    'OCUPACAO_LEITOS' as componente,
    CURRENT_TIMESTAMP as data_atualizacao,
    centro_custo,
    codigo_cc,
    leitos_cadastrados,
    leitos_ocupados,
    leitos_disponiveis as leitos_vagos,
    leitos_bloqueados,
    leitos_ocupados as leitos_censo,
    ROUND(
        (leitos_ocupados::NUMERIC / NULLIF(leitos_cadastrados - leitos_bloqueados, 0)) * 100,
        2
    ) as taxa_ocupacao,
    ROUND(
        (leitos_ocupados::NUMERIC / NULLIF(leitos_cadastrados, 0)) * 100,
        2
    ) as taxa_ocupacao_total,
    CASE
        WHEN ROUND((leitos_ocupados::NUMERIC / NULLIF(leitos_cadastrados - leitos_bloqueados, 0)) * 100, 2) >= 90
        THEN 'critico'
        WHEN ROUND((leitos_ocupados::NUMERIC / NULLIF(leitos_cadastrados - leitos_bloqueados, 0)) * 100, 2) >= 80
        THEN 'atencao'
        WHEN ROUND((leitos_ocupados::NUMERIC / NULLIF(leitos_cadastrados - leitos_bloqueados, 0)) * 100, 2) >= 70
        THEN 'normal'
        ELSE 'baixo'
    END as status_ocupacao
FROM leitos_por_cc
ORDER BY
    CASE WHEN codigo_cc IN ('000014', '000017') THEN 1 ELSE 2 END,
    taxa_ocupacao DESC;
