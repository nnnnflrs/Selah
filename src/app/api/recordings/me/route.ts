import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(50, Number(searchParams.get("limit")) || 50);

  const admin = createAdminClient();

  let query = admin
    .from("recordings")
    .select("id, anonymous_name, anonymous_id, emotion, audio_url, latitude, longitude, location_text, duration, is_public, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch journal:", error.message);
    return NextResponse.json({ error: "Failed to fetch recordings" }, { status: 500 });
  }

  const hasMore = (data?.length ?? 0) > limit;
  const recordings = data?.slice(0, limit) ?? [];
  const nextCursor = hasMore ? recordings[recordings.length - 1]?.created_at : null;

  return NextResponse.json({ data: recordings, nextCursor });
}
