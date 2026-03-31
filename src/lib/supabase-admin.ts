import { createClient } from "@supabase/supabase-js";

// Service role client for admin operations — bypasses RLS
// Only used in server-side admin actions/routes
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
