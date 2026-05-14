# GovFiscal

Portal de governança e validação fiscal (Procure-to-Pay) — React, Vite e Tailwind. Dados de demonstração em `localStorage` no navegador.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173/acesso`.

### Pré-requisitos no Windows

- **Node.js** (para `npm`): [nodejs.org](https://nodejs.org/) — LTS. Depois feche e reabra o PowerShell e teste `node -v` e `npm -v`.
- **Git** (para `git`): [git-scm.com/download/win](https://git-scm.com/download/win). Na instalação, deixe marcada a opção **“Git from the command line and also from 3rd-party software”** (PATH). Feche e reabra o PowerShell e teste `git --version`.

Se aparecer *“git não é reconhecido”*, o Git não está no PATH: reinstale com a opção acima ou adicione manualmente ao PATH do usuário, por exemplo:

`C:\Program Files\Git\cmd`

(Em *Configurações → Sistema → Sobre → Configurações avançadas do sistema → Variáveis de ambiente*, edite `Path` do seu usuário.)

**Sem instalar Git no terminal:** use o [GitHub Desktop](https://desktop.github.com/) — *File → Add local repository* na pasta do projeto e depois *Publish repository* / sincronize com `Lucaslssoares/govfiscal`.

## Repositório remoto

**GitHub:** [https://github.com/Lucaslssoares/govfiscal](https://github.com/Lucaslssoares/govfiscal)

### Primeiro envio (na pasta do projeto)

```bash
git init
git add -A
git commit -m "chore: initial commit GovFiscal"
git branch -M main
git remote add origin https://github.com/Lucaslssoares/govfiscal.git
git push -u origin main
```

Se o Git avisar que `origin` já existe:

```bash
git remote set-url origin https://github.com/Lucaslssoares/govfiscal.git
git push -u origin main
```

**SSH** (se usa chave no GitHub):

```bash
git remote add origin git@github.com:Lucaslssoares/govfiscal.git
git push -u origin main
```

### Próximos commits

```bash
git add -A
git commit -m "sua mensagem"
git push
```
