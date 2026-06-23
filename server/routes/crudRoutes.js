import { Router } from "express";
import { randomUUID } from "node:crypto";
import { getPool, normalizeRecordPayload } from "../db.js";

const tables = {
  "scrum-projects": "registros_do_projeto_scrum",
  "poc-records": "poc_records",
  fornecedores: "fornecedores",
};

function getTable(resource) {
  const table = tables[resource];
  if (!table) {
    const error = new Error("Recurso nao encontrado.");
    error.status = 404;
    throw error;
  }
  return table;
}

function normalizeRows(rows) {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        if (typeof value !== "string") return [key, value];

        const trimmed = value.trim();
        if (!trimmed || !["{", "["].includes(trimmed[0])) {
          return [key, value];
        }

        try {
          return [key, JSON.parse(value)];
        } catch {
          return [key, value];
        }
      }),
    ),
  );
}

export function createCrudRouter() {
  const router = Router();

  router.get("/:resource", async (request, response, next) => {
    try {
      const table = getTable(request.params.resource);
      const [rows] = await getPool().query(
        `SELECT * FROM \`${table}\` ORDER BY id DESC`,
      );

      response.json({ data: normalizeRows(rows), error: null });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:resource/:id", async (request, response, next) => {
    try {
      const table = getTable(request.params.resource);
      const [rows] = await getPool().execute(
        `SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`,
        [request.params.id],
      );

      response.json({ data: normalizeRows(rows)[0] || null, error: null });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:resource", async (request, response, next) => {
    try {
      const table = getTable(request.params.resource);
      const payload = normalizeRecordPayload(request.body);

      if (Object.keys(payload).length === 0) {
        return response.status(400).json({
          data: null,
          error: { message: "Payload vazio." },
        });
      }

      if (!payload.id) {
        payload.id = randomUUID();
      }

      const [result] = await getPool().query(`INSERT INTO \`${table}\` SET ?`, [
        payload,
      ]);

      response.status(201).json({
        data: { id: payload.id, affectedRows: result.affectedRows },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:resource/:id", async (request, response, next) => {
    try {
      const table = getTable(request.params.resource);
      const payload = normalizeRecordPayload(request.body);

      if (Object.keys(payload).length === 0) {
        return response.status(400).json({
          data: null,
          error: { message: "Payload vazio." },
        });
      }

      const [result] = await getPool().query(
        `UPDATE \`${table}\` SET ? WHERE id = ?`,
        [payload, request.params.id],
      );

      response.json({
        data: { id: request.params.id, affectedRows: result.affectedRows },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:resource/:id", async (request, response, next) => {
    try {
      const table = getTable(request.params.resource);
      const [result] = await getPool().execute(
        `DELETE FROM \`${table}\` WHERE id = ?`,
        [request.params.id],
      );

      response.json({
        data:
          result.affectedRows > 0
            ? [{ id: request.params.id }]
            : [],
        error: null,
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
