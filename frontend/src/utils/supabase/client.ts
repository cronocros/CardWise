import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("Supabase client is not fully initialized due to missing env vars")
  }

  return createBrowserClient(
    url || "https://placeholder-dev.supabase.co",
    key || "placeholder-key"
  )
}
