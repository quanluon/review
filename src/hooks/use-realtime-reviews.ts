/**
 * Frontend Hook: useRealtimeReviews
 * Subscribes to real-time review updates using Supabase Realtime
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ReviewWithRelations } from "@/lib/db/reviews";
import type { Database } from "@/types/supabase";

type Review = Database["public"]["Tables"]["reviews"]["Row"];

interface UseRealtimeReviewsOptions {
  placeId?: string;
  initialReviews?: ReviewWithRelations[];
}

export function useRealtimeReviews(options: UseRealtimeReviewsOptions = {}) {
  const [reviews, setReviews] = useState<ReviewWithRelations[]>(
    options.initialReviews || []
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Update reviews when initialReviews changes
    if (options.initialReviews) {
      setReviews(options.initialReviews);
    }
  }, [options.initialReviews]);

  useEffect(() => {
    const supabase = createClient();
    
    // Set up realtime subscription
    const channel = supabase
      .channel(`reviews-${options.placeId || 'all'}-${Date.now()}`)
      .on<Review>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
          ...(options.placeId && {
            filter: `place_id=eq.${options.placeId}`,
          }),
        },
        async (payload) => {
          console.log("New review received!", payload);

          // Fetch the full review with relations
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
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            setReviews((current) => [data as unknown as ReviewWithRelations, ...current]);
          }
        }
      )
      .on<Review>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reviews",
          ...(options.placeId && {
            filter: `place_id=eq.${options.placeId}`,
          }),
        },
        async (payload) => {
          console.log("Review updated!", payload);

          // Fetch the updated review with relations
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
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            setReviews((current) =>
              current.map((review) =>
                review.id === payload.new.id
                  ? (data as unknown as ReviewWithRelations)
                  : review
              )
            );
          }
        }
      )
      .on<Review>(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "reviews",
          ...(options.placeId && {
            filter: `place_id=eq.${options.placeId}`,
          }),
        },
        (payload) => {
          console.log("Review deleted!", payload);
          setReviews((current) =>
            current.filter((review) => review.id !== payload.old.id)
          );
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setIsConnected(false);
          console.error("Realtime connection error:", status);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [options.placeId]);

  return { reviews, setReviews, isConnected };
}

