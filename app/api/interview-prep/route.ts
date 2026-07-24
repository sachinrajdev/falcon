import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  checkAndConsumeFeatureQuota,
  getActorId,
  getPlanFromRequest,
} from "@/lib/planQuota";

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const INTERVIEW_PREP_SCHEMA = {
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
        companyContextNote: { type: "string" },
        mustHaveSkills: { type: "array", items: { type: "string" }, maxItems: 8 },
        preferredSkills: { type: "array", items: { type: "string" }, maxItems: 8 },
        responsibilities: { type: "array", items: { type: "string" }, maxItems: 8 },
      },
      required: [
        "company",
        "roleTitle",
        "seniority",
        "employmentType",
        "location",
        "companyContextNote",
        "mustHaveSkills",
        "preferredSkills",
        "responsibilities",
      ],
      additionalProperties: false,
    },
    likelyInterviewFocus: {
      type: "array",
      items: { type: "string" },
      maxItems: 8,
    },
    interviewQuestions: {
      type: "array",
      maxItems: 12,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          category: {
            type: "string",
            enum: ["technical", "scenario", "experience", "behavioral", "company-fit", "gap-probing"],
          },
          whyThisIsAsked: { type: "string" },
          whatTheyEvaluate: { type: "array", items: { type: "string" }, maxItems: 6 },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          candidateRisk: { type: "string", enum: ["low", "medium", "high"] },
          answerGuidance: { type: "array", items: { type: "string" }, maxItems: 6 },
          answerFramework: { type: "array", items: { type: "string" }, maxItems: 6 },
          resumeEvidenceToUse: { type: "array", items: { type: "string" }, maxItems: 6 },
          mistakesToAvoid: { type: "array", items: { type: "string" }, maxItems: 5 },
          followUps: { type: "array", items: { type: "string" }, maxItems: 5 },
        },
        required: [
          "question",
          "category",
          "whyThisIsAsked",
          "whatTheyEvaluate",
          "difficulty",
          "candidateRisk",
          "answerGuidance",
          "answerFramework",
          "resumeEvidenceToUse",
          "mistakesToAvoid",
          "followUps",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["jobProfile", "likelyInterviewFocus", "interviewQuestions"],
  additionalProperties: false,
} as const;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many interview prep requests. Please try again later.",
        },
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
      feature: "interviewPrep",
    });

    if (!quota.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Monthly limit reached for Interview Prep.",
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
    const jobDescription = typeof body?.jobDescription === "string" ? body.jobDescription.trim() : "";

    if (!candidateProfile || typeof candidateProfile !== "object") {
      return NextResponse.json(
        { success: false, error: "Missing candidate profile." },
        { status: 400 }
      );
    }

    if (!jobDescription) {
      return NextResponse.json(
        { success: false, error: "Job description is required." },
        { status: 400 }
      );
    }

    const response = await getOpenAI().responses.create({
      model: "gpt-5-mini",
      input: `
You are Pragati Interview Prep Coach.

Given a candidate profile and a job description, generate role-specific interview preparation.

Rules:
- Do not invent candidate experience.
- Questions must be realistic for the role/seniority in JD.
- Include technical + behavioral + scenario + gap probing coverage.
- answerGuidance should be practical, concise, and role-relevant.

Candidate profile:
${JSON.stringify(candidateProfile, null, 2)}

Job description:
${jobDescription}
`,
      text: {
        format: {
          type: "json_schema",
          name: "pragati_interview_prep",
          schema: INTERVIEW_PREP_SCHEMA,
          strict: true,
        },
      },
    });

    const output = response.output_text ?? "{}";

    let interviewPrep;
    try {
      interviewPrep = JSON.parse(output);
    } catch (parseErr) {
      console.error("INTERVIEW PREP PARSE ERROR:", parseErr, "raw output:", output);
      return NextResponse.json(
        { success: false, error: "Failed to parse interview prep output." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      interviewPrep,
      usage: {
        plan,
        feature: quota.feature,
        used: quota.used,
        limit: quota.limit,
        remaining: quota.remaining,
      },
    });
  } catch (err: unknown) {
    console.error("INTERVIEW PREP ERROR:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
