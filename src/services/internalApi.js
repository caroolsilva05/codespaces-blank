async function requestApi(path, options = {}) {
  try {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        data: payload.data ?? null,
        error: payload.error || {
          message: payload.error?.message || "Erro ao consultar API interna.",
        },
      };
    }

    return {
      data: payload.data ?? null,
      error: payload.error || null,
      affectedRows: payload.affectedRows,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Falha ao conectar na API interna.",
      },
    };
  }
}

export function listRecords(resource) {
  return requestApi(`/api/${resource}`);
}

export function createRecord(resource, payload) {
  return requestApi(`/api/${resource}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRecord(resource, id, payload) {
  return requestApi(`/api/${resource}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteRecord(resource, id) {
  return requestApi(`/api/${resource}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export const internalApi = {
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
};
