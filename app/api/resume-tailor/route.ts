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

const RESUME_TAILOR_SCHEMA = {
  type: "object",
  properties: {
    professionalSummary: {
      type: "string",
    },
    skills: {
      type: "array",
      items: {
        type: "string",
      },
      maxItems: 25,
    },
    experienceBullets: {
      type: "array",
      items: {
        type: "string",
      },
      maxItems: 12,
    },
    keywordAdditions: {
      type: "array",
      items: {
        type: "string",
      },
      maxItems: 20,
    },
    recruiterNotes: {
      type: "array",
      items: {
        type: "string",
      },
      maxItems: 8,
    },
  },
  required: [
    "professionalSummary",
    "skills",
    "experienceBullets",
    "keywordAdditions",
    "recruiterNotes",
  ],
  additionalProperties: false,
} as const;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(
      ip,
      RATE_LIMIT_MAX_REQUESTS,
      RATE_LIMIT_WINDOW_MS
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many resume tailoring requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimit.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const plan = getPlanFromRequest(req);
    const actorId = getActorId(req);

    const quota = checkAndConsumeFeatureQuota({
      actorId,
      plan,
      feature: "resumeTailor",
    });

    if (!quota.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Monthly limit reached for Resume Tailor.",
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
    const jobDescription =
      typeof body?.jobDescription === "string" ? body.jobDescription.trim() : "";
    const resumeText =
      typeof body?.resumeText === "string" ? body.resumeText.trim() : "";

    if (!candidateProfile || typeof candidateProfile !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing candidate profile.",
        },
        {
          status: 400,
        }
      );
    }

    if (!jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description is required.",
        },
        {
          status: 400,
        }
      );
    }

    const response = await getOpenAI().responses.create({
      model: "gpt-5-mini",
      input: `
You are Pragati Resume Tailor.

Your job is to tailor the candidate's resume specifically for the supplied Job Description.

You will receive:
1. A structured Candidate Profile
2. The raw resume text if available
3. A Job Description

Your goal is to maximize interview chances WITHOUT inventing information.

RULES
- Never invent experience.
- Never invent projects.
- Never invent certifications.
- Never invent achievements or metrics.
- Never claim the candidate knows a technology unless it is clearly supported by the resume text or candidate profile.
- Use resume text as the source of truth when available.
- Candidate profile is a secondary guide, not a replacement for resume evidence.
- You may rewrite wording, reorder skills, and strengthen phrasing.
- Naturally include important Job Description keywords only when supported by the candidate's existing background.
- Professional summary should be ATS-friendly and concise.
- Experience bullets should start with strong action verbs and remain factual.
- Skills should prioritize the most relevant supported skills for this job.
- recruiterNotes should explain what was optimized and what could not be added truthfully.
- If raw resume text is missing, do the best possible profile-based tailoring and mention that limitation in recruiterNotes.

Candidate Profile:
${JSON.stringify(candidateProfile, null, 2)}

Raw Resume Text:
${resumeText || "Not provided"}

Job Description:
${jobDescription}
`,
      text: {
        format: {
          type: "json_schema",
          name: "resume_tailor",
          schema: RESUME_TAILOR_SCHEMA,
          strict: true,
        },
      },
    });

    const output = response.output_text ?? "{}";

    let tailoredResume;

    try {
      tailoredResume = JSON.parse(output);
    } catch (parseErr) {
      console.error(
        "RESUME TAILOR PARSE ERROR:",
        parseErr,
        "raw output:",
        output
      );

      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse tailored resume.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      success: true,
      tailoredResume,
      usage: {
        plan,
        feature: quota.feature,
        used: quota.used,
        limit: quota.limit,
        remaining: quota.remaining,
      },
    });
  } catch (err: unknown) {
    console.error("RESUME TAILOR ERROR:", err);

    const message =
      err instanceof Error ? err.message : "Something went wrong.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
