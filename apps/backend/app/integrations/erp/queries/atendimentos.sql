-- Buscar atendimentos do ERP
-- Tabela ERP: atendimentos (ajustar conforme estrutura real do ERP)
-- Campos esperados: codigo, paciente_id, data_atendimento, tipo, status
--
-- NOTA: Esta query é um template. Ajustar conforme a estrutura real do banco do ERP.

WITH movimentacao_dia AS (
    SELECT 
        aa.numatend,
        aa.tipoatend,
        aa.datatend,
        aa.datasai,
        ai.codtipsai,
        aa.codcc,
        DATE(aa.datatend) as data_admissao,
        DATE(aa.datasai) as data_alta,
        EXTRACT(EPOCH FROM (COALESCE(aa.datasai, CURRENT_TIMESTAMP) - aa.datatend)) / 86400 as dias_permanencia
    FROM "PACIENTE".arqatend aa
    LEFT JOIN "PACIENTE".arqint ai ON ai.numatend = aa.numatend
    WHERE aa.tipoatend = 'I'
      AND aa.datatend >= CURRENT_DATE - INTERVAL '30 days'
)

SELECT 
    'CARDS_MOVIMENTACAO' as componente,
    
    -- CARD 1: Admissões do Dia
    COUNT(*) FILTER (WHERE data_admissao = CURRENT_DATE) as admissoes_hoje,
    
    -- CARD 2: Altas do Dia
    COUNT(*) FILTER (WHERE data_alta = CURRENT_DATE) as altas_hoje,
    
    -- CARD 3: Transferências do Dia (estimativa)
    COUNT(*) FILTER (
        WHERE data_admissao = CURRENT_DATE 
        AND codcc IN (
            SELECT DISTINCT codcc 
            FROM "PACIENTE".arqatend 
            WHERE datatend < CURRENT_DATE
        )
    ) as transferencias_hoje,
    
    -- CARD 4: Tempo Médio de Permanência (dias)
    ROUND(AVG(dias_permanencia) FILTER (WHERE datasai IS NOT NULL)::NUMERIC, 2) as tempo_medio_permanencia

FROM movimentacao_dia;
