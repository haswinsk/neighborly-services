import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShieldCheck,
  CheckCircle,
  Camera,
  FileText,
  Video,
  UserPlus,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  BrainCircuit,
  Lock,
  Upload,
  Loader2
} from "lucide-react";

const SKILL_QUESTIONS: Record<string, { q: string; type: "textarea" | "select"; options?: string[] }[]> = {
  "AC Repair": [
    { q: "How do you diagnose a gas leak in a split AC?", type: "textarea" },
    { q: "What is your standard procedure for cleaning an indoor unit?", type: "textarea" }
  ],
  "Electrical": [
    { q: "Which gauge wire is appropriate for a 1.5 ton AC unit?", type: "select", options: ["1.0 sq mm", "1.5 sq mm", "2.5 sq mm", "4.0 sq mm"] },
    { q: "How do you identify a neutral fault in a domestic distribution board?", type: "textarea" }
  ],
  "Plumbing": [
    { q: "What is your approach to fixing a water leak?", type: "textarea" },
    { q: "How do you prevent pipe corrosion?", type: "textarea" }
  ],
};

const DEFAULT_QUESTIONS = [
  { q: "Briefly describe your process when starting a job.", type: "textarea" as const },
  { q: "How do you handle a customer who is unhappy with the service?", type: "textarea" as const }
];

const ProviderVerificationPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [skills, setSkills] = useState("");
  const [evidenceType, setEvidenceType] = useState<"work_photos" | "references" | "certificates" | "self_declaration" | "">("");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [assessmentAnswers, setAssessmentAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{ score: number; risk: string } | null>(null);

  // Auto-initialize assessment answers based on selected questions
  const questions = category && SKILL_QUESTIONS[category] ? SKILL_QUESTIONS[category] : DEFAULT_QUESTIONS;
  useEffect(() => {
    setAssessmentAnswers(new Array(questions.length).fill(""));
  }, [questions.length]);

  const nextStep = () => {
    if (step === 2 && !category) {
      toast({ title: "Please select a service category", variant: "destructive" });
      return;
    }
    if (step === 3 && !evidenceType) {
      toast({ title: "Please select an evidence type", variant: "destructive" });
      return;
    }
    setStep(Math.min(step + 1, 5));
  };

  const prevStep = () => setStep(Math.max(step - 1, 1));

  const handleSubmit = async () => {
    if (!category || !evidenceType || assessmentAnswers.some(a => !a.trim())) {
      toast({ title: "Please complete all fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.DEV ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL || "/api"}/verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            serviceCategory: category,
            skills: skills.split(",").map(s => s.trim()).filter(Boolean),
            experienceYears: Number(experienceYears) || 0,
            evidenceType,
            evidenceDescription,
            assessmentAnswers: assessmentAnswers.map(a => a.trim()).filter(Boolean),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit verification");
      }

      const data = await response.json();
      const verification = data.verification;

      setAssessmentResult({
        score: verification.aiConsistencyScore || 75,
        risk: verification.aiRiskLevel || "Low"
      });
      setSubmitted(true);

      // Refresh user to see if approval status changed
      await refreshUser();

      toast({ title: "Application submitted successfully!", description: "An admin will review your submission." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit verification";
      toast({ title: "Submission failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="rounded-2xl border bg-card p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Application Submitted!</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your profile is currently under review by our admin team. Our AI has completed the preliminary skill consistency check.
            </p>

            {assessmentResult && (
              <div className="bg-muted border rounded-lg p-4 inline-block text-left mb-4">
                <div className="flex items-center gap-2 text-foreground font-semibold mb-2">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  AI Preliminary Assessment
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Consistency Score:</div>
                  <div className="font-medium text-green-600">{assessmentResult.score}/100</div>
                  <div className="text-muted-foreground">Risk Level:</div>
                  <div className="font-medium">{assessmentResult.risk}</div>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              An administrator will review the AI report and your identity documents. Upon approval, you will enter the <strong>"Skill Verified"</strong> stage.
              <br />
              You will be notified once the review is complete.
            </p>

            <div className="pt-6">
              <Button onClick={() => navigate("/provider")}>Return to Dashboard</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Provider Verification</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build your Trust Score through our progressive verification system.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2 px-1">
            <span className={step >= 1 ? "text-primary" : ""}>Service</span>
            <span className={step >= 2 ? "text-primary" : ""}>Experience</span>
            <span className={step >= 3 ? "text-primary" : ""}>Evidence</span>
            <span className={step >= 4 ? "text-primary" : ""}>Skill Check</span>
            <span className={step >= 5 ? "text-primary" : ""}>Submit</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm">
          {/* Step 1: Service Category */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">What service do you provide?</h2>
                <p className="text-sm text-muted-foreground">Select your primary category. You can add more later if qualified.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["AC Repair", "Plumbing", "Electrical", "Carpentry", "Cleaning", "Painting", "Bike Puncture"].map(cat => (
                  <div
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`border rounded-lg p-4 cursor-pointer text-center transition-colors ${
                      category === cat ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium text-sm">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Tell us about your experience</h2>
                <p className="text-sm text-muted-foreground">This helps us verify your skill level.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Specific Skills (comma separated)</Label>
                  <Input
                    placeholder="e.g. Split AC, Window AC, Gas Refill"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Evidence Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">How do you want to prove your skills?</h2>
                <p className="text-sm text-muted-foreground">
                  We don't force everyone to have formal certificates. Choose what works for you.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { id: "certificates" as const, title: "Certificate", desc: "ITI, Diploma, or training", icon: ShieldCheck },
                  { id: "work_photos" as const, title: "Work Portfolio", desc: "Photos of past projects", icon: Camera },
                  { id: "references" as const, title: "References", desc: "Past customer contacts", icon: UserPlus },
                  { id: "self_declaration" as const, title: "Self Description", desc: "Written explanation", icon: FileText },
                ].map(type => (
                  <div
                    key={type.id}
                    onClick={() => setEvidenceType(type.id)}
                    className={`border rounded-xl p-4 cursor-pointer flex items-start gap-4 transition-all ${
                      evidenceType === type.id
                        ? "border-primary ring-1 ring-primary bg-primary/5"
                        : "hover:border-primary/50 hover:bg-accent/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${evidenceType === type.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{type.title}</h3>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {evidenceType && (
                <div className="border-t pt-5">
                  <Label>Additional Details</Label>
                  <Textarea
                    placeholder="Describe your evidence (e.g., file name, reference names, etc.)"
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Skill Assessment */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-600" />
                  Knowledge Check
                </h2>
                <p className="text-sm text-muted-foreground">
                  Answer a few scenario-based questions to verify your practical knowledge.
                </p>
              </div>

              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={idx} className="space-y-3 bg-muted border rounded-lg p-5">
                    <Label className="text-base font-medium">{q.q}</Label>
                    {q.type === "textarea" ? (
                      <Textarea
                        placeholder="Explain your approach in detail..."
                        value={assessmentAnswers[idx] || ""}
                        onChange={(e) => {
                          const newAnswers = [...assessmentAnswers];
                          newAnswers[idx] = e.target.value;
                          setAssessmentAnswers(newAnswers);
                        }}
                        className="min-h-[100px] bg-card"
                      />
                    ) : (
                      <div className="space-y-2 mt-3">
                        {q.options?.map(opt => (
                          <label key={opt} className="flex items-center gap-2 bg-card border p-3 rounded-md cursor-pointer hover:bg-muted">
                            <input
                              type="radio"
                              name={`q${idx}`}
                              value={opt}
                              checked={assessmentAnswers[idx] === opt}
                              onChange={(e) => {
                                const newAnswers = [...assessmentAnswers];
                                newAnswers[idx] = e.target.value;
                                setAssessmentAnswers(newAnswers);
                              }}
                              className="text-primary focus:ring-primary h-4 w-4"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Review & Submit</h2>
                <p className="text-sm text-muted-foreground">Confirm your details before submitting.</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-5 border space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Service Category</span>
                  <span className="font-medium text-sm">{category}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Experience</span>
                  <span className="font-medium text-sm">{experienceYears} years</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Evidence Type</span>
                  <span className="font-medium text-sm capitalize">{evidenceType.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Skill Assessment</span>
                  <span className="font-medium text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <span className="font-semibold text-blue-800 dark:text-blue-200 block mb-2">What happens next?</span>
                <ol className="list-decimal pl-5 space-y-1 mt-2 text-blue-700 dark:text-blue-300">
                  <li>Our AI will analyze your answers for technical consistency.</li>
                  <li>An admin will review the AI report and your evidence.</li>
                  <li>Upon approval, you will enter the <strong>"Skill Verified"</strong> stage.</li>
                  <li>Complete jobs successfully to reach <strong>"Performance Verified"</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t mt-8">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1 || submitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < 5 ? (
              <Button onClick={nextStep} disabled={submitting}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderVerificationPage;
