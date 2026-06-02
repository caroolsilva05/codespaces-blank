import { createClient } from "@supabase/supabase-js";
import { env } from "../../config/env";

const missingSupabaseEnvError = {
  message:
    "Supabase nao configurado. Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.",
};

function createMissingSupabaseClient() {
  const builder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    order: () => builder,
    then: (resolve, reject) =>
      Promise.resolve({ data: [], error: missingSupabaseEnvError }).then(
        resolve,
        reject,
      ),
  };

  return {
    from: () => builder,
  };
}

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);

export const supabase = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey)
  : createMissingSupabaseClient();
