import type { Metadata } from "next";

import { DashboardClient } from "@/app/dashboard/dashboard-client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard — PulseTrack",
  description: "Overview of your competitor intelligence: tracked changes, urgency scores, and activity feed.",
};


export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [competitorsCount, changesThisWeek, highUrgency] = await Promise.all([
    prisma.competitor.count({ where: { userId } }),
    prisma.change.count({
      where: {
        detectedAt: { gte: weekAgo },
        snapshot: {
          trackedPage: {
            competitor: { userId },
          },
        },
      },
    }),
    prisma.change.count({
      where: {
        urgency: "HIGH",
        detectedAt: { gte: weekAgo },
        snapshot: {
          trackedPage: {
            competitor: { userId },
          },
        },
      },
    }),
  ]);

  const stats = [
    {
      title: "Competitors Tracked",
      value: competitorsCount,
      icon: "users" as const,
      description: "Active monitoring targets",
    },
    {
      title: "Changes This Week",
      value: changesThisWeek,
      icon: "activity" as const,
      description: "Detected page updates",
    },
    {
      title: "High Urgency",
      value: highUrgency,
      icon: "alert" as const,
      description: "Critical changes flagged",
    },
  ];

  return <DashboardClient stats={stats} />;
}
