import {
  createRecord,
  listRecords,
  updateRecord,
} from "../../../services/internalApi";

const POC_RESOURCE = "poc-records";

export function listPocRecords() {
  return listRecords(POC_RESOURCE);
}

export function savePocRecord({ id, payload }) {
  if (id) {
    return updateRecord(POC_RESOURCE, id, payload);
  }

  return createRecord(POC_RESOURCE, { ...payload });
}
