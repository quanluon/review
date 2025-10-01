/**
 * API Route: /api/places
 * Handles place-related operations
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { placesDb } from "@/lib/db/places";
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
    const orderBy = searchParams.get("orderBy") as
      | "avg_rating"
      | "created_at"
      | "review_count"
      | undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search");
    const trending = searchParams.get("trending") === "true";

    let places;

    if (search) {
      places = await placesDb.search(supabase, search);
    } else if (trending) {
      places = await placesDb.getTrending(supabase, { limit });
    } else {
      places = await placesDb.getAll(supabase, {
        limit,
        offset,
        orderBy,
        type,
      });
    }

    return NextResponse.json({ data: places, error: null });
  } catch (error) {
    console.error("Error fetching places:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch places" },
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
        { error: "Authentication required to create places" },
        { status: 401 }
      );
    }

    // Ensure user exists in public.users table
    await ensureUserExists(supabase, user);

    const body = await request.json();
    const { name, address, type, lat, lng } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const place = await placesDb.create(supabase, {
      name,
      address,
      type,
      lat,
      lng,
    });

    return NextResponse.json({ data: place, error: null }, { status: 201 });
  } catch (error) {
    console.error("Error creating place:", error);
    return NextResponse.json(
      { data: null, error: "Failed to create place" },
      { status: 500 }
    );
  }
}

