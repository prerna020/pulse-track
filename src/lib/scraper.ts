import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapeResult {
  html: string;
  cleanText: string;
  method: "cheerio" | "scrapingbee";
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

/**
 * Strategy 1: Fetch with axios + parse with cheerio.
 * Strips nav, footer, script, style, iframe elements and cleans whitespace.
 */
async function scrapeWithCheerio(url: string): Promise<ScrapeResult> {
  const response = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 15000,
    maxRedirects: 5,
  });

  const html: string = response.data as string;
  const $ = cheerio.load(html);

  // Remove noise elements
  $("nav, footer, script, style, iframe, noscript, header").remove();
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();

  // Extract body text
  const rawText = $("body").text();

  // Clean whitespace: collapse multiple spaces/newlines
  const cleanText = rawText
    .replace(/\t/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n")
    .trim();

  return { html, cleanText, method: "cheerio" };
}

/**
 * Strategy 2: ScrapingBee API fallback (render_js=false, body text extraction).
 */
async function scrapeWithScrapingBee(url: string): Promise<ScrapeResult> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) throw new Error("SCRAPINGBEE_API_KEY is not set");

  const extractRules = JSON.stringify({ text: { selector: "body", type: "list" } });

  const response = await axios.get("https://app.scrapingbee.com/api/v1/", {
    params: {
      api_key: apiKey,
      url,
      render_js: "false",
      extract_rules: extractRules,
    },
    timeout: 30000,
  });

  // ScrapingBee returns the extracted JSON when extract_rules is used
  const data = response.data as { text?: string[] };
  const rawTexts: string[] = Array.isArray(data?.text) ? data.text : [];

  const cleanText = rawTexts
    .join("\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n")
    .trim();

  // For rawHtml we re-fetch the page HTML via ScrapingBee without extract_rules
  let html = "";
  try {
    const htmlResponse = await axios.get("https://app.scrapingbee.com/api/v1/", {
      params: { api_key: apiKey, url, render_js: "false" },
      timeout: 30000,
    });
    html = typeof htmlResponse.data === "string" ? htmlResponse.data : "";
  } catch {
    html = "";
  }

  return { html, cleanText, method: "scrapingbee" };
}

/**
 * Scrape a URL using Cheerio first, falling back to ScrapingBee if the result
 * is less than 200 chars or if Cheerio throws.
 */
export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  let cheerioResult: ScrapeResult | null = null;

  try {
    cheerioResult = await scrapeWithCheerio(url);
  } catch (err) {
    console.warn(`[scraper] Cheerio failed for ${url}:`, err);
  }

  if (cheerioResult && hasSubstantialContent(cheerioResult.cleanText)) {
    return cheerioResult;
  }

  console.info(`[scraper] Falling back to ScrapingBee for ${url}`);
  return scrapeWithScrapingBee(url);
}

/**
 * Returns true if text has more than 200 characters of content.
 */
export function hasSubstantialContent(text: string): boolean {
  return text.trim().length > 200;
}
