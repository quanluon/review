/**
 * Frontend Hook: usePlaces
 * Fetches and manages places data
 */

"use client";

import { useState, useEffect } from "react";
import type { Database } from "@/types/supabase";

type Place = Database["public"]["Tables"]["places"]["Row"];

interface UsePlacesOptions {
  limit?: number;
  orderBy?: "avg_rating" | "created_at" | "review_count";
  type?: string;
  search?: string;
  trending?: boolean;
}

export function usePlaces(options: UsePlacesOptions = {}) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (options.limit) params.set("limit", options.limit.toString());
        if (options.orderBy) params.set("orderBy", options.orderBy);
        if (options.type) params.set("type", options.type);
        if (options.search) params.set("search", options.search);
        if (options.trending) params.set("trending", "true");

        const response = await fetch(`/api/places?${params}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch places");
        }

        setPlaces(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [options.limit, options.orderBy, options.type, options.search, options.trending]);

  const createPlace = async (placeData: {
    name: string;
    address?: string;
    type?: string;
    lat?: number;
    lng?: number;
  }) => {
    const response = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(placeData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create place");
    }

    setPlaces((prev) => [result.data, ...prev]);
    return result.data;
  };

  const refresh = () => {
    // Force re-fetch by updating a dependency
    const params = new URLSearchParams();
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.orderBy) params.set("orderBy", options.orderBy);
    if (options.type) params.set("type", options.type);
    if (options.search) params.set("search", options.search);
    if (options.trending) params.set("trending", "true");

    fetch(`/api/places?${params}`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          setPlaces(result.data);
        }
      })
      .catch((err) => {
        console.error("Error refreshing places:", err);
      });
  };

  return { places, loading, error, createPlace, refresh };
}

