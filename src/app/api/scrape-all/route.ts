import { NextResponse } from "next/server";

import { inngest } from "@/inngest/client";

/**
 * Manual trigger for the daily scrape job.
 * Useful for testing without waiting for the 9am cron.
 *
 * Usage:
 *   curl -X POST http://localhost:3000/api/scrape-all
 */
export async function POST() {
  await inngest.send({ name: "inngest/scheduled.timer", data: {} });

  // We also send our own event in case you want to trigger via event instead of cron
  await inngest.send({
    name: "daily.scrape",
    data: { triggeredManually: true, triggeredAt: new Date().toISOString() },
  });

  return NextResponse.json({
    ok: true,
    message: "Daily scrape event sent to Inngest",
    tip: "Open http://localhost:8288 to watch the function run in the Inngest Dev UI",
  });
}

export async function GET() {
  return NextResponse.json({
    info: "POST to this endpoint to manually trigger the daily competitor scrape",
  });
}
