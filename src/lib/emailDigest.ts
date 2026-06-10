import Groq from "groq-sdk";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_for_build");

interface ChangeForDigest {
  id: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  detectedAt: Date;
  aiAnalysis: {
    what_changed: string;
    recommended_action: string;
  } | null;
  snapshot: {
    trackedPage: {
      pageType: string;
      competitor: {
        name: string;
        website: string;
        logoUrl: string | null;
      };
    };
  };
}

async function generateExecutiveSummary(
  changes: ChangeForDigest[]
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return `You have ${changes.length} competitor changes this week that require your attention.`;
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const changeList = changes
      .slice(0, 10)
      .map(
        (c) =>
          `- ${c.snapshot.trackedPage.competitor.name} (${c.urgency}): ${c.aiAnalysis?.what_changed ?? "change detected"}`
      )
      .join("\n");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are a competitive intelligence analyst. Write a concise 100-word executive summary of competitor activity for a weekly digest email. Be direct, strategic, and actionable. No bullet points — write in flowing prose.",
        },
        {
          role: "user",
          content: `Summarize these competitor changes in exactly ~100 words:\n\n${changeList}`,
        },
      ],
    });

    return (
      response.choices[0]?.message?.content?.trim() ??
      `You have ${changes.length} competitor changes this week.`
    );
  } catch {
    return `You have ${changes.length} competitor changes this week that require your attention.`;
  }
}

const URGENCY_COLOR: Record<string, string> = {
  HIGH: "#a63d2f",
  MEDIUM: "#c8956c",
  LOW: "#6b7c3f",
};

const URGENCY_BG: Record<string, string> = {
  HIGH: "#fdf0ee",
  MEDIUM: "#fdf5f0",
  LOW: "#f2f5ee",
};

function buildEmailHtml(params: {
  userName: string;
  changeCount: number;
  summary: string;
  changes: ChangeForDigest[];
}): string {
  const { userName, changeCount, summary, changes } = params;

  const changeRows = changes
    .map((change) => {
      const competitor = change.snapshot.trackedPage.competitor;
      const pageType = change.snapshot.trackedPage.pageType;
      const color = URGENCY_COLOR[change.urgency] ?? "#5c4a32";
      const bg = URGENCY_BG[change.urgency] ?? "#f5f0e8";

      const logoHtml = competitor.logoUrl
        ? `<img src="${competitor.logoUrl}" alt="${competitor.name}" width="32" height="32" style="border-radius:6px;object-fit:cover;" />`
        : `<div style="width:32px;height:32px;background:rgba(26,18,8,0.05);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#5c4a32;">${competitor.name.slice(0, 2).toUpperCase()}</div>`;

      return `
      <tr>
        <td style="padding:16px;border-bottom:1px solid rgba(26,18,8,0.08);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="40" valign="top">${logoHtml}</td>
              <td style="padding-left:12px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  <span style="font-size:14px;font-weight:600;color:#1a1208;">${competitor.name}</span>
                  <span style="font-size:11px;color:#5c4a32;background:rgba(26,18,8,0.05);padding:2px 8px;border-radius:99px;">${pageType}</span>
                  <span style="font-size:11px;font-weight:600;color:${color};background:${bg};padding:2px 8px;border-radius:99px;">${change.urgency}</span>
                </div>
                <p style="margin:0 0 6px;font-size:13px;color:#5c4a32;line-height:1.5;">
                  ${change.aiAnalysis?.what_changed ?? "A change was detected on this page."}
                </p>
                <p style="margin:0;font-size:12px;color:#9c8570;">
                  <strong style="color:#1a1208;">Action: </strong>${change.aiAnalysis?.recommended_action ?? "Review the change manually."}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PulseTrack Weekly Digest</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f0e8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1208;border-radius:12px 12px 0 0;padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:18px;font-weight:700;color:#f5f0e8;letter-spacing:-0.3px;">PulseTrack</span>
                    <div style="margin-top:4px;font-size:13px;color:#9c8570;">Weekly Competitor Intelligence</div>
                  </td>
                  <td align="right">
                    <span style="font-size:28px;font-weight:700;color:#f5f0e8;">${changeCount}</span>
                    <div style="font-size:11px;color:#9c8570;margin-top:2px;">changes this week</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1208;">Hi ${userName},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#5c4a32;line-height:1.7;">${summary}</p>

              <!-- Changes Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(26,18,8,0.08);border-radius:8px;overflow:hidden;">
                <thead>
                  <tr>
                    <th style="background:rgba(26,18,8,0.02);padding:12px 16px;text-align:left;font-size:11px;font-weight:600;color:#5c4a32;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(26,18,8,0.08);">
                      Competitor Changes
                    </th>
                  </tr>
                </thead>
                <tbody>${changeRows}</tbody>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f0e8;border-radius:0 0 12px 12px;padding:20px 32px;border-top:1px solid rgba(26,18,8,0.08);">
              <p style="margin:0;font-size:12px;color:#9c8570;text-align:center;">
                You're receiving this because weekly digest is enabled on your PulseTrack account.<br>
                <a href="#unsubscribe" style="color:#5c4a32;text-decoration:underline;">Unsubscribe</a> · 
                <a href="https://pulsetrack.app/dashboard/settings" style="color:#5c4a32;text-decoration:underline;">Manage preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWeeklyDigest(userId: string): Promise<void> {
  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, emailDigestEnabled: true },
  });

  if (!user?.email || !user.emailDigestEnabled) {
    console.log(`[emailDigest] Skipping digest for user ${userId} — disabled or no email`);
    return;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Fetch HIGH + MEDIUM urgency changes from last 7 days
  const changes = (await prisma.change.findMany({
    where: {
      urgency: { in: ["HIGH", "MEDIUM"] },
      detectedAt: { gte: sevenDaysAgo },
      snapshot: {
        trackedPage: {
          competitor: { userId },
        },
      },
    },
    include: {
      snapshot: {
        include: {
          trackedPage: {
            include: {
              competitor: {
                select: { name: true, website: true, logoUrl: true },
              },
            },
          },
        },
      },
    },
    orderBy: [{ urgency: "desc" }, { detectedAt: "desc" }],
    take: 20,
  })) as unknown as ChangeForDigest[];

  if (changes.length === 0) {
    console.log(`[emailDigest] No changes found for user ${userId}, skipping digest`);
    return;
  }

  const summary = await generateExecutiveSummary(changes);
  const userName = user.name ?? "there";

  const html = buildEmailHtml({
    userName,
    changeCount: changes.length,
    summary,
    changes,
  });

  const { error } = await resend.emails.send({
    from: "PulseTrack <onboarding@resend.dev>",
    to: user.email,
    subject: `PulseTrack Weekly: ${changes.length} competitor ${changes.length === 1 ? "change" : "changes"} this week`,
    html,
  });

  if (error) {
    console.error(`[emailDigest] Resend error for user ${userId}:`, error);
    throw new Error(`Failed to send digest email: ${error.message}`);
  }

  console.log(`[emailDigest] Sent digest to ${user.email} with ${changes.length} changes`);
}
