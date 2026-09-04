"use client";

import { createClient } from "@supabase/supabase-js";

let client = null;

/** Returns Supabase browser client when env is set; otherwise null (local demo backend). */
export function getSupabaseClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    client = createClient(url, key);
    return client;
  } catch {
    return null;
  }
}

export function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
