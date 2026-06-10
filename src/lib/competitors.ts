import type { PageType } from "@/generated/prisma/client";

export function extractDomain(website: string): string {
  try {
    const url = new URL(
      website.startsWith("http") ? website : `https://${website}`
    );
    return url.hostname.replace(/^www\./, "");
  } catch {
    return website
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .replace(/^www\./, "");
  }
}

export function buildLogoUrl(website: string): string {
  const domain = extractDomain(website);
  return `https://logo.clearbit.com/${domain}`;
}

const PAGE_PATHS: Record<PageType, string> = {
  HOMEPAGE: "/",
  PRICING: "/pricing",
  FEATURES: "/features",
  BLOG: "/blog",
  CHANGELOG: "/changelog",
};

export function buildPageUrl(website: string, pageType: PageType): string {
  const base = website.startsWith("http") ? website : `https://${website}`;
  const url = new URL(base);
  url.pathname = PAGE_PATHS[pageType];
  return url.toString();
}

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  HOMEPAGE: "Homepage",
  PRICING: "Pricing",
  FEATURES: "Features",
  BLOG: "Blog",
  CHANGELOG: "Changelog",
};

export const ALL_PAGE_TYPES: PageType[] = [
  "HOMEPAGE",
  "PRICING",
  "FEATURES",
  "BLOG",
  "CHANGELOG",
];
