# Features

Modulos de negocio da plataforma. Cada feature deve manter perto dela tudo que for especifico do fluxo:

```txt
components/  UI especifica do modulo
data/        mocks, dados iniciais e listas estaticas
pages/       telas grandes internas da feature, quando houver
services/    chamadas de API, Supabase ou rotas serverless
styles/      CSS module ou tema especifico
types/       tipos TypeScript, quando houver
utils/       calculos, formatadores e helpers
index.*      ponto publico de importacao da feature
```

Evite importar arquivos internos de outra feature diretamente. Prefira o `index` da feature ou mova o que for compartilhado para `src/components`, `src/services` ou `src/utils`.
