# Estrutura do Projeto

Este projeto segue uma estrutura por responsabilidade, inspirada em projetos React profissionais. A regra geral e: pagina monta fluxo, componente renderiza UI, service fala com APIs/banco, utils calculam/formatam, styles guardam CSS.

## Arvore Principal

```txt
src/
  main.jsx
  app/
    App.jsx
  assets/
  components/
  database/
    README.md
    mysql-schema.sql
  features/
    pocs/
    portals/
    scrum/
  pages/
    dashboard/
  services/
    internalApi.js
  styles/
    global.css
server/
  index.js
  db.js
  routes/
scripts/
  import-supabase-csv-to-mysql.js
```

## Camadas

- `app/`: inicializacao da aplicacao React. O `App.jsx` deve ficar pequeno e delegar telas para `pages/`.
- `pages/`: telas completas e fluxos de tela.
- `layouts/`: estruturas reutilizaveis de pagina, como sidebar/topbar/shell, quando forem extraidas.
- `components/`: componentes compartilhados entre varias areas.
- `features/`: modulos de negocio com seus proprios `pages`, `components`, `services`, `utils`, `data` e `styles`.
- `services/`: clientes e integracoes externas compartilhadas.
- `styles/`: CSS global. CSS especifico de tela/modulo deve ficar perto do modulo.
- `assets/`: imagens, icones, fontes e arquivos estaticos.
- `database/`: scripts SQL, migrations, seeds ou documentacao de banco.
- `server/`: back-end Express, rotas REST, proxy Splunk e pool MySQL.

## POCs

```txt
src/features/pocs/
  data/
    emptyPoc.js
  pages/
    PocRegisterPage.jsx
  services/
    pocRecordService.js
  utils/
    pocUtils.js
  components/
  styles/
  index.js
```

- `PocRegisterPage.jsx`: tela principal da POC.
- `emptyPoc.js`: estrutura inicial de uma POC.
- `pocRecordService.js`: persistencia da POC via API interna.
- `pocUtils.js`: calculos, formatadores e helpers.

## Scrum

```txt
src/features/scrum/
  components/
    ScrumFormComponents.jsx
  data/
    initialScrumProject.js
  pages/
    ScrumProjectRegisterPage.jsx
  services/
    scrumProjectService.js
  styles/
    scrumTheme.js
  utils/
  index.js
```

- `ScrumProjectRegisterPage.jsx`: tela principal do registro Scrum.
- `ScrumFormComponents.jsx`: componentes menores do formulario.
- `initialScrumProject.js`: dados iniciais.
- `scrumProjectService.js`: persistencia via API interna.
- `scrumTheme.js`: tokens visuais usados pela tela.

## Marketing

```txt
src/features/marketing/
  data/
    marketingData.js
  styles/
    MarketingPage.module.css
  index.jsx
```

- `index.jsx`: tela da aba Marketing, com filtros, indicadores, fases e tabela de carteiras.
- `marketingData.js`: base inicial de carteiras, canais, plataformas e fases. Troque este arquivo quando chegarem as carteiras oficiais.
- `MarketingPage.module.css`: estilos especificos da tela.

## Portais

```txt
src/features/portals/
  components/
    PortalDashboard/
      index.tsx
  data/
    mockData.ts
  styles/
    PortalDashboard.module.css
  types/
    types.ts
  utils/
    utils.ts
  index.ts
```

Este modulo separa CSS, dados, tipos e helpers da tela.

## Back-end Interno

```txt
server/index.js
server/db.js
server/routes/
src/services/internalApi.js
```

Use `.env` ou `.env.local` para dados reais de MySQL e Splunk:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=usuario
MYSQL_PASSWORD=senha
MYSQL_DATABASE=plataforma_bellinati

SPLUNK_BASE_URL=https://splunk.interno.exemplo:8089
SPLUNK_AUTH_TOKEN=token
```

O `.env.example` deve continuar apenas como modelo.

## Onde Alterar

```txt
Inicializacao do app:
  src/app/App.jsx

Cliente da API interna:
  src/services/internalApi.js

Back-end Express:
  server/

Dashboard principal, login, menu e layout atual:
  src/pages/dashboard/

POCs:
  src/features/pocs/

Scrum:
  src/features/scrum/

Portais:
  src/features/portals/

Marketing:
  src/features/marketing/

CSS global:
  src/styles/global.css

Scripts de banco:
  src/database/
```

## Padrao de Manutencao

- Evite estilos inline em codigo novo.
- Prefira CSS module ou arquivo em `styles/` para estilos especificos.
- Mantenha services fora das paginas.
- Mantenha calculos e formatadores em `utils/`.
- Mantenha dados iniciais e mocks em `data/`.
- Quebre paginas grandes em componentes menores dentro de `components/`.
- Rode `npm run check` antes de commitar.
