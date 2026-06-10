import { NextResponse } from "next/server";

import { analyzeChange } from "@/lib/aiAnalyzer";
import { detectChanges } from "@/lib/changeDetector";
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

  const previousSnapshot = await prisma.snapshot.findFirst({
    where: { trackedPageId: trackedPage.id },
    orderBy: { scrapedAt: "desc" },
  });

  const { html, cleanText, method } = await scrapeUrl(trackedPage.url);

  const snapshot = await prisma.snapshot.create({
    data: {
      trackedPageId: trackedPage.id,
      rawHtml: html,
      cleanText,
    },
  });

  await prisma.trackedPage.update({
    where: { id: trackedPageId },
    data: { lastScrapedAt: new Date() },
  });

  let changesDetected = false;

  if (previousSnapshot) {
    const changeResult = detectChanges(
      previousSnapshot.cleanText,
      cleanText
    );

    if (changeResult) {
      const aiAnalysis = await analyzeChange({
        competitorName: trackedPage.competitor.name,
        pageType: trackedPage.pageType,
        added: changeResult.added,
        removed: changeResult.removed,
      });

      await prisma.change.create({
        data: {
          snapshotId: snapshot.id,
          diffText: changeResult.diffText,
          aiAnalysis: { ...aiAnalysis },
          urgency: aiAnalysis.urgency,
          isRead: false,
        },
      });

      changesDetected = true;
    }
  }

  return NextResponse.json({
    success: true,
    changesDetected,
    snapshotId: snapshot.id,
    textLength: cleanText.length,
    method,
  });
}
