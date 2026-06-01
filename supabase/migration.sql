-- =============================================================================
-- GovFiscal — Migração Supabase
-- Cole este SQL no editor SQL do seu projeto Supabase (SQL Editor → New Query)
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Tabelas
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fornecedor (
  id            text PRIMARY KEY,
  razao_social  text NOT NULL,
  cnpj          text NOT NULL,
  email         text,
  telefone      text,
  endereco      text,
  responsavel   text,
  status        text DEFAULT 'ativo',
  created_date  timestamptz DEFAULT now(),
  updated_date  timestamptz DEFAULT now(),
  created_by    text
);

CREATE TABLE IF NOT EXISTS contrato (
  id                text PRIMARY KEY,
  numero_contrato   text,
  fornecedor_nome   text,
  cnpj_fornecedor   text,
  descricao         text,
  valor_total       numeric,
  saldo_disponivel  numeric,
  status            text DEFAULT 'ativo',
  data_inicio       date,
  data_fim          date,
  itens_json        text,
  created_date      timestamptz DEFAULT now(),
  updated_date      timestamptz DEFAULT now(),
  created_by        text
);

CREATE TABLE IF NOT EXISTS nota_fiscal (
  id               text PRIMARY KEY,
  cnpj_emissor     text NOT NULL,
  numero_nota      text NOT NULL,
  numero_contrato  text NOT NULL,
  valor_bruto      numeric,
  items_json       text,
  arquivo_url      text,
  arquivo_nome     text,
  status           text DEFAULT 'pendente',
  motivo_rejeicao  text,
  fornecedor_nome  text,
  email_fornecedor text,
  protocolo        text,
  tipo_servico     text,
  created_date     timestamptz DEFAULT now(),
  updated_date     timestamptz DEFAULT now(),
  created_by       text
);

CREATE TABLE IF NOT EXISTS alcada (
  id                 text PRIMARY KEY,
  nivel              text,
  valor_min          numeric,
  valor_max          numeric,
  responsavel        text,
  email_responsavel  text,
  ativo              boolean DEFAULT true,
  created_date       timestamptz DEFAULT now(),
  updated_date       timestamptz DEFAULT now(),
  created_by         text
);

CREATE TABLE IF NOT EXISTS disputa (
  id              text PRIMARY KEY,
  nota_fiscal_id  text NOT NULL,
  numero_nota     text,
  fornecedor_nome text,
  autor           text NOT NULL,
  papel           text NOT NULL,
  mensagem        text NOT NULL,
  arquivo_url     text,
  arquivo_nome    text,
  created_date    timestamptz DEFAULT now(),
  updated_date    timestamptz DEFAULT now(),
  created_by      text
);

CREATE TABLE IF NOT EXISTS app_user (
  id            text PRIMARY KEY,
  nome          text,
  email         text,
  role          text,
  status        text DEFAULT 'ativo',
  created_date  timestamptz DEFAULT now(),
  updated_date  timestamptz DEFAULT now(),
  created_by    text
);

-- ----------------------------------------------------------------------------
-- Permissões (anon key pode ler e escrever — adequado para projeto de estudo)
-- Desabilita RLS para simplificar. Em produção, habilite e configure policies.
-- ----------------------------------------------------------------------------

ALTER TABLE fornecedor  DISABLE ROW LEVEL SECURITY;
ALTER TABLE contrato    DISABLE ROW LEVEL SECURITY;
ALTER TABLE nota_fiscal DISABLE ROW LEVEL SECURITY;
ALTER TABLE alcada      DISABLE ROW LEVEL SECURITY;
ALTER TABLE disputa     DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_user    DISABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Dados iniciais (seed)
-- ----------------------------------------------------------------------------

INSERT INTO fornecedor (id, razao_social, cnpj, email, telefone, endereco, responsavel, status, created_by)
VALUES ('forn_seed_001', 'Empresa Alfa Ltda', '12345678000190', 'contato@empresaalfa.com.br',
        '1133334444', 'Av. Paulista, 1000 — São Paulo/SP', 'João Silva', 'ativo', 'system')
ON CONFLICT (id) DO NOTHING;

INSERT INTO contrato (id, numero_contrato, fornecedor_nome, cnpj_fornecedor, descricao,
                      valor_total, saldo_disponivel, status, data_inicio, data_fim, itens_json, created_by)
VALUES ('ctr_seed_001', 'CTR-2025-001', 'Empresa Alfa Ltda', '12345678000190',
        'Desenvolvimento de software e suporte', 100000, 50000, 'ativo',
        '2025-01-01', '2025-12-31',
        '[{"codigo":"SRV-001","descricao":"Desenvolvimento de Software","unidade":"hora","valor_unitario":150,"quantidade_maxima":200},{"codigo":"SRV-002","descricao":"Consultoria Técnica","unidade":"hora","valor_unitario":200,"quantidade_maxima":50}]',
        'system')
ON CONFLICT (id) DO NOTHING;

INSERT INTO alcada (id, nivel, valor_min, valor_max, responsavel, email_responsavel, ativo, created_by)
VALUES
  ('alc_seed_001', 'Analista Financeiro',    0,        5000,  'Carlos Mendes', 'carlos@empresa.com', true, 'system'),
  ('alc_seed_002', 'Coordenador Financeiro', 5000.01,  50000, 'Maria Santos',  'maria@empresa.com',  true, 'system'),
  ('alc_seed_003', 'Diretor Financeiro',     50000.01, 0,     'João Oliveira', 'joao@empresa.com',   true, 'system')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_user (id, nome, email, role, status, created_by)
VALUES
  ('usr_seed_001', 'Ana Souza',     'ana@empresa.com',    'admin',  'ativo', 'system'),
  ('usr_seed_002', 'Carlos Mendes', 'carlos@empresa.com', 'gestor', 'ativo', 'system')
ON CONFLICT (id) DO NOTHING;
