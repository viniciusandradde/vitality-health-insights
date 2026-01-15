-- Buscar pacientes do ERP
-- Tabela ERP: cad_pacientes (ajustar conforme estrutura real do ERP)
-- Campos esperados: codigo, nome, cpf, data_nascimento, sexo
-- 
-- NOTA: Esta query é um template. Ajustar conforme a estrutura real do banco do ERP.
-- Substituir nome de tabelas, colunas e condições conforme necessário.

SELECT 
    codigo as codigo_erp,
    nome,
    cpf,
    data_nascimento,
    sexo,
    telefone,
    email,
    endereco,
    cidade,
    estado,
    cep
FROM cad_pacientes
WHERE deleted_at IS NULL
ORDER BY nome
LIMIT :limit OFFSET :offset;
