"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import type { PageType } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { PAGE_TYPE_LABELS } from "@/lib/competitors";

interface ScrapePageButtonProps {
  trackedPageId: string;
  pageType: PageType;
  url: string;
}

export function ScrapePageButton({
  trackedPageId,
  pageType,
  url,
}: ScrapePageButtonProps) {
  const [isScraping, setIsScraping] = useState(false);

  const label = PAGE_TYPE_LABELS[pageType];
  const shortUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  async function handleScrape() {
    if (isScraping) return;
    setIsScraping(true);

    const toastId = toast.loading(`Scraping ${label} — ${shortUrl}…`);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackedPageId }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(
          `✓ Scraped ${label} — ${data.textLength.toLocaleString()} chars captured`,
          { id: toastId }
        );
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Scraping failed", { id: toastId });
      }
    } catch {
      toast.error("Network error — scraping failed", { id: toastId });
    } finally {
      setIsScraping(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleScrape}
      disabled={isScraping}
      id={`scrape-page-${trackedPageId}`}
      className="gap-2 shrink-0 border-black/10 text-[#0a0a0a] hover:bg-black/5"
    >
      {isScraping ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <RefreshCw className="size-3.5" />
      )}
      {isScraping ? "Scraping…" : "Scrape Now"}
    </Button>
  );
}
