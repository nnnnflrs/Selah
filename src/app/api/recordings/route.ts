import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { boundsSchema, recordingMetadataSchemaV2 } from "@/lib/validators";
import { sanitizeText } from "@/lib/utils/sanitize";
import { RECORDINGS_PAGE_SIZE, DAILY_RECORDING_LIMIT } from "@/lib/constants";
import { isValidAudioType, isValidAudioSize } from "@/lib/utils/audio";
import { getAuthUser } from "@/lib/utils/auth";
import { generateVoiceId } from "@/lib/utils/names";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const parsed = boundsSchema.safeParse({
    north: Number(searchParams.get("north")),
    south: Number(searchParams.get("south")),
    east: Number(searchParams.get("east")),
    west: Number(searchParams.get("west")),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bounds" }, { status: 400 });
  }

  const { north, south, east, west } = parsed.data;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    RECORDINGS_PAGE_SIZE,
    Number(searchParams.get("limit")) || RECORDINGS_PAGE_SIZE
  );
  const dateParam = searchParams.get("date");

  const admin = createAdminClient();

  let query = admin
    .from("recordings")
    .select(
      "id, anonymous_name, anonymous_id, emotion, latitude, longitude, created_at",
      { count: "exact" }
    )
    .eq("is_approved", true)
    .eq("is_public", true)
    .lte("reports_count", 5)
    .gte("latitude", south)
    .lte("latitude", north)
    .gte("longitude", west)
    .lte("longitude", east);

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const startOfDay = `${dateParam}T00:00:00.000Z`;
    const nextDay = new Date(dateParam + "T00:00:00.000Z");
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const endOfDay = nextDay.toISOString();
    query = query.gte("created_at", startOfDay).lt("created_at", endOfDay);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error("Failed to fetch recordings:", error.message);
    return NextResponse.json({ error: "Failed to fetch recordings" }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], count, page });
}

export async function POST(request: NextRequest) {
  // Require authenticated (non-anonymous) user
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const admin = createAdminClient();

  const formData = await request.formData();
  const audioFile = formData.get("audio") as File | null;
  const metadataRaw = formData.get("metadata") as string | null;

  if (!audioFile || !metadataRaw) {
    return NextResponse.json(
      { error: "Missing audio or metadata" },
      { status: 400 }
    );
  }

  if (!isValidAudioType(audioFile.type)) {
    return NextResponse.json(
      { error: "Invalid audio format" },
      { status: 400 }
    );
  }

  if (!isValidAudioSize(audioFile.size)) {
    return NextResponse.json(
      { error: "Audio file too large (max 10MB)" },
      { status: 400 }
    );
  }

  let metadata;
  try {
    metadata = JSON.parse(metadataRaw);
  } catch {
    return NextResponse.json(
      { error: "Invalid metadata JSON" },
      { status: 400 }
    );
  }

  const parsed = recordingMetadataSchemaV2.safeParse(metadata);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }

  const meta = parsed.data;

  // Daily recording limit check (skip if DISABLE_RATE_LIMIT is set)
  if (process.env.DISABLE_RATE_LIMIT !== "true") {
    const startOfDay = `${meta.local_date}T00:00:00.000Z`;
    const nextDay = new Date(meta.local_date + "T00:00:00.000Z");
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const endOfDay = nextDay.toISOString();

    const { data: existing } = await admin
      .from("recordings")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", startOfDay)
      .lt("created_at", endOfDay)
      .limit(DAILY_RECORDING_LIMIT);

    if (existing && existing.length >= DAILY_RECORDING_LIMIT) {
      return NextResponse.json(
        { error: "You've already recorded today. Come back tomorrow." },
        { status: 429 }
      );
    }
  }

  // Upload audio file
  const ext = audioFile.type.includes("webm") ? "webm" : "ogg";
  const fileId = crypto.randomUUID();
  const storagePath = `uploads/${fileId}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("recordings")
    .upload(storagePath, audioFile, {
      contentType: audioFile.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload failed:", uploadError.message);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("recordings").getPublicUrl(storagePath);

  // Generate anonymous voice ID
  const anonymousId = generateVoiceId();

  // Insert recording
  const { data: recording, error: insertError } = await admin
    .from("recordings")
    .insert({
      user_id: user.id,
      anonymous_name: anonymousId,
      anonymous_id: anonymousId,
      emotion: meta.emotion,
      audio_url: publicUrl,
      latitude: meta.latitude,
      longitude: meta.longitude,
      location_text: sanitizeText(meta.location_text || "", 100),
      duration: meta.duration,
      is_public: meta.is_public,
      is_approved: true,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to save recording:", insertError.message);
    await admin.storage.from("recordings").remove([storagePath]);
    return NextResponse.json(
      { error: "Failed to save recording" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: recording }, { status: 201 });
}
