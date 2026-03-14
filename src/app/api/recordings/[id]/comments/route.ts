import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { commentInsertSchema, uuidSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/utils/sanitize";
import { COMMENTS_PAGE_SIZE, MAX_COMMENT_LENGTH, MAX_NAME_LENGTH } from "@/lib/constants";
import { getAuthUser } from "@/lib/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!uuidSchema.safeParse(params.id).success) {
    return NextResponse.json({ error: "Invalid recording ID" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(
    COMMENTS_PAGE_SIZE,
    Number(searchParams.get("limit")) || COMMENTS_PAGE_SIZE
  );

  const admin = createAdminClient();

  let query = admin
    .from("comments")
    .select("id, recording_id, anonymous_name, content, created_at")
    .eq("recording_id", params.id)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch comments:", error.message);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }

  const hasMore = (data?.length ?? 0) > limit;
  const comments = data?.slice(0, limit) ?? [];
  const nextCursor = hasMore ? comments[comments.length - 1]?.created_at : null;

  return NextResponse.json({ data: comments, nextCursor });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!uuidSchema.safeParse(params.id).success) {
    return NextResponse.json({ error: "Invalid recording ID" }, { status: 400 });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = commentInsertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: comment, error } = await admin
    .from("comments")
    .insert({
      recording_id: params.id,
      user_id: user.id,
      anonymous_name: sanitizeText(parsed.data.anonymous_name, MAX_NAME_LENGTH),
      content: sanitizeText(parsed.data.content, MAX_COMMENT_LENGTH),
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save comment:", error.message);
    return NextResponse.json({ error: "Failed to save comment" }, { status: 500 });
  }

  return NextResponse.json({ data: comment }, { status: 201 });
}
