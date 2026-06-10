import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      emailDigestEnabled: true,
      digestFrequency: true,
      slackWebhookUrl: true,
    },
  });

  return NextResponse.json(user ?? {});
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    emailDigestEnabled?: boolean;
    digestFrequency?: string;
    slackWebhookUrl?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(body.emailDigestEnabled !== undefined && {
        emailDigestEnabled: body.emailDigestEnabled,
      }),
      ...(body.digestFrequency !== undefined && {
        digestFrequency: body.digestFrequency,
      }),
      ...(body.slackWebhookUrl !== undefined && {
        slackWebhookUrl: body.slackWebhookUrl,
      }),
    },
    select: {
      emailDigestEnabled: true,
      digestFrequency: true,
      slackWebhookUrl: true,
    },
  });

  return NextResponse.json(updated);
}
