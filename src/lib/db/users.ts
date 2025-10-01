/**
 * Database operations for Users
 * Backend logic that can be easily extracted to a separate service
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type User = Database["public"]["Tables"]["users"]["Row"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export const usersDb = {
  /**
   * Get user by ID
   */
  async getById(supabase: SupabaseClient<Database>, id: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as User;
  },

  /**
   * Get current authenticated user
   */
  async getCurrent(supabase: SupabaseClient<Database>) {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) throw error;
    return data as User;
  },

  /**
   * Update user profile
   */
  async update(
    supabase: SupabaseClient<Database>,
    id: string,
    updates: UserUpdate
  ) {
    const { data, error } = await supabase
      .from("users")
      .update(updates as never)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  /**
   * Search users by name or email
   */
  async search(supabase: SupabaseClient<Database>, query: string) {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, avatar_url")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data;
  },

  /**
   * Get user's followers
   */
  async getFollowers(supabase: SupabaseClient<Database>, userId: string) {
    const { data, error } = await supabase
      .from("follows")
      .select("follower:users!follows_follower_id_fkey(id, name, avatar_url)")
      .eq("following_id", userId);

    if (error) throw error;
    return (data as Array<{ follower: { id: string; name: string; avatar_url: string | null } }>).map((item) => item.follower);
  },

  /**
   * Get users that a user is following
   */
  async getFollowing(supabase: SupabaseClient<Database>, userId: string) {
    const { data, error } = await supabase
      .from("follows")
      .select(
        "following:users!follows_following_id_fkey(id, name, avatar_url)"
      )
      .eq("follower_id", userId);

    if (error) throw error;
    return (data as Array<{ following: { id: string; name: string; avatar_url: string | null } }>).map((item) => item.following);
  },

  /**
   * Follow a user
   */
  async follow(
    supabase: SupabaseClient<Database>,
    followerId: string,
    followingId: string
  ) {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: followerId, following_id: followingId } as never);

    if (error) throw error;
  },

  /**
   * Unfollow a user
   */
  async unfollow(
    supabase: SupabaseClient<Database>,
    followerId: string,
    followingId: string
  ) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) throw error;
  },

  /**
   * Check if user is following another user
   */
  async isFollowing(
    supabase: SupabaseClient<Database>,
    followerId: string,
    followingId: string
  ) {
    const { data, error } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};

