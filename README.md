# Plataforma Bellinati

Aplicacao React/Vite para acompanhamento de projetos, Scrum, POCs, fornecedores, marketing, portais e indicadores da area de Transformacao Digital.

## Como rodar

```bash
npm install
npm run dev
```

O comando `npm run dev` sobe o back-end Express e o Vite em paralelo. O Vite
proxya chamadas `/api` para o back-end local.

Para rodar apenas a API:

```bash
npm run server
```

Para gerar build de producao:

```bash
npm run build
```

Antes de commitar:

```bash
npm run check
```

## Migracao de dados do Supabase para MySQL

Depois de preencher o `.env` com as credenciais do MySQL, rode:

```bash
npm run db:import:supabase
```

Por padrao, o script procura os arquivos abaixo na pasta `Downloads` do usuario:

```txt
fornecedores.csv
poc_records.csv
registros_do_projeto_scrum.csv
```

Tambem e possivel informar caminhos manualmente:

```bash
npm run db:import:supabase -- --fornecedores "C:\caminho\fornecedores.csv" --pocs "C:\caminho\poc_records.csv" --scrum "C:\caminho\registros_do_projeto_scrum.csv"
```

O importador aplica `src/database/mysql-schema.sql` antes da carga e faz upsert por `id`, preservando os UUIDs, datas e campos JSON exportados do Supabase.

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto com os dados reais do MySQL e do Splunk:

```env
PORT=3001
API_PORT=3001

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=usuario
MYSQL_PASSWORD=senha
MYSQL_DATABASE=plataforma_bellinati

SPLUNK_BASE_URL=https://splunk.interno.exemplo:8089
SPLUNK_AUTH_TOKEN=token
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
    marketing/
    pocs/
    portals/
    scrum/
  layouts/
  pages/
    dashboard/
  styles/
    global.css
server/
  index.js
  db.js
  routes/
```

Guia detalhado: [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)
