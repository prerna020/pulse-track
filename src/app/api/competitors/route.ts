import { NextResponse } from "next/server";

import type { PageType } from "@/generated/prisma/client";
import { buildLogoUrl, buildPageUrl } from "@/lib/competitors";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const competitors = await prisma.competitor.findMany({
    where: { userId: session.user.id },
    include: {
      pages: {
        select: {
          id: true,
          pageType: true,
          url: true,
          lastScrapedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = competitors.map((competitor) => {
    const lastScrapedAt = competitor.pages.reduce<Date | null>((latest, page) => {
      if (!page.lastScrapedAt) return latest;
      if (!latest || page.lastScrapedAt > latest) return page.lastScrapedAt;
      return latest;
    }, null);

    return {
      id: competitor.id,
      name: competitor.name,
      website: competitor.website,
      logoUrl: competitor.logoUrl,
      isActive: competitor.isActive,
      frequency: competitor.frequency,
      createdAt: competitor.createdAt,
      pagesCount: competitor.pages.length,
      lastScrapedAt,
      pages: competitor.pages,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, website, logoUrl: providedLogoUrl, pages } = body as {
    name?: string;
    website?: string;
    logoUrl?: string;
    pages?: PageType[];
  };

  if (!name?.trim() || !website?.trim()) {
    return NextResponse.json(
      { error: "Name and website are required" },
      { status: 400 }
    );
  }

  if (!pages?.length) {
    return NextResponse.json(
      { error: "Select at least one page to track" },
      { status: 400 }
    );
  }

  const normalizedWebsite = website.trim().startsWith("http")
    ? website.trim()
    : `https://${website.trim()}`;

  const finalLogoUrl = providedLogoUrl?.trim() || buildLogoUrl(normalizedWebsite);

  const competitor = await prisma.competitor.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      website: normalizedWebsite,
      logoUrl: finalLogoUrl,
      pages: {
        create: pages.map((pageType) => ({
          pageType,
          url: buildPageUrl(normalizedWebsite, pageType),
        })),
      },
    },
    include: {
      pages: {
        select: {
          id: true,
          pageType: true,
          url: true,
          lastScrapedAt: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      id: competitor.id,
      name: competitor.name,
      website: competitor.website,
      logoUrl: competitor.logoUrl,
      isActive: competitor.isActive,
      frequency: competitor.frequency,
      createdAt: competitor.createdAt,
      pagesCount: competitor.pages.length,
      lastScrapedAt: null,
      pages: competitor.pages,
    },
    { status: 201 }
  );
}
