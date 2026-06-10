import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mark all unread changes as read for this user
  await prisma.change.updateMany({
    where: {
      isRead: false,
      snapshot: {
        trackedPage: {
          competitor: { userId: session.user.id },
        },
      },
    },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
