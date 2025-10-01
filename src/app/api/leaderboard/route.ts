/**
 * API Route: /api/leaderboard
 * Get top users by points
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

