"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createTwoFilesPatch } from "diff";
import { html as diff2htmlHtml } from "diff2html";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Radar,
  Users,
} from "lucide-react";

import type { AIAnalysis } from "@/lib/aiAnalyzer";
import { parseDiffText } from "@/lib/changeDetector";
import { PAGE_TYPE_LABELS } from "@/lib/competitors";
import { timeAgo } from "@/lib/timeAgo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ChangeItem {
  id: string;
  competitorName: string;
  competitorLogoUrl: string | null;
  competitorWebsite: string;
  pageType: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  aiAnalysis: AIAnalysis | null;
  diffText: string;
  detectedAt: string;
  isRead: boolean;
}

interface StatItem {
  title: string;
  value: number;
  description: string;
  icon: "users" | "activity" | "alert";
}

const STAT_ICONS = {
  users: Users,
  activity: Activity,
  alert: AlertTriangle,
};

const URGENCY_BORDER: Record<string, string> = {
  HIGH: "border-l-red-500",
  MEDIUM: "border-l-amber-500",
  LOW: "border-l-green-500",
};

const URGENCY_PILL: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-green-50 text-green-700 border-green-200",
};

export function DashboardClient({ stats }: { stats: StatItem[] }) {
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChange, setSelectedChange] = useState<ChangeItem | null>(null);
  const [diffExpanded, setDiffExpanded] = useState(false);

  const fetchChanges = useCallback(async () => {
    const res = await fetch("/api/changes");
    if (res.ok) {
      setChanges(await res.json());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  async function handleChangeClick(change: ChangeItem) {
    setSelectedChange(change);
    setDiffExpanded(false);

    if (!change.isRead) {
      setChanges((prev) =>
        prev.map((c) => (c.id === change.id ? { ...c, isRead: true } : c))
      );
      await fetch(`/api/changes/${change.id}/read`, { method: "PATCH" });
    }
  }

  const diffHtml = useMemo(() => {
    if (!selectedChange) return "";
    const { added, removed } = parseDiffText(selectedChange.diffText);
    const patch = createTwoFilesPatch(
      "Previous",
      "Current",
      removed,
      added,
      "",
      ""
    );
    return diff2htmlHtml(patch, {
      drawFileList: false,
      matching: "lines",
      outputFormat: "line-by-line",
    });
  }, [selectedChange]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0a0a0a]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Overview of your competitor intelligence
        </p>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = STAT_ICONS[stat.icon];
          return (
            <Card
              key={stat.title}
              className="glass-card border-black/8 shadow-none ring-0"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#6b7280]">
                  {stat.title}
                </CardTitle>
                <Icon className="size-4 text-[#9ca3af]" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-[#0a0a0a]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-[#9ca3af]">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#0a0a0a]">
          Activity Feed
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card h-24 animate-pulse bg-white/60"
              />
            ))}
          </div>
        ) : changes.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-black/5">
              <Radar className="size-6 text-[#9ca3af]" />
            </div>
            <p className="text-sm font-medium text-[#0a0a0a]">
              No changes detected yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-[#6b7280]">
              Add competitors and scrape to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {changes.map((change) => (
              <ChangeCard
                key={change.id}
                change={change}
                onClick={() => handleChangeClick(change)}
              />
            ))}
          </div>
        )}
      </div>

      <Sheet
        open={!!selectedChange}
        onOpenChange={(open) => !open && setSelectedChange(null)}
      >
        <SheetContent
          side="right"
          className="glass-card w-full overflow-y-auto border-black/8 sm:max-w-[500px]"
        >
          {selectedChange && (
            <>
              <SheetHeader className="border-b border-black/8 pb-4">
                <div className="flex items-center gap-3 pr-8">
                  <Avatar className="size-8 rounded-md">
                    <AvatarImage
                      src={selectedChange.competitorLogoUrl ?? undefined}
                      alt={selectedChange.competitorName}
                    />
                    <AvatarFallback className="rounded-md bg-black/5 text-xs">
                      {selectedChange.competitorName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-base text-[#0a0a0a]">
                      {selectedChange.competitorName}
                    </SheetTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary">
                        {PAGE_TYPE_LABELS[
                          selectedChange.pageType as keyof typeof PAGE_TYPE_LABELS
                        ] ?? selectedChange.pageType}
                      </Badge>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-xs font-medium",
                          URGENCY_PILL[selectedChange.urgency]
                        )}
                      >
                        {selectedChange.urgency}
                      </span>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-3 px-4 py-4">
                <AnalysisCard
                  title="What Changed"
                  content={
                    selectedChange.aiAnalysis?.what_changed ??
                    "No analysis available."
                  }
                />
                <AnalysisCard
                  title="Why It Happened"
                  content={
                    selectedChange.aiAnalysis?.why_it_happened ??
                    "No analysis available."
                  }
                />
                <AnalysisCard
                  title="Impact On You"
                  content={
                    selectedChange.aiAnalysis?.impact_on_you ??
                    "No analysis available."
                  }
                  className="border-l-4 border-l-amber-400"
                />
                <AnalysisCard
                  title="Recommended Action"
                  content={
                    selectedChange.aiAnalysis?.recommended_action ??
                    "No analysis available."
                  }
                  className="border-l-4 border-l-[#0a0a0a] font-medium"
                />
              </div>

              <div className="border-t border-black/8 px-4 py-4">
                <button
                  type="button"
                  onClick={() => setDiffExpanded((v) => !v)}
                  className="flex w-full items-center justify-between text-sm font-medium text-[#0a0a0a]"
                >
                  Raw Diff
                  {diffExpanded ? (
                    <ChevronUp className="size-4 text-[#6b7280]" />
                  ) : (
                    <ChevronDown className="size-4 text-[#6b7280]" />
                  )}
                </button>

                {diffExpanded && (
                  <div
                    className="diff2html-wrapper mt-3 overflow-x-auto rounded-lg border border-black/8 text-xs"
                    dangerouslySetInnerHTML={{ __html: diffHtml }}
                  />
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ChangeCard({
  change,
  onClick,
}: {
  change: ChangeItem;
  onClick: () => void;
}) {
  const initials = change.competitorName.slice(0, 2).toUpperCase();
  const pageLabel =
    PAGE_TYPE_LABELS[change.pageType as keyof typeof PAGE_TYPE_LABELS] ??
    change.pageType;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "glass-card w-full border-l-4 p-4 text-left transition-shadow hover:shadow-md",
        URGENCY_BORDER[change.urgency]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar className="size-6 rounded-md">
            <AvatarImage
              src={change.competitorLogoUrl ?? undefined}
              alt={change.competitorName}
            />
            <AvatarFallback className="rounded-md bg-black/5 text-[10px]">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!change.isRead && (
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[#0a0a0a]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[#0a0a0a]">
              {change.competitorName}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {pageLabel}
            </Badge>
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                URGENCY_PILL[change.urgency]
              )}
            >
              {change.urgency}
            </span>
            <span className="ml-auto text-xs text-[#9ca3af]">
              {timeAgo(change.detectedAt)}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-[#6b7280]">
            {change.aiAnalysis?.what_changed ?? "Change detected"}
          </p>
        </div>
      </div>
    </button>
  );
}

function AnalysisCard({
  title,
  content,
  className,
}: {
  title: string;
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-black/8 bg-white/80 p-4",
        className
      )}
    >
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
        {title}
      </p>
      <p className="text-sm leading-relaxed text-[#0a0a0a]">{content}</p>
    </div>
  );
}
