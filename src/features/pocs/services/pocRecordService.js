import { supabase } from "../../../services/supabase";

export function savePocRecord({ id, payload }) {
  if (id) {
    return supabase.from("poc_records").update(payload).eq("id", id);
  }

  return supabase.from("poc_records").insert([{ ...payload }]);
}
