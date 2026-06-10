import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { scrapeUrl } from "@/lib/scraper";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { trackedPageId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { trackedPageId } = body;

  if (!trackedPageId) {
    return NextResponse.json(
      { error: "trackedPageId is required" },
      { status: 400 }
    );
  }

  // Fetch TrackedPage and verify ownership via competitor
  const trackedPage = await prisma.trackedPage.findFirst({
    where: {
      id: trackedPageId,
      competitor: { userId: session.user.id },
    },
    include: {
      competitor: { select: { id: true, name: true } },
    },
  });

  if (!trackedPage) {
    return NextResponse.json(
      { error: "TrackedPage not found or access denied" },
      { status: 404 }
    );
  }

  // Scrape the URL
  const { html, cleanText, method } = await scrapeUrl(trackedPage.url);

  // Save Snapshot
  const snapshot = await prisma.snapshot.create({
    data: {
      trackedPageId: trackedPage.id,
      rawHtml: html,
      cleanText,
    },
  });

  // Update lastScrapedAt on the TrackedPage
  await prisma.trackedPage.update({
    where: { id: trackedPageId },
    data: { lastScrapedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    snapshotId: snapshot.id,
    textLength: cleanText.length,
    method,
  });
}
