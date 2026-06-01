# GovFiscal

Portal de governança e validação fiscal (Procure-to-Pay) desenvolvido para a faculdade.

Tecnologias: **React 18 · Vite · Tailwind CSS · Supabase (banco compartilhado)**

---

## Pré-requisitos

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18 LTS | [nodejs.org](https://nodejs.org/) |
| Git | qualquer | [git-scm.com](https://git-scm.com/download/win) |

> Após instalar, **feche e reabra o terminal** antes de continuar.
> Confirme com `node -v` e `npm -v`.

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

### 3. Configure o arquivo `.env`

O projeto usa o **Supabase** como banco de dados compartilhado. As chaves de acesso ficam em um arquivo `.env` que **não está no repositório** por segurança.

Crie o arquivo `.env` na raiz do projeto:

```bash
# Windows (PowerShell)
copy .env.example .env
```

Depois abra o `.env` e preencha com as chaves que o dono do projeto vai te passar:

```env
VITE_SUPABASE_URL=https://twrfkyqimzhbosgfvuyu.supabase.co
VITE_SUPABASE_ANON_KEY=<peça a chave ao Lucas>
```

> **Nunca suba o `.env` para o GitHub** — ele já está no `.gitignore`.

### 4. Rode o projeto

```bash
npm run dev
```

Abra **http://localhost:5173/acesso** no navegador.

---

## Fluxo de trabalho em equipe

### Sincronizar com o repositório

```bash
# Antes de começar a trabalhar — sempre
git pull

# Após terminar suas alterações
git add .
git commit -m "descrição do que fez"
git push
```

### Convenção de commits

| Prefixo | Quando usar |
|---|---|
| `feat:` | nova funcionalidade |
| `fix:` | correção de bug |
| `style:` | ajuste visual / CSS |
| `refactor:` | melhoria de código sem mudar comportamento |
| `docs:` | alteração na documentação |

Exemplo: `git commit -m "feat: adiciona filtro de status na tela de notas fiscais"`

---

## Estrutura do projeto

```
govfiscal/
├── src/
│   ├── api/
│   │   └── base44Client.js      # Camada de acesso ao Supabase (CRUD)
│   ├── lib/
│   │   ├── supabaseClient.js    # Instância do cliente Supabase
│   │   ├── AuthContext.jsx      # Contexto de autenticação e roles
│   │   └── tributario.js        # Cálculos tributários
│   ├── pages/                   # Telas da aplicação
│   │   ├── Acesso.jsx           # Login
│   │   ├── Dashboard.jsx
│   │   ├── CadastroFornecedores.jsx
│   │   ├── CadastroContratos.jsx
│   │   ├── ConfigAlcadas.jsx
│   │   ├── FechamentoLote.jsx
│   │   ├── CentralDisputas.jsx
│   │   ├── GestaoUsuarios.jsx
│   │   └── Fornecedor.jsx
│   ├── components/              # Componentes reutilizáveis
│   └── entities/                # Schemas JSON das entidades
├── supabase/
│   └── migration.sql            # SQL para criar as tabelas no Supabase
├── .env.example                 # Modelo do arquivo .env
└── .gitignore
```

---

## Banco de dados (Supabase)

O banco é compartilhado entre todos do grupo — qualquer dado criado por um aparece para todos em tempo real.

| Tabela | Conteúdo |
|---|---|
| `fornecedor` | Cadastro de fornecedores |
| `contrato` | Contratos por fornecedor |
| `nota_fiscal` | Notas fiscais submetidas |
| `alcada` | Níveis de aprovação por valor |
| `disputa` | Mensagens de disputas |
| `app_user` | Usuários do sistema |

---

## Roles e acesso

| Role | Acesso |
|---|---|
| `admin` | Tudo |
| `gestor` | Dashboard, fornecedores, contratos, alçadas, disputas |
| `analista` | Central de disputas |
| `fornecedor` | Portal do fornecedor |

---

## Solução de problemas

**`npm não é reconhecido`**
→ Node.js não está no PATH. Reinstale e reabra o terminal.

**Tela branca ou erro no console**
```bash
rm -rf node_modules
npm install
npm run dev
```

**`VITE_SUPABASE_URL não definida`**
→ O arquivo `.env` não existe ou está mal preenchido. Revise o passo 3.

**Porta 5173 ocupada**
→ O Vite sobe automaticamente na 5174. Use a URL que aparecer no terminal.
