/**
 * Ensure User Exists in Public Schema
 * Helper function to ensure authenticated user has a record in public.users table
 * This handles cases where social auth users might not have triggered the database trigger
 */

import type { Database } from "@/types/supabase";
import type { User } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";

export async function ensureUserExists(
  supabase: SupabaseClient<Database>,
  authUser: User
): Promise<void> {
  // Check if user exists in public.users
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", authUser.id)
    .maybeSingle();

  // If user doesn't exist, create them
  if (!existingUser) {
    const userName =
      authUser.user_metadata?.name ||
      authUser.user_metadata?.full_name ||
      authUser.email?.split("@")[0] ||
      "User";

    const { error } = await supabase.from("users").insert({
      id: authUser.id,
      email: authUser.email!,
      name: userName,
      avatar_url: authUser.user_metadata?.avatar_url || null,
    } as never);
    
    if (error) {
      console.error("Error creating user in public.users:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }
}

