export type UserRole = "customer" | "provider" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  avatar?: string;
  approved?: boolean;
  isAvailable?: boolean;
  bio?: string;
  experience?: string;
  serviceRadiusKm?: number;
  rating?: number;
}

export interface Service {
  id: string;
  serviceName: string;
  description: string;
  price: number;
  providerId: string;
  providerName: string;
  providerLocation: string;
  address?: string;
  city?: string;
  state?: string;
  category: string;
  rating: number;
  reviewCount: number;
  image?: string;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
}

export type BookingStatus = "Requested" | "Accepted" | "On The Way" | "Arrived" | "In Progress" | "CompletionRequested" | "Completed" | "Rejected";
export type PaymentStatus = "Pending" | "Completed";

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerLatitude?: number;
  customerLongitude?: number;
  customerCity?: string;
  providerId: string;
  providerName: string;
  providerPhone?: string;
  providerEmail?: string;
  providerLocation?: string;
  providerLatitude?: number;
  providerLongitude?: number;
  serviceId: string;
  serviceName: string;
  bookingDate: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  providerId: string;
  rating: number;
  comment: string;
  date: string;
  aiSentiment?: "positive" | "negative" | "neutral" | "mixed";
  aiTags?: string[];
  aiFlags?: string[];
}

export const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "AC Repair",
  "Cleaning",
  "Tutoring",
  "Painting",
  "Pest Control",
  "Bike Puncture",
  "Car Puncture",
  "Battery Jump Start",
  "Fuel Assistance",
  "Breakdown Repair",
  "Towing",
] as const;

// ── AI & Intelligence types ─────────────────────────────────────────────────

export interface TrustScoreBreakdown {
  total: number;           // 0-100
  identityVerification: number;   // 0-20
  skillVerification: number;      // 0-20
  servicePerformance: number;     // 0-20
  customerFeedback: number;       // 0-20
  reliability: number;            // 0-20
}

export interface MatchScoreReason {
  label: string;
  weight: number;   // e.g. 30 = 30% contribution
  score: number;    // 0-100 for this dimension
  detail: string;
}

export interface MatchScore {
  total: number;  // 0-100
  reasons: MatchScoreReason[];
}

export interface ProviderProfile extends User {
  trustScore: TrustScoreBreakdown;
  matchScore?: MatchScore;
  verificationStatus: "Unverified" | "Pending" | "SkillVerified" | "PerformanceVerified" | "Expert";
  jobsCompleted: number;
  responseTimeMinutes: number;
  specializationTags: string[];
  distanceKm?: number;
}

export interface AIQueryInterpretation {
  originalQuery: string;
  detectedServices: string[];
  detectedLocation?: string;
  urgency: "normal" | "urgent" | "emergency";
  language: "tamil" | "english" | "tanglish";
  confidence: number;
}

export interface AIRecommendation {
  query: AIQueryInterpretation;
  providers: ProviderProfile[];
  generatedAt: number;
}

// ── Verification types ──────────────────────────────────────────────────────

export type VerificationStageStatus = "pending" | "in_progress" | "completed" | "skipped";

export interface VerificationStage {
  id: string;
  step: number;
  title: string;
  description: string;
  status: VerificationStageStatus;
  fields?: VerificationField[];
}

export interface VerificationField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "file" | "radio";
  options?: string[];
  required: boolean;
  value?: string | string[];
  placeholder?: string;
}

export interface VerificationApplication {
  providerId: string;
  serviceCategory: string;
  skills: string[];
  experienceYears: number;
  evidenceType: "certificate" | "reference" | "portfolio" | "video" | "selfDescription";
  evidenceDescription: string;
  assessmentAnswers: Record<string, string>;
  aiConsistencyScore?: number;
  aiRiskLevel?: "low" | "medium" | "high";
  adminDecision?: "approved" | "rejected" | "pending" | "needs_evidence";
  submittedAt?: string;
}

// ── Performance types ───────────────────────────────────────────────────────

export interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  trendValue?: number;
}

export interface EarningsPeriod {
  period: string;
  earnings: number;
  jobs: number;
  avgRating: number;
}

// ── Demand & forecasting ────────────────────────────────────────────────────

export interface DemandForecast {
  category: string;
  currentDemand: number;   // bookings this week
  forecastedDemand: number; // next week prediction
  peakHours: string[];
  peakDays: string[];
  growthRate: number;      // % week-over-week
  hotZones: string[];
}

export interface DemandAlert {
  id: string;
  category: string;
  message: string;
  type: "opportunity" | "warning" | "info";
  area: string;
  timestamp: string;
}

// ── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "review" | "system" | "ai_alert";
  read: boolean;
  createdAt: string;
  link?: string;
}

// ── Emergency/On-Road ───────────────────────────────────────────────────────

export interface EmergencyRequest {
  id: string;
  customerId: string;
  customerName: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  status: "searching" | "provider_found" | "en_route" | "arrived" | "completed";
  providerId?: string;
  providerName?: string;
  createdAt: string;
}
