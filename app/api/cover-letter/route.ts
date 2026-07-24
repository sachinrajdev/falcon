import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const RATE_LIMIT_MAX_REQUESTS = 12;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const COVER_LETTER_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    emailSubject: { type: "string" },
    coverLetter: { type: "string" },
    shortPitch: { type: "string" },
    keyHighlights: {
      type: "array",
      items: { type: "string" },
      maxItems: 6,
    },
    cautionNotes: {
      type: "array",
      items: { type: "string" },
      maxItems: 4,
    },
  },
  required: [
    "title",
    "emailSubject",
    "coverLetter",
    "shortPitch",
    "keyHighlights",
    "cautionNotes",
  ],
  additionalProperties: false,
} as const;

function sanitizeTone(value: unknown): "professional" | "confident" | "concise" {
  if (value === "confident") return "confident";
  if (value === "concise") return "concise";
  return "professional";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many cover letter requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();
    const candidateProfile = body?.candidateProfile;
    const jobDescription = typeof body?.jobDescription === "string" ? body.jobDescription.trim() : "";
    const tailoredResume = body?.tailoredResume;
    const tone = sanitizeTone(body?.tone);

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
You are Pragati Cover Letter Writer.

You will receive:
1) Candidate profile
2) Tailored resume output (if available)
3) Job description
4) Tone preference

Goal:
Generate a truthful, role-specific cover letter that improves application quality.

Rules:
- Do not invent experience, projects, tools, certifications, numbers, or achievements.
- Keep cover letter 180-260 words.
- Include role and company context from JD if present.
- Make language natural and ATS-safe.
- shortPitch should be 40-70 words.
- cautionNotes should include limits where evidence is weak.

Tone: ${tone}

Candidate profile:
${JSON.stringify(candidateProfile, null, 2)}

Tailored resume output:
${JSON.stringify(tailoredResume ?? {}, null, 2)}

Job description:
${jobDescription}
`,
      text: {
        format: {
          type: "json_schema",
          name: "pragati_cover_letter",
          schema: COVER_LETTER_SCHEMA,
          strict: true,
        },
      },
    });

    const output = response.output_text ?? "{}";

    let coverLetter;
    try {
      coverLetter = JSON.parse(output);
    } catch (parseErr) {
      console.error("COVER LETTER PARSE ERROR:", parseErr, "raw output:", output);
      return NextResponse.json(
        { success: false, error: "Failed to parse cover letter output." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, coverLetter });
  } catch (err: unknown) {
    console.error("COVER LETTER ERROR:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
