"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { PageType } from "@/generated/prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  ALL_PAGE_TYPES,
  PAGE_TYPE_LABELS,
} from "@/lib/competitors";

interface CompetitorPage {
  id: string;
  pageType: PageType;
  url: string;
  lastScrapedAt: string | null;
}

interface Competitor {
  id: string;
  name: string;
  website: string;
  logoUrl: string | null;
  isActive: boolean;
  frequency: string;
  createdAt: string;
  pagesCount: number;
  lastScrapedAt: string | null;
  pages: CompetitorPage[];
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [selectedPages, setSelectedPages] = useState<PageType[]>([
    "HOMEPAGE",
    "PRICING",
  ]);

  const fetchCompetitors = useCallback(async () => {
    const res = await fetch("/api/competitors");
    if (res.ok) {
      const data = await res.json();
      setCompetitors(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  function resetForm() {
    setName("");
    setWebsite("");
    setLogoUrl("");
    setSelectedPages(["HOMEPAGE", "PRICING"]);
    setFormError("");
  }

  function togglePage(pageType: PageType) {
    setSelectedPages((prev) =>
      prev.includes(pageType)
        ? prev.filter((p) => p !== pageType)
        : [...prev, pageType]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    const res = await fetch("/api/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, website, logoUrl, pages: selectedPages }),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error ?? "Failed to add competitor");
      setIsSubmitting(false);
      return;
    }

    const newCompetitor: Competitor = await res.json();
    setCompetitors((prev) => [newCompetitor, ...prev]);
    setIsSubmitting(false);
    setSheetOpen(false);
    resetForm();
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    setCompetitors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive } : c))
    );

    const res = await fetch(`/api/competitors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });

    if (!res.ok) {
      setCompetitors((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c))
      );
    }
  }

  async function handleDelete(id: string) {
    const previous = competitors;
    setCompetitors((prev) => prev.filter((c) => c.id !== id));

    const res = await fetch(`/api/competitors/${id}`, { method: "DELETE" });

    if (!res.ok) {
      setCompetitors(previous);
    }
  }

  function handleScrapeComplete(competitorId: string, now: string) {
    setCompetitors((prev) =>
      prev.map((c) =>
        c.id === competitorId
          ? {
              ...c,
              lastScrapedAt: now,
              pages: c.pages.map((p) => ({ ...p, lastScrapedAt: now })),
            }
          : c
      )
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1208]">Competitors</h1>
          <p className="mt-1 text-sm text-[#5c4a32]">
            Track and monitor competitor websites
          </p>
        </div>
        <Button
          className="bg-[#1a1208] text-white hover:bg-[#1a1208]/90"
          onClick={() => setSheetOpen(true)}
        >
          <Plus className="size-4" />
          Add Competitor
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card h-48 animate-pulse bg-white/60"
            />
          ))}
        </div>
      ) : competitors.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-[#1a1208]">
            No competitors yet
          </p>
          <p className="mt-1 text-sm text-[#5c4a32]">
            Add your first competitor to start monitoring changes.
          </p>
          <Button
            className="mt-4 bg-[#1a1208] text-white hover:bg-[#1a1208]/90"
            onClick={() => setSheetOpen(true)}
          >
            <Plus className="size-4" />
            Add Competitor
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitors.map((competitor) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
              onScrapeComplete={handleScrapeComplete}
            />
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="glass-card w-full border-[rgba(26,18,8,0.1)] sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle className="text-[#1a1208]">Add Competitor</SheetTitle>
            <SheetDescription className="text-[#5c4a32]">
              Enter competitor details and select pages to track.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[#1a1208]">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Acme Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-[rgba(26,18,8,0.1)] bg-white/80"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-[#1a1208]">
                  Website URL
                </Label>
                <Input
                  id="website"
                  placeholder="https://acme.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="border-[rgba(26,18,8,0.1)] bg-white/80"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="logoUrl" className="text-[#1a1208]">
                  Logo URL (Optional)
                </Label>
                <Input
                  id="logoUrl"
                  placeholder="https://acme.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="border-[rgba(26,18,8,0.1)] bg-white/80"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#1a1208]">Pages to track</Label>
                <div className="space-y-2">
                  {ALL_PAGE_TYPES.map((pageType) => (
                    <label
                      key={pageType}
                      className="flex items-center gap-2.5 rounded-lg border border-[rgba(26,18,8,0.1)] bg-white/60 px-3 py-2.5"
                    >
                      <Checkbox
                        checked={selectedPages.includes(pageType)}
                        onCheckedChange={() => togglePage(pageType)}
                      />
                      <span className="text-sm text-[#1a1208]">
                        {PAGE_TYPE_LABELS[pageType]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
            </div>

            <SheetFooter>
              <Button
                type="submit"
                className="w-full bg-[#1a1208] text-white hover:bg-[#1a1208]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Competitor"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CompetitorCard({
  competitor,
  onToggleActive,
  onDelete,
  onScrapeComplete,
}: {
  competitor: Competitor;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onScrapeComplete: (competitorId: string, now: string) => void;
}) {
  const [isScraping, setIsScraping] = useState(false);

  const initials = competitor.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const lastScraped = competitor.lastScrapedAt
    ? new Date(competitor.lastScrapedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Never";

  const domain = competitor.website.replace(/^https?:\/\//, "").replace(/\/$/, "");

  async function handleScrapeNow() {
    if (isScraping || competitor.pages.length === 0) return;
    setIsScraping(true);

    const pageCount = competitor.pages.length;
    const toastId = toast.loading(
      `Scraping ${domain}… (${pageCount} ${pageCount === 1 ? "page" : "pages"})`
    );

    let successCount = 0;
    const errors: string[] = [];

    for (const page of competitor.pages) {
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackedPageId: page.id }),
        });

        if (res.ok) {
          successCount++;
        } else {
          const data = await res.json().catch(() => ({}));
          errors.push(data.error ?? `Failed (${page.pageType})`);
        }
      } catch {
        errors.push(`Network error (${page.pageType})`);
      }
    }

    setIsScraping(false);

    if (errors.length === 0) {
      const now = new Date().toISOString();
      onScrapeComplete(competitor.id, now);
      toast.success(
        `✓ Scraped ${successCount} ${successCount === 1 ? "page" : "pages"} successfully`,
        { id: toastId }
      );
    } else if (successCount > 0) {
      const now = new Date().toISOString();
      onScrapeComplete(competitor.id, now);
      toast.warning(
        `Scraped ${successCount}/${pageCount} pages — ${errors.length} failed`,
        { id: toastId }
      );
    } else {
      toast.error(`Scraping failed: ${errors[0]}`, { id: toastId });
    }
  }

  return (
    <Card className="glass-card border-[rgba(26,18,8,0.1)] shadow-none ring-0">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-10 rounded-lg shrink-0">
            <AvatarImage
              src={competitor.logoUrl ?? undefined}
              alt={competitor.name}
            />
            <AvatarFallback className="rounded-lg bg-[rgba(26,18,8,0.05)] text-sm text-[#1a1208]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="text-base text-[#1a1208] truncate">
              <Link
                href={`/dashboard/competitors/${competitor.id}`}
                className="hover:underline"
              >
                {competitor.name}
              </Link>
            </CardTitle>
            <a
              href={competitor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 flex items-center gap-1 text-xs text-[#5c4a32] hover:text-[#1a1208]"
            >
              {domain}
              <ExternalLink className="size-3 shrink-0" />
            </a>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-[#9c8570] hover:text-red-600 shrink-0"
          onClick={() => onDelete(competitor.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-[#9c8570]">Pages tracked</p>
            <p className="font-medium text-[#1a1208]">{competitor.pagesCount}</p>
          </div>
          <div>
            <p className="text-xs text-[#9c8570]">Last scraped</p>
            <p className="font-medium text-[#1a1208]">{lastScraped}</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[rgba(26,18,8,0.1)] bg-white/60 px-3 py-2">
          <span className="text-sm text-[#5c4a32]">Active</span>
          <Switch
            checked={competitor.isActive}
            onCheckedChange={(checked) =>
              onToggleActive(competitor.id, checked)
            }
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 border-[rgba(26,18,8,0.1)] text-[#1a1208] hover:bg-[rgba(26,18,8,0.05)]"
          onClick={handleScrapeNow}
          disabled={isScraping || competitor.pages.length === 0}
          id={`scrape-btn-${competitor.id}`}
        >
          {isScraping ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          {isScraping ? "Scraping…" : "Scrape Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
