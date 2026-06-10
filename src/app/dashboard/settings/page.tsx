import type { Metadata } from "next";

import { SettingsClient } from "./settings-client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Settings — PulseTrack",
  description: "Manage your profile, notification preferences, and account settings.",
};

export default async function SettingsPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const userPrefs = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailDigestEnabled: true,
      digestFrequency: true,
      slackWebhookUrl: true,
    },
  });

  return (
    <SettingsClient
      user={{
        name: session!.user.name ?? null,
        email: session!.user.email ?? null,
        image: session!.user.image ?? null,
      }}
      prefs={{
        emailDigestEnabled: userPrefs?.emailDigestEnabled ?? true,
        digestFrequency: userPrefs?.digestFrequency ?? "weekly",
        slackWebhookUrl: userPrefs?.slackWebhookUrl ?? null,
      }}
    />
  );
}
