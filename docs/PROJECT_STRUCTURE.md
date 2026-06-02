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
  config/
    env.js
  database/
    README.md
  features/
    pocs/
    scrum/
    portals/
  layouts/
  pages/
    dashboard/
    portals/
  services/
    supabase/
  styles/
    global.css
```

## Camadas

- `app/`: inicializacao da aplicacao React. O `App.jsx` deve ficar pequeno e delegar telas para `pages/`.
- `pages/`: telas completas e fluxos de tela.
- `layouts/`: estruturas reutilizaveis de pagina, como sidebar/topbar/shell, quando forem extraidas.
- `components/`: componentes compartilhados entre varias areas.
- `features/`: modulos de negocio com seus proprios `pages`, `components`, `services`, `utils`, `data` e `styles`.
- `services/`: clientes e integracoes externas compartilhadas.
- `config/`: leitura e normalizacao de configuracoes de ambiente.
- `styles/`: CSS global. CSS especifico de tela/modulo deve ficar perto do modulo.
- `assets/`: imagens, icones, fontes e arquivos estaticos.
- `database/`: scripts SQL, migrations, seeds ou documentacao de banco.

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
- `pocRecordService.js`: persistencia da POC no Supabase.
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
- `scrumProjectService.js`: persistencia no Supabase.
- `scrumTheme.js`: tokens visuais usados pela tela.

## Portais

```txt
src/pages/portals/
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

Este modulo ja separa CSS, dados, tipos e helpers da tela.

## Supabase

```txt
src/config/env.js
src/services/supabase/client.js
src/services/supabase/index.js
```

Use `.env` ou `.env.local` para dados reais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

O `.env.example` deve continuar apenas como modelo.

## Onde Alterar

```txt
Inicializacao do app:
  src/app/App.jsx

Variaveis de ambiente:
  src/config/env.js

Cliente Supabase:
  src/services/supabase/client.js

Dashboard principal, login, menu e layout atual:
  src/pages/dashboard/DashboardPage.jsx

POCs:
  src/features/pocs/

Scrum:
  src/features/scrum/

Portais:
  src/pages/portals/

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

