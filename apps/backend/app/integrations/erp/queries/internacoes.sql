-- Buscar internações do ERP
-- Tabela ERP: internacoes (ajustar conforme estrutura real do ERP)
-- Campos esperados: codigo, paciente_id, data_entrada, data_saida, leito
--
-- NOTA: Esta query é um template. Ajustar conforme a estrutura real do banco do ERP.

SELECT 
    i.codigo as codigo_erp,
    i.paciente_id,
    i.data_entrada,
    i.hora_entrada,
    i.data_saida,
    i.hora_saida,
    i.leito_numero,
    i.leito_tipo,
    i.especialidade,
    i.medico_responsavel,
    i.convenio,
    i.tipo_internacao,
    i.status,
    i.valor_total,
    p.nome as paciente_nome,
    p.cpf as paciente_cpf
FROM internacoes i
INNER JOIN cad_pacientes p ON i.paciente_id = p.codigo
WHERE i.deleted_at IS NULL
    AND i.data_entrada >= :data_inicio
    AND i.data_entrada <= :data_fim
ORDER BY i.data_entrada DESC, i.hora_entrada DESC
LIMIT :limit OFFSET :offset;
