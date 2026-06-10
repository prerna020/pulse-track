import { NextResponse } from "next/server";

import { sendWeeklyDigest } from "@/lib/emailDigest";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await sendWeeklyDigest(session.user.id);
    return NextResponse.json({
      ok: true,
      message: "Test digest sent successfully! Check your inbox.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send digest";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
