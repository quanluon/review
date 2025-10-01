/**
 * API Route: /api/places/[id]
 * Handles individual place operations
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { placesDb } from "@/lib/db/places";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const place = await placesDb.getById(supabase, id);

    return NextResponse.json({ data: place, error: null });
  } catch (error) {
    console.error("Error fetching place:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch place" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication - required for PATCH
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to update places" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const place = await placesDb.update(supabase, id, body);

    return NextResponse.json({ data: place, error: null });
  } catch (error) {
    console.error("Error updating place:", error);
    return NextResponse.json(
      { data: null, error: "Failed to update place" },
      { status: 500 }
    );
  }
}

