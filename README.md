# GovFiscal

Portal de governança e validação fiscal (Procure-to-Pay) — React, Vite e Tailwind. Dados de demonstração em `localStorage` no navegador.

## Rodar localmente

### Passo a passo (Windows)

1. **Instale o Node.js (obrigatório)**  
   - Baixe a versão **LTS** em [https://nodejs.org/](https://nodejs.org/).  
   - Instale com as opções padrão (isso coloca `node` e `npm` no PATH).  
   - **Feche todos os terminais** (PowerShell, CMD, Cursor) e abra de novo.

2. **Confirme que o Windows enxerga o npm**

```powershell
node -v
npm -v
```

Se aparecer *“npm não é reconhecido”*, o Node não está no PATH: reinstale o Node ou reinicie o PC; às vezes o PATH só atualiza após novo login.

3. **Entre na pasta do projeto** (tem que existir o arquivo `package.json` aí dentro):

```powershell
cd C:\Users\lucas.soares\govfiscal
dir package.json
```

Se `dir package.json` der erro, você está na pasta errada — abra a pasta certa no Explorer e use *“Copiar como caminho”* no endereço.

4. **Instale as dependências** (só na primeira vez, ou depois de clonar de novo):

```powershell
npm install
```

Espere terminar sem erro. Se falhar por rede/proxy, tente de outra rede ou `npm install` de novo.

5. **Suba o servidor de desenvolvimento**:

```powershell
npm run dev
```

Deixe essa janela **aberta**. O terminal vai mostrar algo como:

`Local: http://localhost:5173/`

6. **Abra o navegador** nesse endereço e vá para a tela de acesso:

`http://localhost:5173/acesso`

---

### Se o navegador der “não foi possível conectar” / `ERR_CONNECTION_REFUSED`

- O servidor **não está rodando**: o passo `npm run dev` precisa estar ativo no terminal.  
- A porta pode ser **5174** se a 5173 estiver ocupada — use **exatamente** a URL que o Vite imprimir.

### Rodar pelo Cursor / VS Code

- **Terminal → New Terminal** na raiz da pasta `govfiscal` (onde está o `package.json`).  
- Rode `npm install` uma vez e depois `npm run dev`.  
- Clique no link `http://localhost:5173` se o terminal mostrar como link.

### Erro ao abrir a página (tela branca ou erro no console)

- Apague a pasta `node_modules` e o arquivo `package-lock.json` (se existir), depois rode de novo:

```powershell
npm install
npm run dev
```

---

Comandos resumidos (depois do Node instalado e na pasta certa):

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
