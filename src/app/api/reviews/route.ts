/**
 * API Route: /api/reviews
 * Handles review operations
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reviewsDb } from "@/lib/db/reviews";
import { ensureUserExists } from "@/lib/auth/ensure-user";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : undefined;
    const placeId = searchParams.get("placeId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const feed = searchParams.get("feed") === "true";

    let reviews;

    if (feed) {
      // Feed requires authentication
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required to view personalized feed" },
          { status: 401 }
        );
      }
      reviews = await reviewsDb.getFeed(supabase, user.id, { limit, offset });
    } else {
      // Public reviews - no auth required
      reviews = await reviewsDb.getAll(supabase, {
        limit,
        offset,
        placeId,
        userId,
      });
    }

    return NextResponse.json({ data: reviews, error: null });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication - required for POST
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to create reviews" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { place_id, rating, text, images } = body;

    if (!place_id || !rating) {
      return NextResponse.json(
        { error: "Place ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Ensure user exists in public.users table
    await ensureUserExists(supabase, user);
    
    // Create review
    const review = await reviewsDb.create(supabase, {
      user_id: user.id,
      place_id,
      rating,
      text,
    });

    // Add images if provided
    if (images && images.length > 0) {
      await reviewsDb.addImages(supabase, review.id, images);
    }

    return NextResponse.json({ data: review, error: null }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { data: null, error: "Failed to create review" },
      { status: 500 }
    );
  }
}

