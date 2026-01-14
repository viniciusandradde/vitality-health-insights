-- Buscar dados de estoque do ERP
-- Tabela ERP: estoque (ajustar conforme estrutura real do ERP)
-- Campos esperados: codigo, item, quantidade, unidade, valor
--
-- NOTA: Esta query é um template. Ajustar conforme a estrutura real do banco do ERP.

SELECT 
    e.codigo as codigo_erp,
    e.item_codigo,
    e.item_descricao,
    e.categoria,
    e.quantidade_atual,
    e.quantidade_minima,
    e.quantidade_maxima,
    e.unidade_medida,
    e.valor_unitario,
    e.localizacao,
    e.fornecedor,
    e.data_ultima_entrada,
    e.data_ultima_saida
FROM estoque e
WHERE e.deleted_at IS NULL
    AND (:categoria IS NULL OR e.categoria = :categoria)
ORDER BY e.item_descricao
LIMIT :limit OFFSET :offset;
