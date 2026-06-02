import { supabase } from "../../../services/supabase";

export async function saveScrumProjectRecord({ id, payloads }) {
  let lastError = null;

  for (const payload of payloads) {
    const response = id
      ? await supabase.from("registros_do_projeto_scrum").update(payload).eq("id", id)
      : await supabase.from("registros_do_projeto_scrum").insert([payload]);

    if (!response.error) return null;

    lastError = response.error;
    console.log("Tentativa de salvar registro Scrum falhou:", response.error);
  }

  return lastError;
}
