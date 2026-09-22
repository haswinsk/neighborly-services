import express from "express";
import prisma from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createPublicId } from "../utils/id.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { assertRequiredString, assertEnum } from "../middleware/validation.js";

const router = express.Router();

// Deterministic AI consistency/risk analysis — no external API, never auto-approves
const analyzeVerification = (evidenceType, skills, experienceYears, assessmentAnswers) => {
  // Consistency score based on claim details
  let consistencyScore = 50; // baseline

  if (experienceYears > 5) consistencyScore += 15;
  if (experienceYears > 10) consistencyScore += 10;
  if (skills.length >= 3) consistencyScore += 10;
  if (evidenceType === "work_photos") consistencyScore += 15;
  if (evidenceType === "certificates") consistencyScore += 10;
  if (evidenceType === "self_declaration") consistencyScore -= 5;

  // Risk level based on flags
  const flags = [];
  let riskLevel = "low";

  if (evidenceType === "self_declaration" && experienceYears < 1) {
    flags.push("self_declaration_with_low_experience");
    riskLevel = "medium";
  }
  if (skills.includes("Electrical") || skills.includes("Plumbing")) {
    if (evidenceType !== "certificates" && experienceYears < 3) {
      flags.push("safety_critical_skill_insufficient_evidence");
      riskLevel = "high";
    }
  }
  if (experienceYears > 20) {
    flags.push("high_experience_claims"); // not a problem, just a note for admin
  }
  if (assessmentAnswers.some((ans) => ans.toLowerCase().includes("not sure") || ans.toLowerCase().includes("don't know"))) {
    flags.push("uncertain_scenario_answers");
    riskLevel = "medium";
  }

  consistencyScore = Math.max(0, Math.min(100, consistencyScore));

  return { consistencyScore, riskLevel, flags };
};

// GET /api/verification/my — provider's own verification applications
router.get("/my", requireAuth, requireRole("provider"), asyncHandler(async (req, res) => {
  const verifications = await prisma.providerVerification.findMany({
    where: { providerId: req.user.id },
    orderBy: { submittedAt: "desc" },
  });
  return res.json({ verifications: verifications.map(sanitizeDoc) });
}));

// POST /api/verification — submit a new verification application
router.post("/", requireAuth, requireRole("provider"), asyncHandler(async (req, res) => {
  const { serviceCategory, skills, experienceYears, evidenceType, evidenceDescription, assessmentAnswers } = req.body;

  const normalizedCategory = assertRequiredString(serviceCategory, "Service category");
  const normalizedEvidenceType = assertEnum(evidenceType, ["work_photos", "references", "certificates", "self_declaration"], "Evidence type");

  if (!Array.isArray(skills) || skills.length === 0) {
    throw new ApiError(400, "Skills must be a non-empty array");
  }
  if (!Array.isArray(assessmentAnswers) || assessmentAnswers.length === 0) {
    throw new ApiError(400, "Assessment answers must be a non-empty array");
  }
  const normalizedSkills = skills.map((s) => s.trim()).filter(Boolean);
  const normalizedAnswers = assessmentAnswers.map((a) => a.trim()).filter(Boolean);

  const { consistencyScore, riskLevel, flags } = analyzeVerification(
    normalizedEvidenceType,
    normalizedSkills,
    Number(experienceYears) || 0,
    normalizedAnswers
  );

  const verification = await prisma.providerVerification.create({
    data: {
      id: createPublicId("v"),
      providerId: req.user.id,
      serviceCategory: normalizedCategory,
      skills: normalizedSkills,
      experienceYears: Number(experienceYears) || 0,
      evidenceType: normalizedEvidenceType,
      evidenceDescription: evidenceDescription || "",
      assessmentAnswers: normalizedAnswers,
      aiConsistencyScore: consistencyScore,
      aiRiskLevel: riskLevel,
      aiFlags: flags,
    },
  });

  // Notify admins
  const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
  for (const admin of admins) {
    try {
      await prisma.notification.create({
        data: {
          id: createPublicId("n"),
          userId: admin.id,
          title: "New Verification Request",
          message: `Provider ${req.user.name} submitted a verification application for ${normalizedCategory}`,
          type: "info",
          link: `/admin/providers/verification`,
        },
      });
    } catch {
      // Notification failures don't break the main flow
    }
  }

  return res.status(201).json({ verification: sanitizeDoc(verification) });
}));

// Admin endpoints

// GET /api/verification/pending — admin-only: pending verification queue
router.get("/pending", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const verifications = await prisma.providerVerification.findMany({
    where: { adminDecision: "pending" },
    orderBy: { submittedAt: "asc" },
    include: {
      provider: {
        select: { name: true, email: true, phone: true, location: true },
      },
    },
  });
  const sanitized = verifications.map((v) => sanitizeDoc(v));
  return res.json({ verifications: sanitized });
}));

// PATCH /api/verification/:id/decision — admin-only: update verification decision
router.patch("/:id/decision", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const { decision, notes } = req.body;
  const normalizedDecision = assertEnum(decision, ["approved", "rejected", "needs_evidence"], "Decision");
  const verification = await prisma.providerVerification.findUnique({
    where: { id: req.params.id },
    include: { provider: { select: { id: true, name: true } } },
  });
  if (!verification) throw new ApiError(404, "Verification not found");

  const updateData = {
    adminDecision: normalizedDecision,
    adminNotes: notes || null,
    reviewerId: req.user.id,
    reviewedAt: new Date(),
  };

  // If approved, also update provider's approval status
  if (normalizedDecision === "approved") {
    await prisma.user.update({
      where: { id: verification.providerId },
      data: { approved: true },
    });
  }

  const updated = await prisma.providerVerification.update({
    where: { id: req.params.id },
    data: updateData,
  });

  // Notify provider
  const decisionMessage = {
    approved: "Congratulations! Your verification has been approved.",
    rejected: "Your verification application has been rejected.",
    needs_evidence: "Additional evidence is required for your verification.",
  };
  await prisma.notification.create({
    data: {
      id: createPublicId("n"),
      userId: verification.providerId,
      title: `Verification ${normalizedDecision}`,
      message: decisionMessage[normalizedDecision],
      type: normalizedDecision === "approved" ? "success" : normalizedDecision === "rejected" ? "warning" : "info",
      link: `/provider/verification`,
    },
  });

  return res.json({ verification: sanitizeDoc(updated) });
}));

export default router;
