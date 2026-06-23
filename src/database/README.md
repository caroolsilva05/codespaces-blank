# Database

Scripts SQL, migrations, seeds e documentacao de tabelas do deploy interno.

Estado atual:

- O deploy interno usa MySQL via back-end Express.
- As credenciais ficam apenas no back-end, em `.env` ou `.env.local`.
- O schema inicial esta em `mysql-schema.sql`.

Origem do schema:

- Export de metadados do Supabase em 2026-06-23.
- `registros_do_projeto_scrum.dados_do_registro` e `poc_records.record_data` eram `jsonb` no Supabase e foram mapeados para `JSON`.
- `fornecedores.canais` era `jsonb` no Supabase e foi mapeado para `JSON`.
- `fornecedores.id` apareceu sem primary key no export de indices, mas a aplicacao usa `id` para editar registros. No MySQL, ele foi definido como `PRIMARY KEY`.
