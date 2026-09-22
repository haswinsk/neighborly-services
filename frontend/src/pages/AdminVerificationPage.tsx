import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { EmptyState } from "@/components/customer/CustomerUI";

interface VerificationApplication {
  id: string;
  providerId: string;
  provider?: { name: string; email: string; phone: string };
  serviceCategory: string;
  skills: string[];
  experienceYears: number;
  evidenceType: string;
  evidenceDescription: string;
  assessmentAnswers: string[];
  aiConsistencyScore?: number;
  aiRiskLevel?: string;
  aiFlags?: string[];
  adminDecision: "pending" | "approved" | "rejected" | "needs_evidence";
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

const AdminVerificationPage = () => {
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ verifications: VerificationApplication[] }>("/verification/pending");
      setApplications(res.verifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (id: string, decision: "approved" | "rejected" | "needs_evidence") => {
    setDecidingId(id);
    try {
      const res = await apiRequest<{ verification: VerificationApplication }>(`/verification/${id}/decision`, {
        method: "PATCH",
        body: JSON.stringify({
          decision,
          notes: decisionNotes[id] || "",
        }),
      });

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, adminDecision: decision } : app))
      );
      setDecisionNotes((prev) => {
        const newNotes = { ...prev };
        delete newNotes[id];
        return newNotes;
      });
      setExpandedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to make decision");
    } finally {
      setDecidingId(null);
    }
  };

  const pendingCount = applications.filter((a) => a.adminDecision === "pending").length;
  const approvedCount = applications.filter((a) => a.adminDecision === "approved").length;
  const rejectedCount = applications.filter((a) => a.adminDecision === "rejected").length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading verification queue…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load verification queue"
          description={error}
          action={{
            label: "Retry",
            onClick: loadApplications,
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Provider Verification Queue</h1>
            <p className="text-muted-foreground mt-1">
              Review AI-analyzed applications and approve/reject new providers.
            </p>
          </div>
          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
            {pendingCount} Pending Review
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-500 dark:text-orange-400" />
              <span className="text-sm font-medium text-muted-foreground">Pending</span>
            </div>
            <span className="text-2xl font-bold">{pendingCount}</span>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span className="text-sm font-medium text-muted-foreground">Approved</span>
            </div>
            <span className="text-2xl font-bold">{approvedCount}</span>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
              <span className="text-sm font-medium text-muted-foreground">Rejected</span>
            </div>
            <span className="text-2xl font-bold">{rejectedCount}</span>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span className="text-sm font-medium text-muted-foreground">Avg AI Score</span>
            </div>
            <span className="text-2xl font-bold">
              {applications.length > 0
                ? Math.round(
                    applications.reduce((sum, app) => sum + (app.aiConsistencyScore || 0), 0) / applications.length
                  )
                : 0}
            </span>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No pending applications"
            description="New provider verification requests will appear here."
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const isExpanded = expandedId === app.id;
              const riskColor =
                app.aiRiskLevel === "low"
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                  : app.aiRiskLevel === "medium"
                  ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                  : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";

              const scoreColor =
                (app.aiConsistencyScore || 0) >= 80
                  ? "text-green-600 dark:text-green-400"
                  : (app.aiConsistencyScore || 0) >= 60
                  ? "text-orange-600"
                  : "text-red-600 dark:text-red-400";

              return (
                <div key={app.id} className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-foreground">
                          {app.provider?.name || "Provider"}
                        </h3>
                        <Badge variant="secondary">{app.serviceCategory}</Badge>
                        {app.adminDecision === "pending" ? (
                          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        ) : app.adminDecision === "approved" ? (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        ) : app.adminDecision === "rejected" ? (
                          <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Needs Evidence
                          </Badge>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="font-medium ml-1">{app.experienceYears} years</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Evidence:</span>
                          <span className="font-medium ml-1 capitalize">{app.evidenceType.replace(/_/g, " ")}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Submitted:</span>
                          <span className="font-medium ml-1">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* AI Assessment */}
                      <div className="flex items-center gap-4 p-3 bg-muted border rounded-lg flex-wrap">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-semibold text-foreground">AI Assessment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Consistency:</span>
                          <span className={`text-sm font-bold ${scoreColor}`}>
                            {app.aiConsistencyScore || 0}/100
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Risk:</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${riskColor}`}>
                            {(app.aiRiskLevel || "LOW").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {app.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* AI Flags */}
                      {app.aiFlags && app.aiFlags.length > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-semibold text-amber-800 block mb-1">AI Flags:</span>
                              <ul className="list-disc pl-5 text-amber-700 space-y-1">
                                {app.aiFlags.map((flag) => (
                                  <li key={flag}>{flag}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Evidence */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          Evidence Provided
                        </h4>
                        <div className="p-3 bg-muted/30 rounded-lg border text-sm">
                          {app.evidenceDescription || "(No description provided)"}
                        </div>
                      </div>

                      {/* Admin Decision Panel */}
                      {app.adminDecision === "pending" && (
                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                          <h4 className="text-sm font-semibold">Admin Decision</h4>
                          <Textarea
                            placeholder="Optional notes (visible to provider if rejected)"
                            value={decisionNotes[app.id] || ""}
                            onChange={(e) =>
                              setDecisionNotes((prev) => ({ ...prev, [app.id]: e.target.value }))
                            }
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleDecision(app.id, "approved")}
                              disabled={decidingId === app.id}
                            >
                              {decidingId === app.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDecision(app.id, "needs_evidence")}
                              disabled={decidingId === app.id}
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Request More Evidence
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDecision(app.id, "rejected")}
                              disabled={decidingId === app.id}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {app.adminDecision === "approved" && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-200">
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          Approved on {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : "unknown date"}.
                          Provider has been notified and can now list services on the marketplace.
                        </div>
                      )}

                      {app.adminDecision === "rejected" && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
                          <XCircle className="w-4 h-4 inline mr-2" />
                          Rejected on {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : "unknown date"}.
                          {app.adminNotes && (
                            <p className="mt-2 italic">{app.adminNotes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminVerificationPage;
