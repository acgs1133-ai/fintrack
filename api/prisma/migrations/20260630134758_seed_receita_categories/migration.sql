-- Atualiza categorias de despesa existentes para tipoCat = DESPESA
UPDATE "Categoria" SET "tipoCat" = 'DESPESA' WHERE nome IN ('Alimentação','Transporte','Moradia','Saúde','Educação','Lazer');

-- Atualiza "Outros" para AMBOS
UPDATE "Categoria" SET "tipoCat" = 'AMBOS' WHERE nome = 'Outros';

-- Insere categorias de receita (ignora se já existirem)
INSERT INTO "Categoria" (id, nome, cor, icone, "orcamento", sistema, "tipoCat", "createdAt")
VALUES
  (gen_random_uuid()::text, 'Salário',          '#22C55E', 'briefcase',   NULL, true, 'RECEITA', NOW()),
  (gen_random_uuid()::text, 'Freelance',         '#3B82F6', 'laptop',      NULL, true, 'RECEITA', NOW()),
  (gen_random_uuid()::text, 'Investimentos',     '#A855F7', 'trending-up', NULL, true, 'RECEITA', NOW()),
  (gen_random_uuid()::text, 'Aluguel recebido',  '#F97316', 'building',    NULL, true, 'RECEITA', NOW()),
  (gen_random_uuid()::text, 'Presente / Doação', '#EAB308', 'gift',        NULL, true, 'RECEITA', NOW()),
  (gen_random_uuid()::text, 'Reembolso',         '#06B6D4', 'refresh-cw',  NULL, true, 'RECEITA', NOW())
ON CONFLICT (nome) DO NOTHING;
