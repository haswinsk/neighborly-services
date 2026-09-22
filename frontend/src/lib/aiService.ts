/**
 * AI Service Layer for Neighbourly Services
 *
 * Mock implementations of all AI/ML capabilities.
 * In production these would call real ML endpoints.
 * The abstraction keeps the UI identical whether real or mock.
 */

import type {
  AIQueryInterpretation,
  AIRecommendation,
  ProviderProfile,
  DemandForecast,
  DemandAlert,
  Review,
} from "@/types";
import { mockProviders, mockDemandForecasts, mockDemandAlerts } from "@/data/mockData";

// ── NL Query Analysis ───────────────────────────────────────────────────────

const TAMIL_KEYWORDS: Record<string, string[]> = {
  "AC Repair":        ["ac", "a.c", "air condition", "cool", "panniruken", "aagala", "kudukuthu"],
  "Plumbing":         ["water", "leak", "pipe", "taps", "basin", "neer", "kaaluve", "leakage"],
  "Electrical":       ["current", "light", "switch", "fan", "wiring", "short circuit", "shock"],
  "Carpentry":        ["wood", "door", "window", "furniture", "almarai", "table", "chair"],
  "Cleaning":         ["clean", "sweep", "mop", "dust", "dirty", "vazhikku"],
  "Painting":         ["paint", "colour", "color", "wall", "suvaru"],
  "Pest Control":     ["rat", "cockroach", "lizard", "pest", "insect", "elli"],
  "Bike Puncture":    ["bike", "puncture", "tyre", "cycle"],
  "Car Puncture":     ["car", "flat tyre", "puncture"],
  "Battery Jump Start":["battery", "dead", "start pannala", "start aguthu illa"],
  "Fuel Assistance":  ["fuel", "petrol", "diesel", "empty tank"],
  "Breakdown Repair": ["breakdown", "road side", "stuck"],
  "Towing":           ["tow", "towing", "drag"],
};

const URGENCY_KEYWORDS = {
  emergency: ["emergency", "urgent", "asap", "now", "help me", "stuck", "breakdown", "on road", "road side", "panniruken", "aagala"],
  urgent: ["quick", "fast", "soon", "today", "inniki"],
};

function detectLanguage(query: string): AIQueryInterpretation["language"] {
  const tamilWords = ["panniruken", "aagala", "kudukuthu", "neer", "inniki", "suvaru", "elli", "kaaluve"];
  const lower = query.toLowerCase();
  const hasTamil = tamilWords.some(w => lower.includes(w));
  const hasEnglish = /[a-z]/.test(lower);
  if (hasTamil && hasEnglish) return "tanglish";
  if (hasTamil) return "tamil";
  return "english";
}

function detectUrgency(query: string): AIQueryInterpretation["urgency"] {
  const lower = query.toLowerCase();
  if (URGENCY_KEYWORDS.emergency.some(k => lower.includes(k))) return "emergency";
  if (URGENCY_KEYWORDS.urgent.some(k => lower.includes(k))) return "urgent";
  return "normal";
}

export function analyzeNLQuery(query: string): AIQueryInterpretation {
  const lower = query.toLowerCase();
  const detectedServices: string[] = [];

  for (const [service, keywords] of Object.entries(TAMIL_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      detectedServices.push(service);
    }
  }

  // Location extraction: look for "near <place>" or "in <place>"
  const locationMatch = query.match(/(?:near|in|at|from)\s+([A-Za-z\s]+?)(?:\s|,|$)/i);
  const detectedLocation = locationMatch ? locationMatch[1].trim() : undefined;

  return {
    originalQuery: query,
    detectedServices: detectedServices.length > 0 ? detectedServices : ["General Service"],
    detectedLocation,
    urgency: detectUrgency(query),
    language: detectLanguage(query),
    confidence: detectedServices.length > 0 ? 0.87 : 0.45,
  };
}

// ── Provider ranking / Match Score ──────────────────────────────────────────

export function rankProviders(
  providers: ProviderProfile[],
  category: string,
  urgency: AIQueryInterpretation["urgency"] = "normal"
): ProviderProfile[] {
  return providers
    .filter(p => p.specializationTags?.some(t => t.toLowerCase().includes(category.toLowerCase())) ||
                 p.verificationStatus !== "Unverified")
    .map(p => {
      // Score components (0-100 each)
      const trustComponent  = p.trustScore.total;
      const ratingComponent = ((p.rating ?? 0) / 5) * 100;
      const jobsComponent   = Math.min((p.jobsCompleted ?? 0) / 100, 1) * 100;
      const distComponent   = p.distanceKm != null
        ? Math.max(0, 100 - p.distanceKm * 5)
        : 60;
      const responseComp    = Math.max(0, 100 - (p.responseTimeMinutes ?? 30) * 2);

      // Urgency boost: distance matters more for emergency
      const distWeight  = urgency === "emergency" ? 0.35 : 0.20;
      const trustWeight = 0.25;
      const ratingWeight = 0.20;
      const jobsWeight  = 0.10;
      const respWeight  = urgency === "emergency" ? 0.10 : 0.25;

      const total = Math.round(
        trustComponent  * trustWeight +
        ratingComponent * ratingWeight +
        jobsComponent   * jobsWeight +
        distComponent   * distWeight +
        responseComp    * respWeight
      );

      return {
        ...p,
        matchScore: {
          total,
          reasons: [
            {
              label: "Trust Score",
              weight: Math.round(trustWeight * 100),
              score: trustComponent,
              detail: `${p.trustScore.total}/100 verified across 5 dimensions`,
            },
            {
              label: "Customer Rating",
              weight: Math.round(ratingWeight * 100),
              score: Math.round(ratingComponent),
              detail: `${(p.rating ?? 0).toFixed(1)} ★ from ${p.jobsCompleted ?? 0} jobs`,
            },
            {
              label: "Proximity",
              weight: Math.round(distWeight * 100),
              score: Math.round(distComponent),
              detail: p.distanceKm != null ? `${p.distanceKm.toFixed(1)} km away` : "Location estimated",
            },
            {
              label: "Response Speed",
              weight: Math.round(respWeight * 100),
              score: Math.round(responseComp),
              detail: `Avg ${p.responseTimeMinutes ?? 30} min response time`,
            },
            {
              label: "Experience",
              weight: Math.round(jobsWeight * 100),
              score: Math.round(jobsComponent),
              detail: `${p.jobsCompleted ?? 0} jobs completed`,
            },
          ],
        },
      } as ProviderProfile;
    })
    .sort((a, b) => (b.matchScore?.total ?? 0) - (a.matchScore?.total ?? 0));
}

export async function getAIRecommendations(query: string): Promise<AIRecommendation> {
  await new Promise(r => setTimeout(r, 600)); // simulate latency
  const interpretation = analyzeNLQuery(query);
  const category = interpretation.detectedServices[0] ?? "General Service";
  const ranked = rankProviders(mockProviders, category, interpretation.urgency);
  return {
    query: interpretation,
    providers: ranked.slice(0, 6),
    generatedAt: Date.now(),
  };
}

// ── Review Intelligence ─────────────────────────────────────────────────────

const SENTIMENT_POSITIVE = ["great", "excellent", "amazing", "quick", "professional", "helpful", "honest", "thorough", "clean", "brilliant"];
const SENTIMENT_NEGATIVE  = ["bad", "late", "slow", "rude", "overpriced", "unprofessional", "broke", "damaged", "missing", "wrong"];
const TAGS_MAP: Record<string, string[]> = {
  punctuality: ["on time", "late", "early", "quick", "fast", "slow", "delayed"],
  quality:     ["quality", "good work", "excellent", "professional", "thorough", "clean"],
  pricing:     ["price", "expensive", "cheap", "reasonable", "overpriced", "worth"],
  communication: ["called", "message", "responsive", "helpful", "explained"],
  safety:      ["safe", "careful", "damage", "broke", "accident"],
};

export function analyzeReview(review: Pick<Review, "rating" | "comment">): Pick<Review, "aiSentiment" | "aiTags" | "aiFlags"> {
  const lower = review.comment.toLowerCase();
  const posCount = SENTIMENT_POSITIVE.filter(w => lower.includes(w)).length;
  const negCount = SENTIMENT_NEGATIVE.filter(w => lower.includes(w)).length;

  let aiSentiment: Review["aiSentiment"];
  if (posCount > 0 && negCount > 0) aiSentiment = "mixed";
  else if (posCount > negCount) aiSentiment = "positive";
  else if (negCount > posCount) aiSentiment = "negative";
  else aiSentiment = review.rating >= 3 ? "positive" : "negative";

  const aiTags: string[] = [];
  for (const [tag, keywords] of Object.entries(TAGS_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) aiTags.push(tag);
  }

  const aiFlags: string[] = [];
  if (review.rating <= 2 && negCount > 1) aiFlags.push("low_rating_negative_text");
  if (review.rating >= 5 && negCount > 0) aiFlags.push("rating_text_mismatch");
  if (review.comment.length < 10) aiFlags.push("very_short_review");

  return { aiSentiment, aiTags, aiFlags };
}

// ── Demand forecasting ──────────────────────────────────────────────────────

export function getDemandForecasts(): DemandForecast[] {
  return mockDemandForecasts;
}

export function getDemandAlerts(): DemandAlert[] {
  return mockDemandAlerts;
}

// ── Provider Verification AI ────────────────────────────────────────────────

export function analyzeVerification(
  skills: string[],
  experienceYears: number,
  assessmentAnswers: Record<string, string>
): { consistencyScore: number; riskLevel: "low" | "medium" | "high"; flags: string[] } {
  const flags: string[] = [];
  let deductions = 0;

  // Basic consistency checks
  if (experienceYears > 20) { flags.push("unusually_high_experience"); deductions += 10; }
  if (skills.length > 8)    { flags.push("too_many_skills_claimed"); deductions += 5; }

  // Check if answers are too short / generic
  const shortAnswers = Object.values(assessmentAnswers).filter(a => a && a.length < 20).length;
  if (shortAnswers > 1) { flags.push("short_assessment_answers"); deductions += 10; }

  const consistencyScore = Math.max(0, 85 - deductions);
  const riskLevel =
    consistencyScore >= 75 ? "low" :
    consistencyScore >= 55 ? "medium" : "high";

  return { consistencyScore, riskLevel, flags };
}
