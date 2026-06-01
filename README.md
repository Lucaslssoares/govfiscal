# GovFiscal

Portal de governança e validação fiscal **(Procure-to-Pay)** desenvolvido como projeto acadêmico.

**Stack:** React 18 · Vite · Tailwind CSS · shadcn/ui · Supabase Auth · Supabase DB · React Query

---

## Sumário

1. [O que é o projeto](#o-que-é-o-projeto)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração (primeira vez)](#configuração-primeira-vez)
4. [Como rodar](#como-rodar)
5. [Autenticação](#autenticação)
6. [Arquitetura e fluxo de dados](#arquitetura-e-fluxo-de-dados)
7. [Estrutura de arquivos](#estrutura-de-arquivos)
8. [Banco de dados](#banco-de-dados)
9. [Roles e permissões](#roles-e-permissões)
10. [Como adicionar uma nova funcionalidade](#como-adicionar-uma-nova-funcionalidade)
11. [Fluxo de trabalho em equipe](#fluxo-de-trabalho-em-equipe)
12. [Solução de problemas](#solução-de-problemas)

---

## O que é o projeto

GovFiscal é um portal **Procure-to-Pay** — acompanha o ciclo completo de uma nota fiscal, desde o cadastro de fornecedores até o fechamento de lote para pagamento:

```
Fornecedor submete NF
       ↓
Two-Way Matching automático (valida CNPJ, itens, valores e saldo)
       ↓
Fila de aprovação manual por alçadas (por faixa de valor)
       ↓
Aprovada → Fechamento de lote (CSV para pagamento)
Rejeitada → Central de disputas (mensagens entre fornecedor e gestor)
```

---

## Pré-requisitos

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18 LTS | [nodejs.org](https://nodejs.org/) |
| Git | qualquer | [git-scm.com](https://git-scm.com/download/win) |

> Após instalar, **feche e reabra o terminal**.
> Confirme: `node -v` → deve aparecer `v18.x.x` ou superior, `npm -v` → qualquer versão.

---

## Configuração (primeira vez)

### 1. Clone o repositório

```bash
git clone https://github.com/Lucaslssoares/govfiscal.git
cd govfiscal
```

### 2. Instale as dependências

```bash
npm install
```

Aguarde terminar. Vai criar a pasta `node_modules/` com ~210 pacotes.

### 3. Crie o arquivo `.env`

O banco de dados é compartilhado no **Supabase** (nuvem). As chaves ficam em `.env` — **não está no repositório por segurança**.

```bash
# Windows
copy .env.example .env
```

Abra o `.env` criado e preencha com os valores que o **Lucas vai te passar pelo grupo**:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

> **Nunca suba o `.env` para o GitHub.** Ele já está no `.gitignore` — o Git vai ignorá-lo automaticamente.

---

## Como rodar

```bash
npm run dev
```

Abra **http://localhost:5173/acesso** no navegador.

> Se a porta 5173 estiver ocupada, o Vite usa 5174, 5175… Olhe o terminal — ele mostra a URL exata.

**Outros comandos:**

```bash
npm run build    # gera versão de produção em dist/
npm run preview  # visualiza o build de produção localmente
```

---

## Autenticação

O projeto usa **Supabase Auth** com e-mail e senha. O fluxo é:

```
Usuário preenche e-mail + senha
        ↓
supabase.auth.signInWithPassword()
        ↓
Supabase valida e retorna JWT (token real)
        ↓
AuthContext busca o perfil em app_user (role, nome, cnpj)
        ↓
Rotas liberadas conforme o role do usuário
```

### Usuários de demonstração

| E-mail | Role | Senha |
|---|---|---|
| `ana@empresa.com` | admin | `GovFiscal@2025` |
| `carlos@empresa.com` | gestor | `GovFiscal@2025` |
| `mariana@empresa.com` | analista | `GovFiscal@2025` |
| `contato@empresaalfa.com.br` | fornecedor | `GovFiscal@2025` |

> A tela de acesso tem botões de **acesso rápido** que preenchem o formulário automaticamente — basta clicar no perfil desejado e depois em **Entrar**.

### Como a sessão funciona

- O JWT gerado pelo Supabase fica armazenado no `localStorage` pelo SDK do Supabase (não pelo código do projeto).
- Ao recarregar a página, o `AuthContext` chama `supabase.auth.getSession()` e restaura a sessão sem precisar logar novamente.
- O token é renovado automaticamente pelo SDK antes de expirar (refresh token).
- Ao clicar em **Sair**, `supabase.auth.signOut()` invalida o token no servidor.

### Como o role é determinado

O Supabase Auth gerencia apenas o login (JWT). O `role` da aplicação (admin, gestor, etc.) vem da tabela `app_user` no banco de dados, buscado pelo e-mail após o login:

```js
// AuthContext.jsx — simplificado
const profile = await base44.entities.AppUser.filter({ email: supabaseUser.email })
setRole(profile[0].role)   // "admin" | "gestor" | "analista" | "fornecedor"
setUser(profile[0])        // { nome, email, cnpj, ... }
```

### Adicionar um novo usuário

1. Crie o usuário no **Supabase → Authentication → Users → Add user**
2. Insira um registro em `app_user` com o mesmo e-mail e o role desejado:

```sql
INSERT INTO app_user (id, nome, email, role, status)
VALUES ('usr_novo_001', 'Nome Completo', 'email@empresa.com', 'gestor', 'ativo');
```

---

## Arquitetura e fluxo de dados

```
┌──────────────────────────────────────────────────────────────┐
│                          Navegador                           │
│                                                              │
│  React (páginas + componentes)                               │
│       ↕ AuthContext (Supabase Auth — JWT + role do DB)       │
│       ↕ React Query (cache + refetch automático)             │
│  base44Client.js  ←→  supabaseClient.js                      │
└─────────────────────────────┬────────────────────────────────┘
                              │ HTTPS REST / Auth API
                    ┌─────────▼──────────┐
                    │      Supabase      │
                    │  Auth  │  Database │  (PostgreSQL na nuvem)
                    │  (JWT) │  (dados)  │
                    └────────────────────┘
```

**Como os dados são buscados:**
Toda página usa **React Query** (`useQuery`) para buscar dados do Supabase. O cache dura 10 segundos — as telas se atualizam automaticamente sem reload.

---

## Estrutura de arquivos

```
govfiscal/
│
├── src/
│   │
│   ├── main.jsx                    # Ponto de entrada — monta React, Router, QueryClient, AuthProvider e Toaster
│   ├── App.jsx                     # Define todas as rotas e quais roles podem acessar cada uma
│   ├── index.css                   # Importa Tailwind CSS
│   │
│   ├── api/
│   │   └── base44Client.js         # ★ CAMADA DE DADOS — todo acesso ao Supabase passa aqui
│   │                               #   Exporta: base44.entities.{Entidade}.filter/create/update/delete
│   │                               #   Também exporta funções auxiliares: findContratoByNumero, listContratosAtivosForCnpj
│   │
│   ├── lib/
│   │   ├── supabaseClient.js       # Cria e exporta a instância do Supabase (lê VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
│   │   ├── AuthContext.jsx         # ★ AUTENTICAÇÃO — Supabase Auth + lookup de role em app_user
│   │   │                           #   Fornece { role, user, loading, logout } para toda a árvore via Context API
│   │   │                           #   Persiste sessão JWT automaticamente, refresh token silencioso
│   │   ├── tributario.js           # Cálculo de retenções tributárias (ISS, INSS, IRRF, CSLL, PIS, COFINS) por tipo de serviço
│   │   ├── utils.js                # Funções auxiliares: formatBRL, formatCnpj, onlyDigits, cn
│   │   ├── query-client.js         # Configuração do React Query (staleTime, gcTime)
│   │   └── PageNotFound.jsx        # Página 404
│   │
│   ├── pages/                      # Uma página = uma rota
│   │   ├── Acesso.jsx              # Tela de login (seleciona role)
│   │   ├── Dashboard.jsx           # KPIs + fila de aprovação + gráfico + tabela de auditoria (admin/gestor)
│   │   ├── CadastroFornecedores.jsx # CRUD de fornecedores (admin/gestor)
│   │   ├── CadastroContratos.jsx   # CRUD de contratos com itens em JSON (admin/gestor)
│   │   ├── ConfigAlcadas.jsx       # Configurar níveis de aprovação por faixa de valor (admin/gestor)
│   │   ├── FechamentoLote.jsx      # Selecionar NFs aprovadas e exportar CSV para pagamento (admin/gestor)
│   │   ├── CentralDisputas.jsx     # Thread de mensagens entre fornecedor e gestor por NF (todos os roles)
│   │   ├── GestaoUsuarios.jsx      # CRUD de usuários do sistema (admin)
│   │   └── Fornecedor.jsx          # Portal do fornecedor: submeter NF + histórico (role fornecedor)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.jsx       # Header com logo/avatar/logout + sidebar de navegação por role
│   │   │
│   │   ├── dashboard/
│   │   │   ├── KpiCards.jsx        # 4 cards: total, aprovadas, pendentes, rejeitadas (com R$ e ícones)
│   │   │   ├── VolumeChart.jsx     # Gráfico de barras: volume financeiro por mês (Recharts)
│   │   │   ├── FilaAprovacao.jsx   # Lista de NFs pendentes com botão "Revisar" e tempo de espera
│   │   │   ├── AprovacaoModal.jsx  # Modal de revisão: detalha NF, sugere alçada, permite aprovar/rejeitar
│   │   │   └── AuditoriaTable.jsx  # Tabela paginada e ordenável de todas as NFs com exportar CSV
│   │   │
│   │   ├── fornecedor/
│   │   │   ├── NotaForm.jsx        # Formulário de submissão de NF (cabeçalho + itens + two-way matching)
│   │   │   ├── HistoricoNotas.jsx  # Lista de NFs já enviadas pelo fornecedor logado
│   │   │   ├── ItensNota.jsx       # Editor de itens da NF (código, descrição, qtd, valor)
│   │   │   ├── ImpostosSummary.jsx # Tabela de retenções calculadas para a NF atual
│   │   │   └── ContratoSelector.jsx # Dropdown de contratos ativos do CNPJ logado
│   │   │
│   │   ├── cadastros/
│   │   │   └── ItensContratoEditor.jsx # Editor inline de itens de contrato (código, unidade, valor, qtd máx)
│   │   │
│   │   ├── auth/
│   │   │   └── authSimulator.js    # Gerencia sessão demo no localStorage (getRole, setRole, getDemoUser…)
│   │   │
│   │   └── api/
│   │       └── mockWebhook.js      # Motor de Two-Way Matching: valida CNPJ, itens, quantidades e saldo
│   │
│   ├── components/
│   │   └── auth/
│   │       └── authSimulator.js    # Exporta apenas ROLES — metadados de exibição (cores e labels) por role
│   │                               # A sessão real é gerenciada pelo Supabase Auth (AuthContext.jsx)
│   │
│   ├── components/ui/              # Componentes shadcn/ui (Badge, Button, Card, Dialog, Input, Label, Table, Textarea)
│   │                               # Não edite esses arquivos — são a biblioteca de UI base do projeto
│   │
│   └── entities/                   # Schemas JSON das entidades (documentação da estrutura dos dados)
│       ├── Alcada.json
│       ├── Contrato.json
│       ├── Disputa.json
│       ├── Fornecedor.json
│       └── NotaFiscal.json
│
├── supabase/
│   └── migration.sql               # SQL completo para recriar o banco (tabelas + dados iniciais)
│
├── .env                            # Suas chaves do Supabase — NÃO versionar
├── .env.example                    # Modelo do .env — pode versionar
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Banco de dados

O banco fica no Supabase (PostgreSQL). Todos do grupo acessam o mesmo banco.

### Tabelas

#### `fornecedor`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | text PK | ID gerado pelo cliente |
| `razao_social` | text | Nome da empresa |
| `cnpj` | text | Só dígitos (14 caracteres) |
| `email` | text | |
| `telefone` | text | |
| `endereco` | text | |
| `responsavel` | text | Nome do contato |
| `status` | text | `ativo` \| `inativo` \| `suspenso` |
| `created_date` | timestamptz | |
| `updated_date` | timestamptz | |
| `created_by` | text | |

#### `contrato`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | text PK | |
| `numero_contrato` | text | Ex: `CTR-2025-001` |
| `fornecedor_nome` | text | |
| `cnpj_fornecedor` | text | Só dígitos |
| `descricao` | text | |
| `valor_total` | numeric | Valor total do contrato |
| `saldo_disponivel` | numeric | Saldo para novas NFs |
| `status` | text | `ativo` \| `encerrado` |
| `data_inicio` | date | |
| `data_fim` | date | |
| `itens_json` | text | JSON com array de itens `[{codigo, descricao, unidade, valor_unitario, quantidade_maxima}]` |

#### `nota_fiscal`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | text PK | |
| `cnpj_emissor` | text | Só dígitos |
| `numero_nota` | text | Ex: `NF-2025-0041` |
| `numero_contrato` | text | |
| `valor_bruto` | numeric | Valor total da NF |
| `items_json` | text | JSON com itens da NF |
| `arquivo_url` | text | Base64 do PDF (se anexado) |
| `status` | text | `pendente` \| `aprovada` \| `rejeitada` |
| `motivo_rejeicao` | text | Preenchido quando rejeitada |
| `fornecedor_nome` | text | |
| `email_fornecedor` | text | |
| `protocolo` | text | Gerado pelo Two-Way Matching |
| `tipo_servico` | text | Tipo usado para calcular impostos |

#### `alcada`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | text PK | |
| `nivel` | text | Ex: `Analista Financeiro` |
| `valor_min` | numeric | Valor mínimo da faixa |
| `valor_max` | numeric | Valor máximo (0 = sem limite) |
| `responsavel` | text | Nome do aprovador |
| `email_responsavel` | text | |
| `ativo` | boolean | |

#### `disputa`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | text PK | |
| `nota_fiscal_id` | text | FK para nota_fiscal |
| `numero_nota` | text | |
| `fornecedor_nome` | text | |
| `autor` | text | Nome de quem enviou |
| `papel` | text | `fornecedor` \| `gestor` |
| `mensagem` | text | Conteúdo da mensagem |
| `arquivo_url` | text | Anexo em base64 (opcional) |
| `arquivo_nome` | text | Nome do arquivo |

#### `app_user`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | text PK | |
| `nome` | text | |
| `email` | text | |
| `role` | text | `admin` \| `gestor` \| `analista` \| `fornecedor` |
| `status` | text | `ativo` \| `convidado` \| `inativo` |

### Como acessar os dados no código

Todas as operações passam pelo `base44Client.js`:

```js
import { base44 } from "@/api/base44Client.js";

// Buscar todos os fornecedores ativos
const fornecedores = await base44.entities.Fornecedor.filter({ status: "ativo" });

// Criar uma nota fiscal
const nova = await base44.entities.NotaFiscal.create({ cnpj_emissor: "...", ... });

// Atualizar status de uma NF
await base44.entities.NotaFiscal.update(id, { status: "aprovada" });

// Deletar um registro
await base44.entities.Fornecedor.delete(id);
```

As entidades disponíveis são: `Fornecedor`, `Contrato`, `NotaFiscal`, `Alcada`, `Disputa`, `AppUser`.

---

## Roles e permissões

| Role | E-mail demo | Telas acessíveis |
|---|---|---|
| `admin` | `ana@empresa.com` | Tudo (dashboard, fornecedores, contratos, alçadas, fechamento, disputas, usuários) |
| `gestor` | `carlos@empresa.com` | Dashboard, fornecedores, contratos, alçadas, fechamento, disputas |
| `analista` | `mariana@empresa.com` | Central de disputas |
| `fornecedor` | `contato@empresaalfa.com.br` | Portal do fornecedor (isolado por CNPJ) + disputas |

**Senha de todos os usuários demo:** `GovFiscal@2025`

As rotas protegidas ficam em `src/App.jsx` via `RequireRole`. O `AuthContext` distribui `role`, `user` e `loading` para qualquer componente via `useAuth()`.

```js
// Exemplo de uso dentro de um componente
import { useAuth } from "@/lib/AuthContext.jsx";

function MeuComponente() {
  const { role, user, loading } = useAuth();

  if (loading) return <p>Carregando…</p>;
  if (role !== "admin") return <p>Acesso negado</p>;
  return <p>Olá, {user.nome}</p>;
}
```

### O que `user` contém após login

```js
{
  id:       "usr_seed_001",
  nome:     "Ana Souza",
  email:    "ana@empresa.com",
  role:     "admin",
  status:   "ativo",
  cnpj:     null,           // preenchido apenas para role "fornecedor"
}
```

Para o role `fornecedor`, `user.cnpj` contém o CNPJ da empresa (ex: `"12345678000190"`). As páginas de Portal e Disputas usam `user.cnpj` para filtrar os dados.

---

## Como adicionar uma nova funcionalidade

### Exemplo: nova tela de relatório

**1. Crie o arquivo da página**

```jsx
// src/pages/Relatorio.jsx
import AppLayout from "@/components/layout/AppLayout.jsx";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client.js";

export default function Relatorio() {
  const { data: notas = [] } = useQuery({
    queryKey: ["relatorio-notas"],
    queryFn: () => base44.entities.NotaFiscal.filter({}),
  });

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold">Relatório</h1>
      <p>{notas.length} notas no banco</p>
    </AppLayout>
  );
}
```

**2. Registre a rota em `src/App.jsx`**

```jsx
import Relatorio from "./pages/Relatorio.jsx";

// Dentro do <Routes>:
<Route path="/relatorio" element={<AppLayout><Relatorio /></AppLayout>} />
```

**3. Adicione ao menu em `src/components/layout/AppLayout.jsx`**

```jsx
import { BarChart2 } from "lucide-react";

// Dentro do <nav>, para gestor/admin:
<NavLink to="/relatorio" className={linkClass}>
  <BarChart2 className="h-4 w-4" />
  Relatório
</NavLink>
```

### Exemplo: nova coluna na tabela de fornecedores

1. Adicione a coluna no Supabase: **SQL Editor** → `ALTER TABLE fornecedor ADD COLUMN segmento text;`
2. Adicione o campo ao formulário em `CadastroFornecedores.jsx`
3. Adicione a coluna na tabela de listagem

### Padrão de fetch com React Query

```jsx
// Buscar dados (leitura)
const { data = [], isLoading, error } = useQuery({
  queryKey: ["chave-unica"],           // identifica o cache
  queryFn: () => base44.entities.Fornecedor.filter({}),
});

// Salvar/atualizar (escrita)
const qc = useQueryClient();
const salvar = useMutation({
  mutationFn: (dados) => base44.entities.Fornecedor.create(dados),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["chave-unica"] }); // força refetch
    toast.success("Salvo!");
  },
  onError: (err) => toast.error(err.message),
});
```

---

## Fluxo de trabalho em equipe

### Antes de começar a trabalhar

```bash
git pull          # sincroniza com o repositório remoto
npm install       # instala dependências novas (se alguém adicionou pacotes)
```

### Ao terminar

```bash
git add .
git commit -m "tipo: o que foi feito"
git push
```

### Convenção de commits

| Prefixo | Quando usar | Exemplo |
|---|---|---|
| `feat:` | nova funcionalidade | `feat: adiciona filtro por data na auditoria` |
| `fix:` | correção de bug | `fix: corrige cálculo de INSS para consultoria` |
| `style:` | ajuste visual / CSS | `style: aumenta padding nos cards do dashboard` |
| `refactor:` | melhoria de código | `refactor: extrai validação de CNPJ para utils` |
| `docs:` | documentação | `docs: atualiza README com instrução de deploy` |
| `chore:` | configuração / dependências | `chore: atualiza versão do Vite` |

### Cuidados importantes

- **Nunca faça `git push --force`** — apaga o trabalho dos outros.
- **Sempre faça `git pull` antes de começar** para evitar conflitos.
- **Se aparecer conflito de merge**, resolva o arquivo conflitado (procure por `<<<<<<`), salve e faça `git add` + `git commit`.

---

## Solução de problemas

**`npm não é reconhecido` / `node não é reconhecido`**
→ Node.js não está no PATH. Reinstale pelo [nodejs.org](https://nodejs.org/) e reabra o terminal.

**Tela branca ou erro no console do navegador (F12)**
→ Verifique o `.env` primeiro. Se estiver ok, rode:
```bash
rm -rf node_modules
npm install
npm run dev
```

**Erro: `VITE_SUPABASE_URL não definida` ou `supabaseClient` falhou**
→ O arquivo `.env` não existe ou está vazio. Repita o passo 3 da configuração.

**Login retorna "E-mail ou senha inválidos"**
→ Verifique se está usando exatamente `GovFiscal@2025` como senha (com G maiúsculo e @ no meio). Se o problema persistir, peça ao Lucas para verificar se o usuário existe no Supabase Auth.

**Login aceita mas a tela fica em branco / não redireciona**
→ O usuário existe no Supabase Auth mas não tem registro correspondente na tabela `app_user`. Insira o registro:
```sql
INSERT INTO app_user (id, nome, email, role, status)
VALUES ('usr_xxx', 'Seu Nome', 'seu@email.com', 'gestor', 'ativo');
```

**Sessão some ao recarregar a página**
→ O `.env` pode estar incompleto — `VITE_SUPABASE_ANON_KEY` é necessária para o SDK manter a sessão.

**Dados não aparecem na tela**
→ Supabase com RLS ativado bloqueia leituras com a anon key. O dono do projeto precisa rodar no SQL Editor:
```sql
ALTER TABLE <nome_da_tabela> DISABLE ROW LEVEL SECURITY;
```

**Porta 5173 ocupada**
→ O Vite sobe automaticamente na porta seguinte (5174, 5175…). Use a URL que aparecer no terminal.

**`git push` rejeitado**
→ Faça `git pull` primeiro para integrar as mudanças remotas, resolva conflitos se houver, depois `git push`.

**Importação com `@/` não funciona**
→ O alias `@` aponta para `src/`. Confirme que o arquivo existe em `src/...` e que o caminho está certo.

---

## Tecnologias utilizadas

| Tecnologia | Versão | Para quê |
|---|---|---|
| React | 18 | Framework UI |
| Vite | 5 | Bundler e dev server |
| Tailwind CSS | 3 | Estilização utilitária |
| shadcn/ui | — | Componentes de UI (Button, Card, Table, etc.) |
| React Router | 6 | Navegação entre páginas |
| TanStack Query | 5 | Cache e fetch de dados assíncronos |
| Supabase JS | 2 | Client do banco de dados |
| Recharts | 2 | Gráficos |
| date-fns | 3 | Formatação de datas |
| Sonner | — | Notificações toast |
| Lucide React | — | Ícones |
