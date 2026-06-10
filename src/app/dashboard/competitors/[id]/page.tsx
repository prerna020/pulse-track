import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PAGE_TYPE_LABELS } from "@/lib/competitors";
import { ScrapePageButton } from "./scrape-page-button";

export default async function CompetitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const competitor = await prisma.competitor.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      pages: {
        include: {
          _count: { select: { snapshots: true } },
          snapshots: {
            orderBy: { scrapedAt: "desc" },
            take: 1,
            select: { scrapedAt: true },
          },
        },
        orderBy: { pageType: "asc" },
      },
    },
  });

  if (!competitor) notFound();

  const initials = competitor.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const domain = competitor.website
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  const totalSnapshots = competitor.pages.reduce(
    (sum, p) => sum + p._count.snapshots,
    0
  );

  const lastScrapedAt = competitor.pages
    .flatMap((p) => p.snapshots)
    .map((s) => new Date(s.scrapedAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return (
    <div>
      {/* Back navigation */}
      <Link
        href="/dashboard/competitors"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Competitors
      </Link>

      {/* Header */}
      <div className="glass-card mb-6 flex items-start gap-5 p-6">
        <Avatar className="size-16 rounded-xl shrink-0">
          <AvatarImage src={competitor.logoUrl ?? undefined} alt={competitor.name} />
          <AvatarFallback className="rounded-xl bg-black/5 text-xl font-semibold text-[#0a0a0a]">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[#0a0a0a]">
              {competitor.name}
            </h1>
            <Badge
              variant={competitor.isActive ? "default" : "secondary"}
              className={
                competitor.isActive
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-500"
              }
            >
              {competitor.isActive ? "Active" : "Paused"}
            </Badge>
          </div>

          <a
            href={competitor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
          >
            <Globe className="size-3.5" />
            {domain}
            <ExternalLink className="size-3" />
          </a>

          <div className="mt-4 flex flex-wrap gap-6">
            <Stat label="Pages tracked" value={competitor.pages.length} />
            <Stat label="Total snapshots" value={totalSnapshots} />
            <Stat
              label="Last scraped"
              value={
                lastScrapedAt
                  ? lastScrapedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Never"
              }
            />
            <Stat label="Frequency" value={competitor.frequency} />
          </div>
        </div>
      </div>

      {/* Tracked Pages */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-[#0a0a0a]">
          Tracked Pages
        </h2>

        {competitor.pages.length === 0 ? (
          <div className="glass-card py-12 text-center">
            <p className="text-sm text-[#6b7280]">No pages configured.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {competitor.pages.map((page) => {
              const lastSnapshot = page.snapshots[0];
              const lastSnapshotDate = lastSnapshot
                ? new Date(lastSnapshot.scrapedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              return (
                <div
                  key={page.id}
                  className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-black/5 px-2 py-0.5 text-xs font-medium text-[#0a0a0a]">
                        {PAGE_TYPE_LABELS[page.pageType]}
                      </span>
                      <span className="text-xs text-[#9ca3af]">
                        {page._count.snapshots}{" "}
                        {page._count.snapshots === 1 ? "snapshot" : "snapshots"}
                      </span>
                    </div>

                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#0a0a0a] transition-colors truncate"
                    >
                      {page.url}
                      <ExternalLink className="size-3 shrink-0" />
                    </a>

                    <p className="mt-1 text-xs text-[#9ca3af]">
                      {lastSnapshotDate
                        ? `Last snapshot: ${lastSnapshotDate}`
                        : "Never scraped"}
                    </p>
                  </div>

                  <ScrapePageButton
                    trackedPageId={page.id}
                    pageType={page.pageType}
                    url={page.url}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-[#9ca3af]">{label}</p>
      <p className="mt-0.5 text-sm font-medium capitalize text-[#0a0a0a]">
        {value}
      </p>
    </div>
  );
}
