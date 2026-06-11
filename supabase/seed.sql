-- =============================================================================
-- GovFiscal — Seed de Dados de Exemplo
-- Execute APÓS a migration.sql
-- Acesse: Supabase → SQL Editor → New Query → Cole este arquivo → Run
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 1 — Usuários Supabase Auth
-- Cria contas de login para os 4 perfis de demonstração.
-- Requer extensão pgcrypto (já habilitada por padrão no Supabase).
-- Senha de todos: GovFiscal@2025
-- ─────────────────────────────────────────────────────────────────────────────

-- Insere apenas usuários que ainda não existem (sem ON CONFLICT em auth.users)
INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
SELECT
  gen_random_uuid(), 'authenticated', 'authenticated',
  t.email,
  crypt('GovFiscal@2025', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
FROM (VALUES
  ('ana@empresa.com'),
  ('carlos@empresa.com'),
  ('mariana@empresa.com'),
  ('contato@empresaalfa.com.br')
) AS t(email)
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.email = t.email
);

-- Atualiza senha de quem já existe (caso o seed seja re-executado)
UPDATE auth.users
SET encrypted_password = crypt('GovFiscal@2025', gen_salt('bf')),
    email_confirmed_at = now()
WHERE email IN (
  'ana@empresa.com', 'carlos@empresa.com',
  'mariana@empresa.com', 'contato@empresaalfa.com.br'
);

-- Identidades (necessário para login por e-mail) — idempotente via WHERE NOT EXISTS
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.email,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(), now(), now()
FROM auth.users u
WHERE u.email IN (
  'ana@empresa.com',
  'carlos@empresa.com',
  'mariana@empresa.com',
  'contato@empresaalfa.com.br'
)
AND NOT EXISTS (
  SELECT 1 FROM auth.identities i
  WHERE i.provider = 'email' AND i.provider_id = u.email
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 2 — Perfis na tabela app_user
-- Emails DEVEM bater com os hints da tela de Acesso (Acesso.jsx DEMO_HINTS).
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO app_user (id, nome, email, role, cnpj, razao_social, status, created_by)
VALUES
  ('usr_seed_001', 'Ana Souza',      'ana@empresa.com',            'admin',      null,             null,                'ativo', 'system'),
  ('usr_seed_002', 'Carlos Mendes',  'carlos@empresa.com',         'gestor',     null,             null,                'ativo', 'system'),
  ('usr_003',      'Mariana Santos', 'mariana@empresa.com',        'analista',   null,             null,                'ativo', 'system'),
  ('usr_004',      'João Silva',     'contato@empresaalfa.com.br', 'fornecedor', '12345678000190', 'Empresa Alfa Ltda', 'ativo', 'system')
ON CONFLICT (id) DO UPDATE
  SET nome         = EXCLUDED.nome,
      email        = EXCLUDED.email,
      role         = EXCLUDED.role,
      cnpj         = EXCLUDED.cnpj,
      razao_social = EXCLUDED.razao_social;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 3 — Fornecedores
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO fornecedor (id, razao_social, cnpj, email, telefone, endereco, responsavel, status, created_by)
VALUES
  ('forn_seed_001', 'Empresa Alfa Ltda',               '12345678000190',
   'contato@empresaalfa.com.br', '(11) 3333-4444',
   'Av. Paulista, 1000 — São Paulo/SP',       'João Silva',      'ativo', 'system'),

  ('forn_002',      'TechSoft Soluções Ltda',           '98765432000100',
   'financeiro@techsoft.com.br', '(11) 4567-8901',
   'Rua Augusta, 500 — São Paulo/SP',         'Maria Oliveira',  'ativo', 'system'),

  ('forn_003',      'Construções Beta Engenharia S.A.', '11222333000181',
   'nf@construcoesbeta.com.br',  '(21) 2222-3333',
   'Av. Rio Branco, 200 — Rio de Janeiro/RJ', 'Roberto Mendes',  'ativo', 'system'),

  ('forn_004',      'Serviços Gamma Ltda',              '44555666000177',
   'operacoes@servicosgamma.com.br', '(31) 3456-7890',
   'Rua Bahia, 350 — Belo Horizonte/MG',     'Fernanda Costa',  'ativo', 'system')

ON CONFLICT (id) DO UPDATE
  SET razao_social = EXCLUDED.razao_social,
      cnpj         = EXCLUDED.cnpj,
      email        = EXCLUDED.email,
      status       = EXCLUDED.status;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 4 — Contratos
-- saldo_disponivel reflete notas já aprovadas + pendentes descontadas.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO contrato (id, numero_contrato, fornecedor_nome, cnpj_fornecedor, descricao,
                      valor_total, saldo_disponivel, status, data_inicio, data_fim, itens_json, created_by)
VALUES
  -- R$100k − R$15k aprovada − R$22.5k pendente = R$62.5k disponível
  ('ctr_seed_001', 'CTR-2025-001', 'Empresa Alfa Ltda', '12345678000190',
   'Desenvolvimento de software e suporte técnico', 100000, 62500, 'ativo',
   '2025-01-01', '2025-12-31',
   '[{"codigo":"SRV-001","descricao":"Desenvolvimento de Software","unidade":"hora","valor_unitario":150,"quantidade_maxima":200},{"codigo":"SRV-002","descricao":"Consultoria Técnica","unidade":"hora","valor_unitario":200,"quantidade_maxima":50}]',
   'system'),

  -- R$50k − R$8k aprovada − R$4.2k pendente = R$37.8k (usando R$32k após outros usos)
  ('ctr_002', 'CTR-2025-002', 'TechSoft Soluções Ltda', '98765432000100',
   'Consultoria estratégica e análise de processos', 50000, 32000, 'ativo',
   '2025-02-01', '2025-12-31',
   '[{"codigo":"CONS-001","descricao":"Consultoria Estratégica","unidade":"hora","valor_unitario":250,"quantidade_maxima":100},{"codigo":"CONS-002","descricao":"Análise de Processos","unidade":"hora","valor_unitario":180,"quantidade_maxima":80}]',
   'system'),

  -- R$30k − R$5.5k aprovada = R$22k disponível
  ('ctr_003', 'CTR-2025-003', 'Construções Beta Engenharia S.A.', '11222333000181',
   'Serviços de limpeza predial e vidros', 30000, 22000, 'ativo',
   '2025-01-15', '2025-12-31',
   '[{"codigo":"LMP-001","descricao":"Limpeza Predial","unidade":"m2","valor_unitario":12,"quantidade_maxima":2000},{"codigo":"LMP-002","descricao":"Limpeza de Vidros","unidade":"m2","valor_unitario":25,"quantidade_maxima":500}]',
   'system'),

  -- R$80k com R$55k ainda disponível
  ('ctr_004', 'CTR-2025-004', 'Serviços Gamma Ltda', '44555666000177',
   'Locação de gerador e empilhadeira', 80000, 55000, 'ativo',
   '2025-03-01', '2025-12-31',
   '[{"codigo":"LOC-001","descricao":"Locação de Gerador","unidade":"diária","valor_unitario":800,"quantidade_maxima":60},{"codigo":"LOC-002","descricao":"Locação de Empilhadeira","unidade":"hora","valor_unitario":120,"quantidade_maxima":200}]',
   'system')

ON CONFLICT (id) DO UPDATE
  SET saldo_disponivel = EXCLUDED.saldo_disponivel,
      itens_json       = EXCLUDED.itens_json,
      status           = EXCLUDED.status;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 5 — Alçadas
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO alcada (id, nivel, valor_min, valor_max, responsavel, email_responsavel, ativo, created_by)
VALUES
  ('alc_seed_001', 'Analista Financeiro',    0,         5000,  'Mariana Santos', 'mariana@empresa.com', true, 'system'),
  ('alc_seed_002', 'Coordenador Financeiro', 5000.01,   50000, 'Carlos Mendes',  'carlos@empresa.com',  true, 'system'),
  ('alc_seed_003', 'Diretor Financeiro',     50000.01,  0,     'Ana Souza',      'ana@empresa.com',     true, 'system')
ON CONFLICT (id) DO UPDATE
  SET responsavel       = EXCLUDED.responsavel,
      email_responsavel = EXCLUDED.email_responsavel,
      valor_min         = EXCLUDED.valor_min,
      valor_max         = EXCLUDED.valor_max;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 6 — Notas Fiscais (8 cenários de teste)
--
-- Notas "aprovadas" e "rejeitadas": já passaram pela validação no formulário.
-- Notas "pendentes": aguardam decisão do responsável de alçada.
--
-- Chaves de acesso com DV calculado (válidas):
--   Empresa Alfa CNPJ 12345678000190 → 35250112345678000190550010000000011123456781
--   TechSoft     CNPJ 98765432000100 → 35250298765432000100550010000000011876543218
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO nota_fiscal (
  id, cnpj_emissor, numero_nota, numero_contrato, chave_acesso,
  valor_bruto, items_json, arquivo_url, arquivo_nome,
  status, motivo_rejeicao, fornecedor_nome, email_fornecedor,
  protocolo, tipo_servico, created_date, created_by
) VALUES

-- NF-001 · Empresa Alfa · APROVADA · R$ 15.000
('nf_001', '12345678000190', 'NF-2025-001', 'CTR-2025-001',
 '35250112345678000190550010000000011123456781',
 15000,
 '[{"codigo":"SRV-001","descricao":"Desenvolvimento de Software","quantidade":100,"valor_unitario":150,"valor_total":15000}]',
 'https://storage.exemplo.com/nf_001.pdf', 'NF-2025-001.pdf',
 'aprovada', '', 'Empresa Alfa Ltda', 'contato@empresaalfa.com.br',
 'PROT-20250115001', 'servicos_ti', '2025-01-15 09:30:00+00', 'system'),

-- NF-002 · TechSoft · APROVADA · R$ 8.000
('nf_002', '98765432000100', 'NF-2025-002', 'CTR-2025-002',
 '35250298765432000100550010000000011876543218',
 8000,
 '[{"codigo":"CONS-001","descricao":"Consultoria Estratégica","quantidade":32,"valor_unitario":250,"valor_total":8000}]',
 'https://storage.exemplo.com/nf_002.pdf', 'NF-2025-002.pdf',
 'aprovada', '', 'TechSoft Soluções Ltda', 'financeiro@techsoft.com.br',
 'PROT-20250210001', 'consultoria', '2025-02-10 10:00:00+00', 'system'),

-- NF-003 · Construções Beta · APROVADA · R$ 5.500
('nf_003', '11222333000181', 'NF-2025-003', 'CTR-2025-003',
 '35250311222333000181550010000000011333222110',
 5500,
 '[{"codigo":"LMP-001","descricao":"Limpeza Predial","quantidade":458,"valor_unitario":12,"valor_total":5496},{"codigo":"LMP-002","descricao":"Limpeza de Vidros","quantidade":1,"valor_unitario":4,"valor_total":4}]',
 'https://storage.exemplo.com/nf_003.pdf', 'NF-2025-003.pdf',
 'aprovada', '', 'Construções Beta Engenharia S.A.', 'nf@construcoesbeta.com.br',
 'PROT-20250305001', 'limpeza', '2025-03-05 11:00:00+00', 'system'),

-- NF-004 · Empresa Alfa · PENDENTE · R$ 22.500 · alçada: Coordenador Financeiro
('nf_004', '12345678000190', 'NF-2025-004', 'CTR-2025-001',
 '35250112345678000190550010000000041123456781',
 22500,
 '[{"codigo":"SRV-001","descricao":"Desenvolvimento de Software","quantidade":150,"valor_unitario":150,"valor_total":22500}]',
 'https://storage.exemplo.com/nf_004.pdf', 'NF-2025-004.pdf',
 'pendente', '', 'Empresa Alfa Ltda', 'contato@empresaalfa.com.br',
 'PROT-20250410001', 'servicos_ti', '2025-04-10 08:45:00+00', 'system'),

-- NF-005 · TechSoft · PENDENTE · R$ 4.200 · alçada: Analista Financeiro
('nf_005', '98765432000100', 'NF-2025-005', 'CTR-2025-002',
 '35250298765432000100550010000000021876543218',
 4200,
 '[{"codigo":"CONS-002","descricao":"Análise de Processos","quantidade":23,"valor_unitario":180,"valor_total":4140},{"codigo":"CONS-001","descricao":"Consultoria Estratégica","quantidade":0.24,"valor_unitario":250,"valor_total":60}]',
 'https://storage.exemplo.com/nf_005.pdf', 'NF-2025-005.pdf',
 'pendente', '', 'TechSoft Soluções Ltda', 'financeiro@techsoft.com.br',
 'PROT-20250415002', 'consultoria', '2025-04-15 14:20:00+00', 'system'),

-- NF-006 · Empresa Alfa · REJEITADA · valor excede saldo do contrato
('nf_006', '12345678000190', 'NF-2025-006', 'CTR-2025-001',
 '35250112345678000190550010000000061123456781',
 95000,
 '[{"codigo":"SRV-001","descricao":"Desenvolvimento de Software","quantidade":500,"valor_unitario":150,"valor_total":75000},{"codigo":"SRV-002","descricao":"Consultoria Técnica","quantidade":100,"valor_unitario":200,"valor_total":20000}]',
 'https://storage.exemplo.com/nf_006.pdf', 'NF-2025-006.pdf',
 'rejeitada',
 '[divergencia_valor] Valor bruto (R$ 95000,00) excede o saldo disponível do contrato (R$ 62500,00).',
 'Empresa Alfa Ltda', 'contato@empresaalfa.com.br',
 '', 'servicos_ti', '2025-04-20 09:00:00+00', 'system'),

-- NF-007 · Construções Beta · REJEITADA · item não contratado
('nf_007', '11222333000181', 'NF-2025-007', 'CTR-2025-003',
 '35250311222333000181550010000000071333222110',
 3000,
 '[{"codigo":"LMP-999","descricao":"Produto não previsto em contrato","quantidade":100,"valor_unitario":30,"valor_total":3000}]',
 'https://storage.exemplo.com/nf_007.pdf', 'NF-2025-007.pdf',
 'rejeitada',
 '[item_nao_contratado] Item não contratado: LMP-999',
 'Construções Beta Engenharia S.A.', 'nf@construcoesbeta.com.br',
 '', 'limpeza', '2025-04-22 10:30:00+00', 'system'),

-- NF-008 · Serviços Gamma · REJEITADA · chave de acesso com formato inválido (40 dígitos)
('nf_008', '44555666000177', 'NF-2025-008', 'CTR-2025-004',
 '3525044555666000177550010000000011234567',
 2000,
 '[{"codigo":"LOC-001","descricao":"Locação de Gerador","quantidade":2,"valor_unitario":800,"valor_total":1600},{"codigo":"LOC-002","descricao":"Locação de Empilhadeira","quantidade":3,"valor_unitario":120,"valor_total":360}]',
 'https://storage.exemplo.com/nf_008.pdf', 'NF-2025-008.pdf',
 'rejeitada',
 '[chave_acesso_invalida] Chave deve ter 44 dígitos (informado: 40)',
 'Serviços Gamma Ltda', 'operacoes@servicosgamma.com.br',
 '', 'locacao', '2025-04-25 16:00:00+00', 'system')

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 7 — Disputas (3 threads de contestação)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO disputa (
  id, nota_fiscal_id, numero_nota, fornecedor_nome,
  autor, papel, mensagem, arquivo_url, arquivo_nome,
  created_date, created_by
) VALUES

-- Thread da NF-006: fornecedor contesta → gestor responde
('disp_001', 'nf_006', 'NF-2025-006', 'Empresa Alfa Ltda',
 'João Silva', 'fornecedor',
 'Contestamos a rejeição. O contrato foi aditado em 15/04/2025 ampliando o saldo para R$ 150.000. Segue Aditivo Contratual nº 2/2025 assinado pelas partes.',
 'https://storage.exemplo.com/aditivo_contratual_2_2025.pdf',
 'Aditivo_Contratual_2_2025.pdf',
 '2025-04-21 11:00:00+00', 'system'),

('disp_002', 'nf_006', 'NF-2025-006', 'Empresa Alfa Ltda',
 'Carlos Mendes', 'gestor',
 'Recebemos o documento. O aditivo está sendo analisado pelo jurídico. Prazo de resposta: 3 dias úteis. A nota permanece suspensa até decisão.',
 null, null,
 '2025-04-22 09:30:00+00', 'system'),

-- Thread da NF-007: fornecedor contesta item não contratado
('disp_003', 'nf_007', 'NF-2025-007', 'Construções Beta Engenharia S.A.',
 'Roberto Mendes', 'fornecedor',
 'O item LMP-999 foi autorizado verbalmente pelo responsável do contrato em reunião de 20/04/2025. Solicitamos revisão e aprovação da nota. Segue ata da reunião em anexo.',
 'https://storage.exemplo.com/ata_reuniao_abr2025.pdf',
 'Ata_Reuniao_Abril2025.pdf',
 '2025-04-23 14:00:00+00', 'system')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- RESUMO
-- =============================================================================
-- auth.users  : 4 (ana, carlos, mariana, contato@empresaalfa) · senha: GovFiscal@2025
-- app_user    : 4 perfis com roles e CNPJs corretos
-- fornecedor  : 4
-- contrato    : 4 (CTR-2025-001 a 004) com itens e saldos
-- alcada      : 3 faixas (até 5k · 5k–50k · acima 50k)
-- nota_fiscal : 8 (3 aprovadas · 2 pendentes · 3 rejeitadas)
-- disputa     : 3 mensagens (1 thread completa + 1 aberta)
--
-- LOGIN RÁPIDO (botões na tela de Acesso):
--   ana@empresa.com            → Admin      → /dashboard
--   carlos@empresa.com         → Gestor     → /dashboard
--   mariana@empresa.com        → Analista   → /disputas
--   contato@empresaalfa.com.br → Fornecedor → /fornecedor
--   Senha de todos: GovFiscal@2025
-- =============================================================================
