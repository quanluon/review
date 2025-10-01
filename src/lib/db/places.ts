/**
 * Database operations for Places
 * This module handles all place-related database queries
 * Backend logic that can be easily extracted to a separate service
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type Place = Database["public"]["Tables"]["places"]["Row"];
type PlaceInsert = Database["public"]["Tables"]["places"]["Insert"];
type PlaceUpdate = Database["public"]["Tables"]["places"]["Update"];

export const placesDb = {
  /**
   * Get all places with optional filters
   */
  async getAll(
    supabase: SupabaseClient<Database>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: "avg_rating" | "created_at" | "review_count";
      type?: string;
    }
  ) {
    let query = supabase.from("places").select("*");

    if (options?.type) {
      query = query.eq("type", options.type);
    }

    const orderColumn = options?.orderBy || "created_at";
    query = query.order(orderColumn, { ascending: false });

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
    return data as Place[];
  },

  /**
   * Get a single place by ID
   */
  async getById(supabase: SupabaseClient<Database>, id: string) {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Place;
  },

  /**
   * Search places by name or address
   */
  async search(supabase: SupabaseClient<Database>, query: string) {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
      .order("avg_rating", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data as Place[];
  },

  /**
   * Create a new place
   */
  async create(supabase: SupabaseClient<Database>, place: PlaceInsert) {
    const { data, error } = await supabase
      .from("places")
      .insert({
        name: place.name,
        address: place.address,
        type: place.type,
        lat: place.lat,
        lng: place.lng
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data as Place;
  },

  /**
   * Update a place
   */
  async update(
    supabase: SupabaseClient<Database>,
    id: string,
    updates: PlaceUpdate
  ) {
    const { data, error} = await supabase
      .from("places")
      .update(updates as never)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Place;
  },

  /**
   * Get trending places (highest rated with most reviews)
   */
  async getTrending(
    supabase: SupabaseClient<Database>,
    options?: { limit?: number }
  ) {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .gte("review_count", 1)
      .order("avg_rating", { ascending: false })
      .order("review_count", { ascending: false })
      .limit(options?.limit || 10);

    if (error) throw error;
    return data as Place[];
  },
};

