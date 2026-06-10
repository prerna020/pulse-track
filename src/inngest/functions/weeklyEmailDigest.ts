import { sendWeeklyDigest } from "@/lib/emailDigest";
import { prisma } from "@/lib/prisma";
import { inngest } from "../client";

export const weeklyEmailDigest = inngest.createFunction(
  {
    id: "weekly-email-digest",
    name: "Weekly Email Digest",
    triggers: [
      { cron: "0 8 * * 1" }, // Monday 8am
      { event: "weekly.digest" }
    ],
  },
  async ({ step }) => {
    // Fetch all users with email digest enabled
    const users = await step.run("fetch-digest-users", async () => {
      return prisma.user.findMany({
        where: { emailDigestEnabled: true, email: { not: null } },
        select: { id: true, email: true },
      });
    });

    let sent = 0;
    let failed = 0;

    // Send digest for each user
    for (const user of users) {
      try {
        await step.run(`send-digest-${user.id}`, async () => {
          await sendWeeklyDigest(user.id);
        });
        sent++;
      } catch (err) {
        console.error(`[weeklyEmailDigest] Failed for user ${user.id}:`, err);
        failed++;
      }
    }

    return { totalUsers: users.length, sent, failed };
  }
);
