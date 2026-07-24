import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  checkAndConsumeFeatureQuota,
  getActorId,
  getPlanFromRequest,
} from "@/lib/planQuota";

const RATE_LIMIT_MAX_REQUESTS = 8;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const DECISION_SCHEMA = {
  type: "object",
  properties: {
    jobProfile: {
      type: "object",
      properties: {
        company: { type: "string" },
        roleTitle: { type: "string" },
        seniority: { type: "string" },
        employmentType: { type: "string" },
        location: { type: "string" },
        mustHaveSkills: { type: "array", items: { type: "string" }, maxItems: 8 },
        preferredSkills: { type: "array", items: { type: "string" }, maxItems: 8 },
        responsibilities: { type: "array", items: { type: "string" }, maxItems: 6 },
      },
      required: [
        "company",
        "roleTitle",
        "seniority",
        "employmentType",
        "location",
        "mustHaveSkills",
        "preferredSkills",
        "responsibilities",
      ],
      additionalProperties: false,
    },
    verdict: {
      type: "string",
      enum: ["Apply Now", "Improve First", "Skip"],
    },
    why: { type: "string" },
    interviewProbability: { type: "number" },
    resumeStrength: { type: "number" },
    skillGap: { type: "number" },
    criticalMissingSkills: { type: "array", items: { type: "string" }, maxItems: 6 },
    topStrengthsForThisRole: { type: "array", items: { type: "string" }, maxItems: 5 },
    estimatedTimeToImprove: { type: "string" },
    nextStepsChecklist: { type: "array", items: { type: "string" }, maxItems: 6 },
    resumeTailoring: {
      type: "object",
      properties: {
        summaryFocus: { type: "string" },
        bulletsToEmphasize: { type: "array", items: { type: "string" }, maxItems: 5 },
        missingEvidenceToAdd: { type: "array", items: { type: "string" }, maxItems: 5 },
        keywordsToNaturallyInclude: { type: "array", items: { type: "string" }, maxItems: 8 },
      },
      required: [
        "summaryFocus",
        "bulletsToEmphasize",
        "missingEvidenceToAdd",
        "keywordsToNaturallyInclude",
      ],
      additionalProperties: false,
    },
  },
  required: [
    "jobProfile",
    "verdict",
    "why",
    "interviewProbability",
    "resumeStrength",
    "skillGap",
    "criticalMissingSkills",
    "topStrengthsForThisRole",
    "estimatedTimeToImprove",
    "nextStepsChecklist",
    "resumeTailoring",
  ],
  additionalProperties: false,
} as const;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many decision requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const plan = getPlanFromRequest(req);
    const actorId = getActorId(req);

    const quota = checkAndConsumeFeatureQuota({
      actorId,
      plan,
      feature: "jdMatch",
    });

    if (!quota.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Monthly limit reached for JD Match.",
          upgradeRequired: true,
          currentPlan: quota.plan,
          feature: quota.feature,
          used: quota.used,
          limit: quota.limit,
          starterPriceInr: quota.starterPriceInr,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const candidateProfile = body?.candidateProfile;
    const jobDescription = body?.jobDescription;

    if (!candidateProfile || typeof candidateProfile !== "object") {
      return NextResponse.json(
        { success: false, error: "Missing candidate profile." },
        { status: 400 }
      );
    }

    if (typeof jobDescription !== "string" || !jobDescription.trim()) {
      return NextResponse.json(
        { success: false, error: "Job description is required." },
        { status: 400 }
      );
    }

    const normalizedJobDescription = jobDescription.trim();

    const response = await getOpenAI().responses.create({
      model: "gpt-5-mini",
      input: `
You are Pragati, an AI Career Operating System.

Your job is to decide what the candidate should do next for this exact job.

You will receive:
1. A structured candidate profile.
2. A raw job description.

Your task:
1. Extract the job profile.
2. Compare candidate profile and job profile using skill match, seniority, responsibilities, and transferable skills.
3. Return exactly one verdict: Apply Now, Improve First, or Skip.
4. Return concrete JD-based resume tailoring suggestions.

RULES

This is not an ATS score.
Use transferable-skill reasoning instead of pure keyword matching.
Be honest about seniority mismatch, core skill gaps, and role fit.
Do not be overly optimistic.

Use these meanings:
- Apply Now: strong fit, minor gaps only.
- Improve First: close fit, but important gaps should be addressed first.
- Skip: low-probability role right now due to meaningful mismatch.

Scoring fields:
- interviewProbability, resumeStrength, and skillGap must be integers from 0 to 100.
- Higher skillGap means more missing ground.
- resumeTailoring should be practical and tied to the JD, not generic resume advice.

Candidate profile:
${JSON.stringify(candidateProfile, null, 2)}

Job description:
${normalizedJobDescription}
`,
      text: {
        format: {
          type: "json_schema",
          name: "pragati_decision",
          schema: DECISION_SCHEMA,
          strict: true,
        },
      },
    });

    const output = response.output_text ?? "{}";

    let decision;
    try {
      decision = JSON.parse(output);
    } catch (parseErr) {
      console.error("DECISION PARSE ERROR:", parseErr, "raw output:", output);
      return NextResponse.json(
        { success: false, error: "Failed to parse decision output. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      decision,
      usage: {
        plan,
        feature: quota.feature,
        used: quota.used,
        limit: quota.limit,
        remaining: quota.remaining,
      },
    });
  } catch (err: unknown) {
    console.error("DECISION ERROR:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
