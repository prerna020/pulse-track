import Groq from "groq-sdk";

import type { Urgency } from "@/generated/prisma/client";

const SYSTEM_PROMPT = `You are a competitive intelligence analyst. Analyze competitor website changes and provide strategic insights. Always respond in valid JSON only, no other text.`;

export type AnalysisCategory =
  | "PRICING"
  | "MESSAGING"
  | "FEATURES"
  | "EXPANSION"
  | "OTHER";

export interface AIAnalysis {
  what_changed: string;
  why_it_happened: string;
  impact_on_you: string;
  recommended_action: string;
  urgency: Urgency;
  category: AnalysisCategory;
}

const FALLBACK_ANALYSIS: AIAnalysis = {
  what_changed: "A change was detected but AI analysis is unavailable.",
  why_it_happened: "Unable to determine strategic reasoning at this time.",
  impact_on_you: "Review the raw diff manually to assess impact.",
  recommended_action: "Visit the competitor page directly to inspect changes.",
  urgency: "LOW",
  category: "OTHER",
};

function parseAnalysis(raw: unknown): AIAnalysis {
  const data = raw as Record<string, unknown>;
  const urgency = String(data.urgency ?? "LOW").toUpperCase();
  const category = String(data.category ?? "OTHER").toUpperCase();

  return {
    what_changed: String(data.what_changed ?? FALLBACK_ANALYSIS.what_changed),
    why_it_happened: String(
      data.why_it_happened ?? FALLBACK_ANALYSIS.why_it_happened
    ),
    impact_on_you: String(
      data.impact_on_you ?? FALLBACK_ANALYSIS.impact_on_you
    ),
    recommended_action: String(
      data.recommended_action ?? FALLBACK_ANALYSIS.recommended_action
    ),
    urgency: (["LOW", "MEDIUM", "HIGH"].includes(urgency)
      ? urgency
      : "LOW") as Urgency,
    category: (
      ["PRICING", "MESSAGING", "FEATURES", "EXPANSION", "OTHER"].includes(
        category
      )
        ? category
        : "OTHER"
    ) as AnalysisCategory,
  };
}

export async function analyzeChange(params: {
  competitorName: string;
  pageType: string;
  added: string;
  removed: string;
}): Promise<AIAnalysis> {
  const { competitorName, pageType, added, removed } = params;

  if (!process.env.GROQ_API_KEY) {
    console.warn("[aiAnalyzer] GROQ_API_KEY not set, using fallback");
    return FALLBACK_ANALYSIS;
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const userPrompt = `Competitor: ${competitorName}
Page: ${pageType}
Added content: ${added.slice(0, 1000)}
Removed content: ${removed.slice(0, 1000)}

Respond with JSON:
{
  "what_changed": "string (1-2 sentences, what specifically changed)",
  "why_it_happened": "string (strategic reasoning)",
  "impact_on_you": "string (what this means for your product)",
  "recommended_action": "string (one specific action to take)",
  "urgency": "LOW" | "MEDIUM" | "HIGH",
  "category": "PRICING" | "MESSAGING" | "FEATURES" | "EXPANSION" | "OTHER"
}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return FALLBACK_ANALYSIS;
    }

    return parseAnalysis(JSON.parse(content));
  } catch (error) {
    console.error("[aiAnalyzer] Groq request failed:", error);
    return FALLBACK_ANALYSIS;
  }
}
