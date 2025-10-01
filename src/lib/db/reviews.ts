/**
 * Database operations for Reviews
 * Backend logic that can be easily extracted to a separate service
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type Review = Database["public"]["Tables"]["reviews"]["Row"];
type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];

export interface ReviewWithRelations extends Review {
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  place: {
    id: string;
    name: string;
  };
  review_images: Array<{
    id: string;
    image_url: string;
  }>;
  _count?: {
    comments: number;
  };
}

export const reviewsDb = {
  /**
   * Get all reviews with user and place data
   */
  async getAll(
    supabase: SupabaseClient<Database>,
    options?: {
      limit?: number;
      offset?: number;
      placeId?: string;
      userId?: string;
    }
  ) {
    let query = supabase
      .from("reviews")
      .select(
        `
        *,
        user:users!reviews_user_id_fkey(id, name, avatar_url),
        place:places!reviews_place_id_fkey(id, name),
        review_images(id, image_url)
      `
      )
      .order("created_at", { ascending: false });

    if (options?.placeId) {
      query = query.eq("place_id", options.placeId);
    }

    if (options?.userId) {
      query = query.eq("user_id", options.userId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as unknown as ReviewWithRelations[];
  },

  /**
   * Get reviews from followed users (feed)
   */
  async getFeed(
    supabase: SupabaseClient<Database>,
    userId: string,
    options?: { limit?: number; offset?: number }
  ) {
    // Get users that the current user follows
    const { data: following, error: followError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (followError) throw followError;

    const followingIds = (following as Array<{ following_id: string }>).map((f) => f.following_id);

    // Get reviews from followed users
    let query = supabase
      .from("reviews")
      .select(
        `
        *,
        user:users!reviews_user_id_fkey(id, name, avatar_url),
        place:places!reviews_place_id_fkey(id, name),
        review_images(id, image_url)
      `
      )
      .in("user_id", followingIds)
      .order("created_at", { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as unknown as ReviewWithRelations[];
  },

  /**
   * Get a single review by ID
   */
  async getById(supabase: SupabaseClient<Database>, id: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        user:users!reviews_user_id_fkey(id, name, avatar_url),
        place:places!reviews_place_id_fkey(id, name),
        review_images(id, image_url)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as unknown as ReviewWithRelations;
  },

  /**
   * Create a new review
   */
  async create(supabase: SupabaseClient<Database>, review: ReviewInsert) {
    const { data, error } = await supabase
      .from("reviews")
      .insert(review as never)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  /**
   * Update a review
   */
  async update(
    supabase: SupabaseClient<Database>,
    id: string,
    updates: ReviewUpdate
  ) {
    const { data, error } = await supabase
      .from("reviews")
      .update(updates as never)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  /**
   * Delete a review
   */
  async delete(supabase: SupabaseClient<Database>, id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * Add images to a review
   */
  async addImages(
    supabase: SupabaseClient<Database>,
    reviewId: string,
    imageUrls: string[]
  ) {
    const images = imageUrls.map((url) => ({
      review_id: reviewId,
      image_url: url,
    }));

    const { data, error } = await supabase
      .from("review_images")
      .insert(images as never)
      .select();

    if (error) throw error;
    return data;
  },
};

