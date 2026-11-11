import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabase() {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      throw new Error("Supabase configuration is missing.");
    }
    
    client = createClient(url, key);
  }

  return client;
}