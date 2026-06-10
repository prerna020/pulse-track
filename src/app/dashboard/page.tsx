import { Activity, AlertTriangle, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

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
      icon: Users,
      description: "Active monitoring targets",
    },
    {
      title: "Changes This Week",
      value: changesThisWeek,
      icon: Activity,
      description: "Detected page updates",
    },
    {
      title: "High Urgency",
      value: highUrgency,
      icon: AlertTriangle,
      description: "Critical changes flagged",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0a0a0a]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Overview of your competitor intelligence
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-card border-black/8 shadow-none ring-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6b7280]">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-[#9ca3af]" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-[#0a0a0a]">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-[#9ca3af]">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
