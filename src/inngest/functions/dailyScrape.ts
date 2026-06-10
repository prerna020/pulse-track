import { analyzeChange } from "@/lib/aiAnalyzer";
import { detectChanges } from "@/lib/changeDetector";
import { prisma } from "@/lib/prisma";
import { scrapeUrl } from "@/lib/scraper";
import { inngest } from "../client";

export const dailyScrape = inngest.createFunction(
  {
    id: "daily-competitor-scrape",
    name: "Daily Competitor Scrape",
    triggers: [
      { cron: "0 9 * * *" },
      { event: "daily.scrape" }
    ],
  },
  async ({ step }) => {
    // Step 1: fetch all tracked pages for active competitors with latest snapshot
    const pages = await step.run("fetch-active-pages", async () => {
      return prisma.trackedPage.findMany({
        where: {
          competitor: { isActive: true },
        },
        include: {
          competitor: { select: { id: true, name: true, userId: true } },
          snapshots: {
            orderBy: { scrapedAt: "desc" },
            take: 1,
            select: { id: true, cleanText: true },
          },
        },
      });
    });

    let pagesScraped = 0;
    let changesDetected = 0;

    // Step 2: process in batches of 3 to respect rate limits
    const BATCH_SIZE = 3;
    for (let i = 0; i < pages.length; i += BATCH_SIZE) {
      const batch = pages.slice(i, i + BATCH_SIZE);
      const batchIndex = Math.floor(i / BATCH_SIZE);

      const batchResults = await step.run(
        `process-batch-${batchIndex}`,
        async () => {
          let batchScraped = 0;
          let batchChanges = 0;

          await Promise.all(
            batch.map(async (page) => {
              try {
                // Scrape the URL
                const { html, cleanText } = await scrapeUrl(page.url);

                // Create new snapshot
                const snapshot = await prisma.snapshot.create({
                  data: {
                    trackedPageId: page.id,
                    rawHtml: html,
                    cleanText,
                  },
                });

                await prisma.trackedPage.update({
                  where: { id: page.id },
                  data: { lastScrapedAt: new Date() },
                });

                batchScraped++;

                // Detect changes vs previous snapshot
                const previousSnapshot = page.snapshots[0];
                if (previousSnapshot) {
                  const changeResult = detectChanges(
                    previousSnapshot.cleanText,
                    cleanText
                  );

                  if (changeResult) {
                    // AI analysis
                    const aiAnalysis = await analyzeChange({
                      competitorName: page.competitor.name,
                      pageType: page.pageType,
                      added: changeResult.added,
                      removed: changeResult.removed,
                    });

                    // Save Change record
                    await prisma.change.create({
                      data: {
                        snapshotId: snapshot.id,
                        diffText: changeResult.diffText,
                        aiAnalysis: { ...aiAnalysis },
                        urgency: aiAnalysis.urgency,
                        isRead: false,
                      },
                    });

                    batchChanges++;
                  }
                }
              } catch (err) {
                console.error(
                  `[dailyScrape] Failed to scrape page ${page.id} (${page.url}):`,
                  err
                );
              }
            })
          );

          return { batchScraped, batchChanges };
        }
      );

      pagesScraped += batchResults.batchScraped;
      changesDetected += batchResults.batchChanges;
    }

    return { pagesScraped, changesDetected };
  }
);
