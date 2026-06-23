import "dotenv/config";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import mysql from "mysql2/promise";
import { getPool } from "../server/db.js";

const schemaPath = path.resolve("src/database/mysql-schema.sql");
const downloadsPath = path.join(os.homedir(), "Downloads");

const tableConfigs = [
  {
    arg: "scrum",
    label: "registros_do_projeto_scrum",
    table: "registros_do_projeto_scrum",
    defaultPath: path.join(downloadsPath, "registros_do_projeto_scrum.csv"),
    jsonColumns: ["dados_do_registro"],
    numericColumns: [],
    timestampColumns: ["created_at", "updated_at"],
    columns: [
      "id",
      "nome_do_projeto",
      "codigo_do_projeto",
      "fornecedor",
      "responsavel",
      "fase_atual",
      "status_geral",
      "dados_do_registro",
      "created_at",
      "updated_at",
    ],
  },
  {
    arg: "pocs",
    label: "poc_records",
    table: "poc_records",
    defaultPath: path.join(downloadsPath, "poc_records.csv"),
    jsonColumns: ["record_data"],
    numericColumns: [],
    timestampColumns: ["created_at", "updated_at"],
    columns: [
      "id",
      "poc_name",
      "supplier",
      "responsible",
      "status",
      "recommendation",
      "record_data",
      "created_at",
      "updated_at",
    ],
  },
  {
    arg: "fornecedores",
    label: "fornecedores",
    table: "fornecedores",
    defaultPath: path.join(downloadsPath, "fornecedores.csv"),
    jsonColumns: ["canais"],
    numericColumns: [
      "sla_meta",
      "performance_score",
      "projetos_ativos",
      "incidentes_abertos",
    ],
    timestampColumns: ["created_at", "updated_at"],
    columns: [
      "id",
      "nome",
      "categoria",
      "canais",
      "responsavel",
      "contato",
      "email",
      "telefone",
      "status",
      "sla_meta",
      "performance_score",
      "risco",
      "projetos_ativos",
      "incidentes_abertos",
      "avaliacao",
      "observacoes",
      "created_at",
      "updated_at",
    ],
  },
];

function getArg(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];

  return null;
}

function splitSqlStatements(sql) {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function applySchema() {
  const sql = fs.readFileSync(schemaPath, "utf8");
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    multipleStatements: false,
  });

  try {
    for (const statement of splitSqlStatements(sql)) {
      await connection.query(statement);
    }
  } finally {
    await connection.end();
  }
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, ""));

  return rows
    .filter((values) => values.some((value) => value !== ""))
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
    );
}

function normalizeJson(value, fallback) {
  if (!value) return JSON.stringify(fallback);
  return JSON.stringify(JSON.parse(value));
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function normalizeTimestamp(value) {
  if (!value) return null;

  return String(value)
    .trim()
    .replace("T", " ")
    .replace(/Z$/, "")
    .replace(/([+-]\d{2})(?::?\d{2})?$/, "");
}

function normalizeRecord(record, config) {
  return Object.fromEntries(
    config.columns.map((column) => {
      let value = record[column] ?? null;

      if (config.jsonColumns.includes(column)) {
        value = normalizeJson(value, column === "canais" ? [] : {});
      } else if (config.numericColumns.includes(column)) {
        value = normalizeNumber(value);
      } else if (config.timestampColumns.includes(column)) {
        value = normalizeTimestamp(value);
      } else if (value === "") {
        value = null;
      }

      return [column, value];
    }),
  );
}

async function upsertRows(pool, config, rows) {
  if (rows.length === 0) return 0;

  const columnsSql = config.columns.map((column) => `\`${column}\``).join(", ");
  const placeholders = config.columns.map(() => "?").join(", ");
  const updatesSql = config.columns
    .filter((column) => column !== "id")
    .map((column) => `\`${column}\` = VALUES(\`${column}\`)`)
    .join(", ");
  const sql = `INSERT INTO \`${config.table}\` (${columnsSql}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updatesSql}`;

  for (const row of rows) {
    const normalized = normalizeRecord(row, config);
    await pool.execute(
      sql,
      config.columns.map((column) => normalized[column]),
    );
  }

  return rows.length;
}

async function importTable(pool, config) {
  const filePath = path.resolve(getArg(config.arg) || config.defaultPath);

  if (!fs.existsSync(filePath)) {
    console.log(`Pulando ${config.label}: arquivo nao encontrado em ${filePath}`);
    return 0;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const rows = parseCsv(content);
  const count = await upsertRows(pool, config, rows);

  console.log(`${config.label}: ${count} registro(s) importado(s) de ${filePath}`);
  return count;
}

async function main() {
  const skipSchema = process.argv.includes("--skip-schema");

  if (!skipSchema) {
    await applySchema();
    console.log("Schema MySQL aplicado.");
  }

  const pool = getPool();

  try {
    for (const config of tableConfigs) {
      await importTable(pool, config);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Falha ao importar CSVs do Supabase para MySQL.");
  console.error(error);
  process.exitCode = 1;
});
