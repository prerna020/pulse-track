import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ unread: 0 });
  }

  const unread = await prisma.change.count({
    where: {
      isRead: false,
      snapshot: {
        trackedPage: {
          competitor: { userId: session.user.id },
        },
      },
    },
  });

  return NextResponse.json({ unread });
}
