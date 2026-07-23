import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

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

    const body = await req.json();

    const candidateProfile = body?.candidateProfile;
    const jobDescription = body?.jobDescription;

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

    if (
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
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

Your job is to rewrite the candidate's resume specifically for the supplied Job Description.

You will receive:
1. A structured Candidate Profile.
2. A Job Description.

Your goal is to maximize interview chances WITHOUT inventing information.

RULES

- Never invent experience.
- Never invent projects.
- Never invent certifications.
- Never invent achievements or metrics.
- Never claim the candidate knows a technology unless it already exists in the profile.
- You may rewrite wording, reorder skills, and strengthen bullets.
- Naturally include important keywords from the Job Description.
- Professional summary should be ATS-friendly.
- Experience bullets should start with strong action verbs.
- Skills should prioritize the most relevant skills for this job.
- recruiterNotes should explain what was optimized.

Candidate Profile:
${JSON.stringify(candidateProfile, null, 2)}

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