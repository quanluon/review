/**
 * Database operations for Follows
 * Backend logic for following/unfollowing users
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export const followsDb = {
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
      .insert({
        follower_id: followerId,
        following_id: followingId,
      } as never);

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
   * Check if following a user
   */
  async isFollowing(
    supabase: SupabaseClient<Database>,
    followerId: string,
    followingId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  /**
   * Get follower count for a user
   */
  async getFollowerCount(
    supabase: SupabaseClient<Database>,
    userId: string
  ): Promise<number> {
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Get following count for a user
   */
  async getFollowingCount(
    supabase: SupabaseClient<Database>,
    userId: string
  ): Promise<number> {
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (error) throw error;
    return count || 0;
  },
};

