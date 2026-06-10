import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function getOwnedCompetitor(id: string, userId: string) {
  return prisma.competitor.findFirst({
    where: { id, userId },
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
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedCompetitor(id, session.user.id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { isActive, name } = body as {
    isActive?: boolean;
    name?: string;
  };

  const competitor = await prisma.competitor.update({
    where: { id },
    data: {
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(name?.trim() ? { name: name.trim() } : {}),
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

  const lastScrapedAt = competitor.pages.reduce<Date | null>((latest, page) => {
    if (!page.lastScrapedAt) return latest;
    if (!latest || page.lastScrapedAt > latest) return page.lastScrapedAt;
    return latest;
  }, null);

  return NextResponse.json({
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
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedCompetitor(id, session.user.id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.competitor.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
