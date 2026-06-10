import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const change = await prisma.change.findFirst({
    where: {
      id,
      snapshot: {
        trackedPage: {
          competitor: { userId: session.user.id },
        },
      },
    },
  });

  if (!change) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.change.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
