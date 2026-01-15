-- Buscar dados de faturamento do ERP
-- Tabela ERP: faturamento (ajustar conforme estrutura real do ERP)
-- Campos esperados: codigo, paciente_id, data_faturamento, valor, status
--
-- NOTA: Esta query é um template. Ajustar conforme a estrutura real do banco do ERP.

SELECT 
    f.codigo as codigo_erp,
    f.paciente_id,
    f.data_faturamento,
    f.data_vencimento,
    f.valor_total,
    f.valor_pago,
    f.status,
    f.convenio,
    f.tipo_faturamento,
    p.nome as paciente_nome
FROM faturamento f
INNER JOIN cad_pacientes p ON f.paciente_id = p.codigo
WHERE f.deleted_at IS NULL
    AND f.data_faturamento >= :data_inicio
    AND f.data_faturamento <= :data_fim
ORDER BY f.data_faturamento DESC
LIMIT :limit OFFSET :offset;
