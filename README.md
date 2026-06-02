# Plataforma Bellinati

Aplicacao React/Vite para acompanhamento de projetos, Scrum, POCs, fornecedores, portais e indicadores da area de Transformacao Digital.

## Como rodar

```bash
npm install
npm run dev
```

Opcionalmente, use o inicializador local:

```bash
npm run start
```

Para gerar build de producao:

```bash
npm run build
```

Antes de commitar:

```bash
npm run check
```

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto com os dados reais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

O arquivo `.env.example` deve ficar apenas como modelo. Ele pode subir para o GitHub. O `.env` e o `.env.local` ficam ignorados no Git.

## Estrutura principal

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
  features/
    pocs/
    scrum/
  layouts/
  pages/
    dashboard/
    portals/
  services/
    supabase/
  styles/
    global.css
```

Guia detalhado: [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)
