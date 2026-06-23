import {
  createRecord,
  deleteRecord,
  listRecords,
  updateRecord,
} from "../../../services/internalApi";

const SCRUM_RESOURCE = "scrum-projects";

export function listScrumProjectRecords() {
  return listRecords(SCRUM_RESOURCE);
}

export async function saveScrumProjectRecord({ id, payloads }) {
  let lastError = null;

  for (const payload of payloads) {
    const response = id
      ? await updateRecord(SCRUM_RESOURCE, id, payload)
      : await createRecord(SCRUM_RESOURCE, payload);

    if (!response.error) return null;

    lastError = response.error;
    console.log("Tentativa de salvar registro Scrum falhou:", response.error);
  }

  return lastError;
}

export function deleteScrumProjectRecord(id) {
  return deleteRecord(SCRUM_RESOURCE, id);
}
