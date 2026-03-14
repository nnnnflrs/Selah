import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uuidSchema } from "@/lib/validators";
import { getAuthUser } from "@/lib/utils/auth";

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

  const admin = createAdminClient();

  // Check if already reported
  const { data: existing } = await admin
    .from("reports")
    .select("id")
    .eq("recording_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Already reported" },
      { status: 409 }
    );
  }

  // Insert report
  const { error: reportError } = await admin.from("reports").insert({
    recording_id: params.id,
    user_id: user.id,
  });

  if (reportError) {
    console.error("Failed to submit report:", reportError.message);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }

  // Increment reports count
  await admin.rpc("increment_reports_count", {
    target_recording_id: params.id,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
