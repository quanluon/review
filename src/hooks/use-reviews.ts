/**
 * Frontend Hook: useReviews
 * Fetches and manages reviews data
 */

"use client";

import { useState, useEffect } from "react";
import type { ReviewWithRelations } from "@/lib/db/reviews";

interface UseReviewsOptions {
  limit?: number;
  placeId?: string;
  userId?: string;
  feed?: boolean;
}

export function useReviews(options: UseReviewsOptions = {}) {
  const [reviews, setReviews] = useState<ReviewWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (options.limit) params.set("limit", options.limit.toString());
        if (options.placeId) params.set("placeId", options.placeId);
        if (options.userId) params.set("userId", options.userId);
        if (options.feed) params.set("feed", "true");

        const response = await fetch(`/api/reviews?${params}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch reviews");
        }

        setReviews(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [options.limit, options.placeId, options.userId, options.feed]);

  const createReview = async (reviewData: {
    place_id: string;
    rating: number;
    text?: string;
    images?: string[];
  }) => {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create review");
    }

    return result.data;
  };

  const refresh = async () => {
    const params = new URLSearchParams();
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.placeId) params.set("placeId", options.placeId);
    if (options.userId) params.set("userId", options.userId);
    if (options.feed) params.set("feed", "true");

    const response = await fetch(`/api/reviews?${params}`);
    const result = await response.json();

    if (response.ok) {
      setReviews(result.data);
    }
  };

  return { reviews, loading, error, createReview, refresh };
}

