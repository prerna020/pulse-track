import { NextResponse } from "next/server";

import type { AIAnalysis } from "@/lib/aiAnalyzer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const changes = await prisma.change.findMany({
    where: {
      snapshot: {
        trackedPage: {
          competitor: { userId: session.user.id },
        },
      },
    },
    include: {
      snapshot: {
        include: {
          trackedPage: {
            include: {
              competitor: {
                select: {
                  name: true,
                  logoUrl: true,
                  website: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { detectedAt: "desc" },
    take: 50,
  });

  const result = changes.map((change) => ({
    id: change.id,
    competitorName: change.snapshot.trackedPage.competitor.name,
    competitorLogoUrl: change.snapshot.trackedPage.competitor.logoUrl,
    competitorWebsite: change.snapshot.trackedPage.competitor.website,
    pageType: change.snapshot.trackedPage.pageType,
    urgency: change.urgency,
    aiAnalysis: change.aiAnalysis as AIAnalysis | null,
    diffText: change.diffText,
    detectedAt: change.detectedAt.toISOString(),
    isRead: change.isRead,
  }));

  return NextResponse.json(result);
}
