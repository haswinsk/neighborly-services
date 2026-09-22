import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Brain, MapPin, Star, Clock, ShieldCheck, Search, Zap,
  TrendingUp, Award, ChevronRight, Sparkles, AlertTriangle,
  CheckCircle, Info, Loader2
} from "lucide-react";
import type { AIRecommendation, ProviderProfile } from "@/types";
import { getAIRecommendations } from "@/lib/aiService";

// ── Match Score Ring ─────────────────────────────────────────────────────────

function MatchRing({ score, size = 64 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#3b82f6" : "#f59e0b";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={8} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={8} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-sm font-bold"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

// ── Trust Bar ────────────────────────────────────────────────────────────────

function TrustBar({ label, value, max = 20 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Verification Badge ───────────────────────────────────────────────────────

function VerifBadge({ status }: { status: ProviderProfile["verificationStatus"] }) {
  const map: Record<ProviderProfile["verificationStatus"], { label: string; className: string }> = {
    Unverified:          { label: "Unverified",           className: "bg-muted text-muted-foreground" },
    Pending:             { label: "Pending Review",       className: "bg-yellow-100 text-yellow-700" },
    SkillVerified:       { label: "Skill Verified",       className: "bg-blue-100 text-blue-700" },
    PerformanceVerified: { label: "Performance Verified", className: "bg-green-100 text-green-700" },
    Expert:              { label: "Expert",               className: "bg-purple-100 text-purple-800" },
  };
  const { label, className } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      <ShieldCheck className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Provider Card ────────────────────────────────────────────────────────────

function ProviderCard({ provider, rank, onBook }: {
  provider: ProviderProfile;
  rank: number;
  onBook: (p: ProviderProfile) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const score = provider.matchScore?.total ?? 0;

  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm transition-all ${rank === 1 ? "border-green-300 ring-1 ring-green-100" : ""}`}>
      {rank === 1 && (
        <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-green-700">
          <Sparkles className="w-3.5 h-3.5" />
          Best Match for your request
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar + Match Ring */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
            {provider.name[0]}
          </div>
          <div className="absolute -bottom-2 -right-2">
            <MatchRing score={score} size={36} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{provider.name}</h3>
            <VerifBadge status={provider.verificationStatus} />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {(provider.rating ?? 0).toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {provider.distanceKm != null ? `${provider.distanceKm.toFixed(1)} km` : "Nearby"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{provider.responseTimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {provider.jobsCompleted} jobs
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{provider.bio}</p>

          {/* Skill tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {provider.specializationTags.slice(0, 3).map(t => (
              <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{t}</span>
            ))}
          </div>
        </div>

        {/* Trust score */}
        <div className="hidden sm:flex flex-col items-center shrink-0">
          <span className="text-xs text-muted-foreground">Trust</span>
          <span className="text-2xl font-bold text-foreground">{provider.trustScore.total}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Expandable AI Reasoning */}
      <div className="mt-4 border-t pt-3">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Brain className="w-3.5 h-3.5" />
          {expanded ? "Hide" : "Why this match?"} — Match Score {score}/100
          <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>

        {expanded && provider.matchScore && (
          <div className="mt-3 space-y-3">
            {/* Match score reasons */}
            <div className="grid gap-2">
              {provider.matchScore.reasons.map(r => (
                <div key={r.label} className="flex items-center gap-3">
                  <div className="w-24 shrink-0 text-xs text-muted-foreground">{r.label}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${r.score}%` }} />
                  </div>
                  <div className="w-6 text-xs font-medium text-right">{r.score}</div>
                  <div className="text-xs text-muted-foreground hidden md:block">{r.detail}</div>
                </div>
              ))}
            </div>

            {/* Trust breakdown */}
            <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-foreground mb-2">Trust Score Breakdown</p>
              <TrustBar label="Identity Verification" value={provider.trustScore.identityVerification} />
              <TrustBar label="Skill Verification" value={provider.trustScore.skillVerification} />
              <TrustBar label="Service Performance" value={provider.trustScore.servicePerformance} />
              <TrustBar label="Customer Feedback" value={provider.trustScore.customerFeedback} />
              <TrustBar label="Reliability" value={provider.trustScore.reliability} />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => onBook(provider)}>
          Book Now
        </Button>
        <Button size="sm" variant="outline">View Profile</Button>
      </div>
    </div>
  );
}

// ── Query Interpretation Banner ──────────────────────────────────────────────

function QueryInterpretBanner({ rec }: { rec: AIRecommendation }) {
  const { query } = rec;
  const urgencyColor = query.urgency === "emergency"
    ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
    : query.urgency === "urgent"
    ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
    : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";

  return (
    <div className={`rounded-xl border p-4 ${urgencyColor}`}>
      <div className="flex items-start gap-3">
        <Brain className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">AI understood your request</span>
            <span className="text-xs text-muted-foreground">({Math.round(query.confidence * 100)}% confidence)</span>
            {query.language !== "english" && (
              <Badge variant="secondary" className="text-xs">
                {query.language === "tanglish" ? "Tanglish detected" : "Tamil detected"}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-muted-foreground">Services identified:</span>
            {query.detectedServices.map(s => (
              <span key={s} className="font-medium text-foreground flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                {s}
              </span>
            ))}
          </div>

          {query.detectedLocation && (
            <div className="flex items-center gap-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{query.detectedLocation}</span>
            </div>
          )}

          {query.urgency !== "normal" && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-red-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              {query.urgency === "emergency" ? "Emergency — nearest providers prioritized" : "Urgent request — fast responders ranked first"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

const AIRecommendationsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(false);
  const [rec, setRec] = useState<AIRecommendation | null>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const result = await getAIRecommendations(q);
      setRec(result);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run if query in URL
  useEffect(() => {
    if (query) runSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleBook = (provider: ProviderProfile) => {
    navigate(`/services?provider=${provider.id}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">AI Provider Match</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Describe what you need in plain language — even in Tamil or Tanglish. We'll find the right provider, not just any provider.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='e.g. "AC panniruken but room cool aagala, leak also" or "pipe burst emergency near RS Puram"'
              className="pl-9 pr-4 h-11"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 px-5">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span className="ml-2 hidden sm:inline">Find Match</span>
          </Button>
        </form>

        {/* Example queries */}
        {!rec && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "AC panniruken but room cool aagala, water leak aaguthu",
                "Bike puncture near Gandhipuram, urgent",
                "Electrical board short circuit help now",
                "Deep house cleaning this Saturday",
              ].map(ex => (
                <button
                  key={ex}
                  onClick={() => { setQuery(ex); runSearch(ex); }}
                  className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="relative">
              <Brain className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-foreground">Analysing your request…</p>
              <p className="text-sm text-muted-foreground">Ranking providers by Trust Score, distance, and response speed</p>
            </div>
          </div>
        )}

        {/* Results */}
        {rec && !loading && (
          <div className="space-y-4">
            {/* AI interpretation */}
            <QueryInterpretBanner rec={rec} />

            {/* Stats row */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {rec.providers.length} providers ranked for you
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5" />
                Sorted by Match Score
              </div>
            </div>

            {/* Provider cards */}
            <div className="space-y-4">
              {rec.providers.map((provider, idx) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  rank={idx + 1}
                  onBook={handleBook}
                />
              ))}
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Match Score combines Trust Score, distance, response time, rating, and job history.
              Providers without formal certificates can still rank high based on skill verification and performance track record.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIRecommendationsPage;
