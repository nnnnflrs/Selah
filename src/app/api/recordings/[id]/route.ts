import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uuidSchema, togglePublicSchema } from "@/lib/validators";
import { getAuthUser } from "@/lib/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!uuidSchema.safeParse(params.id).success) {
    return NextResponse.json({ error: "Invalid recording ID" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("recordings")
    .select("id, user_id, anonymous_name, anonymous_id, emotion, audio_url, latitude, longitude, location_text, duration, is_public, created_at, is_approved, reports_count")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  // If recording is private, only the owner can view it
  if (!data.is_public) {
    const user = await getAuthUser();
    if (!user || data.user_id !== user.id) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ data });
}

export async function PATCH(
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
  const parsed = togglePublicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify ownership
  const { data: recording, error: fetchError } = await admin
    .from("recordings")
    .select("id, user_id")
    .eq("id", params.id)
    .single();

  if (fetchError || !recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  if (recording.user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: updated, error: updateError } = await admin
    .from("recordings")
    .update({ is_public: parsed.data.is_public })
    .eq("id", params.id)
    .select()
    .single();

  if (updateError) {
    console.error("Failed to update recording:", updateError.message);
    return NextResponse.json({ error: "Failed to update recording" }, { status: 500 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const idParsed = uuidSchema.safeParse(params.id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid recording ID" }, { status: 400 });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: recording, error: fetchError } = await admin
    .from("recordings")
    .select("id, user_id, audio_url")
    .eq("id", params.id)
    .single();

  if (fetchError || !recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  if (recording.user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Delete audio file from storage
  const url = new URL(recording.audio_url);
  const storagePath = url.pathname.split("/recordings/").pop();
  if (storagePath) {
    await admin.storage.from("recordings").remove([decodeURIComponent(storagePath)]);
  }

  await Promise.all([
    admin.from("comments").delete().eq("recording_id", params.id),
    admin.from("reports").delete().eq("recording_id", params.id),
  ]);

  const { error: deleteError } = await admin
    .from("recordings")
    .delete()
    .eq("id", params.id);

  if (deleteError) {
    console.error("Failed to delete recording:", deleteError.message);
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
