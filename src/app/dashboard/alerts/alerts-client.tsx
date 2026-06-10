"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createTwoFilesPatch } from "diff";
import { html as diff2htmlHtml } from "diff2html";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import type { AIAnalysis } from "@/lib/aiAnalyzer";
import { parseDiffText } from "@/lib/changeDetector";
import { PAGE_TYPE_LABELS } from "@/lib/competitors";
import { timeAgo } from "@/lib/timeAgo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ChangeItem {
  id: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  isRead: boolean;
  detectedAt: string;
  diffText: string;
  aiAnalysis: AIAnalysis | null;
  competitorId: string;
  competitorName: string;
  competitorWebsite: string;
  competitorLogoUrl: string | null;
  pageType: string;
}

interface UrgencySection {
  level: "HIGH" | "MEDIUM" | "LOW";
  label: string;
  icon: React.ElementType;
  headerClass: string;
  headerTextClass: string;
  dotClass: string;
}

const URGENCY_SECTIONS: UrgencySection[] = [
  {
    level: "HIGH",
    label: "High Urgency",
    icon: ShieldAlert,
    headerClass: "border-[#a63d2f]/20 bg-[#fdf0ee]",
    headerTextClass: "text-[#a63d2f]",
    dotClass: "bg-[#a63d2f]",
  },
  {
    level: "MEDIUM",
    label: "Medium Urgency",
    icon: TrendingUp,
    headerClass: "border-[#c8956c]/20 bg-[#fdf5f0]",
    headerTextClass: "text-[#c8956c]",
    dotClass: "bg-[#c8956c]",
  },
  {
    level: "LOW",
    label: "Low Urgency",
    icon: AlertTriangle,
    headerClass: "border-[#6b7c3f]/20 bg-[#f2f5ee]",
    headerTextClass: "text-[#6b7c3f]",
    dotClass: "bg-[#6b7c3f]",
  },
];

const URGENCY_PILL: Record<string, string> = {
  HIGH: "bg-[#fdf0ee] text-[#a63d2f] border-[#a63d2f]/20",
  MEDIUM: "bg-[#fdf5f0] text-[#c8956c] border-[#c8956c]/20",
  LOW: "bg-[#f2f5ee] text-[#6b7c3f] border-[#6b7c3f]/20",
};

const URGENCY_BORDER: Record<string, string> = {
  HIGH: "border-l-[#a63d2f]",
  MEDIUM: "border-l-[#c8956c]",
  LOW: "border-l-[#6b7c3f]",
};

export function AlertsClient({
  changes: initialChanges,
}: {
  changes: ChangeItem[];
}) {
  const [changes, setChanges] = useState<ChangeItem[]>(initialChanges);
  const [selectedChange, setSelectedChange] = useState<ChangeItem | null>(null);
  const [diffExpanded, setDiffExpanded] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const [drawerWidth, setDrawerWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 400 && newWidth < window.innerWidth - 50) {
        setDrawerWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const grouped = useMemo(() => {
    const map: Record<string, ChangeItem[]> = { HIGH: [], MEDIUM: [], LOW: [] };
    for (const c of changes) {
      map[c.urgency].push(c);
    }
    return map;
  }, [changes]);

  const unreadCount = changes.filter((c) => !c.isRead).length;

  const handleChangeClick = useCallback(async (change: ChangeItem) => {
    setSelectedChange(change);
    setDiffExpanded(false);

    if (!change.isRead) {
      setChanges((prev) =>
        prev.map((c) => (c.id === change.id ? { ...c, isRead: true } : c))
      );
      await fetch(`/api/changes/${change.id}/read`, { method: "PATCH" }).catch(
        () => null
      );
    }
  }, []);

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await fetch("/api/changes/read-all", { method: "PATCH" });
      if (res.ok) {
        setChanges((prev) => prev.map((c) => ({ ...c, isRead: true })));
        toast.success("All alerts marked as read");
      } else {
        toast.error("Failed to mark alerts as read");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const diffHtml = useMemo(() => {
    if (!selectedChange) return "";
    const { added, removed } = parseDiffText(selectedChange.diffText);
    const patch = createTwoFilesPatch("Previous", "Current", removed, added, "", "");
    return diff2htmlHtml(patch, {
      drawFileList: false,
      matching: "lines",
      outputFormat: "line-by-line",
    });
  }, [selectedChange]);

  const hasAnyChanges = changes.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1208]">Alerts</h1>
          <p className="mt-1 text-sm text-[#5c4a32]">
            {unreadCount > 0
              ? `${unreadCount} unread ${unreadCount === 1 ? "change" : "changes"} across your competitors`
              : "All caught up — no unread alerts"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-[rgba(26,18,8,0.1)] text-[#1a1208] hover:bg-[rgba(26,18,8,0.05)]"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
          >
            <CheckCheck className="size-4" />
            {isMarkingAll ? "Marking…" : "Mark all as read"}
          </Button>
        )}
      </div>

      {/* Empty state */}
      {!hasAnyChanges ? (
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[rgba(26,18,8,0.05)]">
            <Bell className="size-7 text-[#9c8570]" />
          </div>
          <p className="text-sm font-medium text-[#1a1208]">No alerts yet</p>
          <p className="mt-1 max-w-sm text-sm text-[#5c4a32]">
            Add competitors and run a scrape to start detecting changes.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {URGENCY_SECTIONS.map((section) => {
            const sectionChanges = grouped[section.level];
            if (sectionChanges.length === 0) return null;
            const Icon = section.icon;
            const unread = sectionChanges.filter((c) => !c.isRead).length;

            return (
              <div key={section.level}>
                {/* Section header */}
                <div
                  className={cn(
                    "mb-3 flex items-center gap-2.5 rounded-lg border px-4 py-2.5",
                    section.headerClass
                  )}
                >
                  <Icon className={cn("size-4", section.headerTextClass)} />
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      section.headerTextClass
                    )}
                  >
                    {section.label}
                  </span>
                  <span
                    className={cn(
                      "ml-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      section.headerTextClass,
                      "bg-[rgba(26,18,8,0.05)]"
                    )}
                  >
                    {sectionChanges.length}
                  </span>
                  {unread > 0 && (
                    <span className="ml-auto text-xs text-[#5c4a32]">
                      {unread} unread
                    </span>
                  )}
                </div>

                {/* Alert items */}
                <div className="space-y-2">
                  {sectionChanges.map((change) => (
                    <AlertItem
                      key={change.id}
                      change={change}
                      onClick={() => handleChangeClick(change)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* All read state */}
          {unreadCount === 0 && hasAnyChanges && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#9c8570]">
              <BellOff className="size-4" />
              All alerts have been read
            </div>
          )}
        </div>
      )}

      {/* Detail drawer */}
      <Sheet
        open={!!selectedChange}
        onOpenChange={(open) => !open && setSelectedChange(null)}
      >
        <SheetContent
          side="right"
          className="glass-card w-full overflow-y-auto border-[rgba(26,18,8,0.1)]"
          style={{ 
            maxWidth: `${drawerWidth}px`, 
            width: "100%", 
            transition: isDragging ? "none" : undefined 
          }}
        >
          <div
            className="absolute left-0 top-0 z-50 h-full w-2 cursor-col-resize hover:bg-[rgba(26,18,8,0.1)] active:bg-[rgba(26,18,8,0.2)]"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
          />
          {selectedChange && (
            <>
              <SheetHeader className="border-b border-[rgba(26,18,8,0.1)] pb-4">
                <div className="flex items-center gap-3 pr-8">
                  <Avatar className="size-8 rounded-md">
                    <AvatarImage
                      src={selectedChange.competitorLogoUrl ?? undefined}
                      alt={selectedChange.competitorName}
                    />
                    <AvatarFallback className="rounded-md bg-[rgba(26,18,8,0.05)] text-xs">
                      {selectedChange.competitorName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-base text-[#1a1208]">
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
                  className="border-l-4 border-l-[#c8956c]"
                />
                <AnalysisCard
                  title="Recommended Action"
                  content={
                    selectedChange.aiAnalysis?.recommended_action ??
                    "No analysis available."
                  }
                  className="border-l-4 border-l-[#1a1208] font-medium"
                />
              </div>

              <div className="border-t border-[rgba(26,18,8,0.1)] px-4 py-4">
                <button
                  type="button"
                  onClick={() => setDiffExpanded((v) => !v)}
                  className="flex w-full items-center justify-between text-sm font-medium text-[#1a1208]"
                >
                  Raw Diff
                  {diffExpanded ? (
                    <ChevronUp className="size-4 text-[#5c4a32]" />
                  ) : (
                    <ChevronDown className="size-4 text-[#5c4a32]" />
                  )}
                </button>

                {diffExpanded && (
                  <div
                    className="diff2html-wrapper mt-3 overflow-x-auto rounded-lg border border-[rgba(26,18,8,0.1)] text-xs"
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

function AlertItem({
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
        "glass-card w-full border-l-4 p-4 text-left transition-all hover:shadow-md",
        URGENCY_BORDER[change.urgency],
        change.isRead && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar className="size-8 rounded-md">
            <AvatarImage
              src={change.competitorLogoUrl ?? undefined}
              alt={change.competitorName}
            />
            <AvatarFallback className="rounded-md bg-[rgba(26,18,8,0.05)] text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!change.isRead && (
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#1a1208] ring-2 ring-white" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[#1a1208]">
              {change.competitorName}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {pageLabel}
            </Badge>
            <span className="ml-auto text-xs text-[#9c8570]">
              {timeAgo(change.detectedAt)}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-[#5c4a32]">
            {change.aiAnalysis?.what_changed ?? "Change detected"}
          </p>
          <p className="mt-1 text-xs text-[#9c8570]">
            View Details →
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
        "rounded-lg border border-[rgba(26,18,8,0.1)] bg-white/80 p-4",
        className
      )}
    >
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[#9c8570]">
        {title}
      </p>
      <p className="text-sm leading-relaxed text-[#1a1208]">{content}</p>
    </div>
  );
}
