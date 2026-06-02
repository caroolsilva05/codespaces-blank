# Estrutura do Projeto

Este projeto esta organizado por responsabilidade. A ideia e facilitar onde mexer sem misturar configuracao, entrada da aplicacao e telas de negocio.

## Raiz

```txt
.
  index.html
  package.json
  package-lock.json
  vercel.json
  .env.example
  .gitignore
  README.md
  docs/
  src/
```

- `index.html`: HTML base usado pelo Vite.
- `package.json`: scripts e dependencias do projeto.
- `vercel.json`: configuracao de deploy na Vercel.
- `.env.example`: modelo das variaveis de ambiente. Nao colocar dados reais aqui.
- `.gitignore`: lista arquivos e pastas que nao devem subir para o GitHub.
- `docs/`: documentacao tecnica do projeto.
- `src/`: codigo da aplicacao.

## src/main.jsx

Ponto de entrada do React. Normalmente quase nunca precisa mexer aqui.

Use este arquivo apenas quando precisar alterar como a aplicacao e inicializada no navegador.

## src/app

Camada principal da aplicacao.

```txt
src/app/
  App.jsx
  settings/
```

- `App.jsx`: componente raiz. Controla tema, login demonstrativo, menu lateral, topbar e escolha da tela ativa.
- `settings/`: configuracoes compartilhadas da aplicacao.

Quando alterar navegacao, tela inicial, login, tema global ou layout principal, comece por `src/app/App.jsx`.

## src/app/settings

```txt
src/app/settings/
  index.js
  supabase.js
```

- `supabase.js`: cria o client do Supabase usando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- `index.js`: arquivo de exportacao para imports mais limpos.

Quando alterar configuracao de banco, autenticação externa ou variaveis de ambiente, comece por esta pasta.

## src/features

Cada funcionalidade grande fica isolada em sua propria pasta.

```txt
src/features/
  pocs/
  scrum/
  portals/
```

### POCs

```txt
src/features/pocs/
  index.js
  PocRegister.jsx
```

Use esta pasta para alterar formulario, regras, calculos e salvamento de POCs.

### Scrum

```txt
src/features/scrum/
  index.js
  ScrumProjectRegister.jsx
```

Use esta pasta para alterar cadastro de projetos Scrum, fases, indicadores, custos, encerramento e fluxo de acompanhamento.

### Portais

```txt
src/features/portals/
  index.ts
  PortalDashboard/
    index.tsx
    mockData.ts
    types.ts
    utils.ts
    PortalDashboard.module.css
```

- `index.tsx`: tela principal do dashboard de portais.
- `mockData.ts`: dados simulados.
- `types.ts`: tipos usados pelo dashboard.
- `utils.ts`: funcoes auxiliares de formatacao, score, risco e funil.
- `PortalDashboard.module.css`: estilos da tela de portais.

Use esta pasta para alterar monitoria, cards, tabela, funil e visual dos portais.

## Onde mexer por tipo de alteracao

```txt
Alterar menu, login, tema ou layout geral:
  src/app/App.jsx

Alterar URL/chave do Supabase:
  .env
  src/app/settings/supabase.js

Alterar tela de POC:
  src/features/pocs/PocRegister.jsx

Alterar tela Scrum:
  src/features/scrum/ScrumProjectRegister.jsx

Alterar dashboard de portais:
  src/features/portals/PortalDashboard/

Alterar dependencias ou scripts:
  package.json

Alterar deploy:
  vercel.json
```

## Regras de organizacao

- Nao versionar `.env`, `.env.local`, `node_modules/` ou `dist/`.
- Nao criar copias do repositorio dentro do proprio repositorio.
- Novas telas grandes devem entrar em `src/features/nome-da-feature/`.
- Configuracoes globais devem entrar em `src/app/settings/`.
- Codigo compartilhado entre varias features pode ganhar uma pasta `src/shared/` quando houver necessidade real.

