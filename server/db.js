import mysql from "mysql2/promise";

const requiredEnv = [
  "MYSQL_HOST",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "MYSQL_DATABASE",
];

let pool;

export function getPool() {
  if (pool) return pool;

  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `MySQL nao configurado. Defina ${missing.join(", ")} nas variaveis de ambiente.`,
    );
  }

  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    namedPlaceholders: true,
    dateStrings: true,
  });

  return pool;
}

export function normalizeRecordPayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        value && typeof value === "object" ? JSON.stringify(value) : value,
      ]),
  );
}
