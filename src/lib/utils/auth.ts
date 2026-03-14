import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Extracts the authenticated (non-anonymous) user from the Supabase session.
 * Returns null if the user is not authenticated or is anonymous.
 * Memoized per request via React.cache() to avoid duplicate Supabase calls.
 */
export const getAuthUser = cache(async () => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || user.is_anonymous) {
    return null;
  }

  return user;
});
