import type { Metadata } from "next";

import { AlertsClient } from "./alerts-client";
import type { AIAnalysis } from "@/lib/aiAnalyzer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Alerts — PulseTrack",
  description: "Review unread competitor changes grouped by urgency level.",
};

export default async function AlertsPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const rawChanges = await prisma.change.findMany({
    where: {
      snapshot: {
        trackedPage: {
          competitor: { userId },
        },
      },
    },
    include: {
      snapshot: {
        include: {
          trackedPage: {
            include: {
              competitor: {
                select: { id: true, name: true, website: true, logoUrl: true },
              },
            },
          },
        },
      },
    },
    orderBy: { detectedAt: "desc" },
    take: 100,
  });

  const changes = rawChanges.map((change) => ({
    id: change.id,
    urgency: change.urgency as "HIGH" | "MEDIUM" | "LOW",
    isRead: change.isRead,
    detectedAt: change.detectedAt.toISOString(),
    diffText: change.diffText,
    aiAnalysis: (change.aiAnalysis as AIAnalysis | null),
    competitorId: change.snapshot.trackedPage.competitor.id,
    competitorName: change.snapshot.trackedPage.competitor.name,
    competitorWebsite: change.snapshot.trackedPage.competitor.website,
    competitorLogoUrl: change.snapshot.trackedPage.competitor.logoUrl,
    pageType: change.snapshot.trackedPage.pageType as string,
  }));

  return <AlertsClient changes={changes} />;
}
