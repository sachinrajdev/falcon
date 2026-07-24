import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const RATE_LIMIT_MAX_REQUESTS = 16;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const HR_OUTREACH_SCHEMA = {
  type: "object",
  properties: {
    linkedInMessage: { type: "string" },
    hrEmailSubject: { type: "string" },
    hrEmailBody: { type: "string" },
    referralMessage: { type: "string" },
    followUpMessage: { type: "string" },
    sendChecklist: {
      type: "array",
      items: { type: "string" },
      maxItems: 8,
    },
  },
  required: [
    "linkedInMessage",
    "hrEmailSubject",
    "hrEmailBody",
    "referralMessage",
    "followUpMessage",
    "sendChecklist",
  ],
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
          error: "Too many outreach requests. Please try again later.",
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
    const recruiterName = typeof body?.recruiterName === "string" ? body.recruiterName.trim() : "";

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
You are Pragati HR Outreach Writer.

Generate personalized outreach messages that improve recruiter response probability.

Rules:
- Be concise and specific.
- Do not invent skills, years, projects, or outcomes.
- linkedInMessage: 55-90 words.
- hrEmailBody: 120-180 words.
- referralMessage: 60-110 words.
- followUpMessage: 40-80 words.
- Keep a professional, polite tone.

Recruiter name (if available): ${recruiterName || "Not provided"}

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
          name: "pragati_hr_outreach",
          schema: HR_OUTREACH_SCHEMA,
          strict: true,
        },
      },
    });

    const output = response.output_text ?? "{}";

    let outreach;
    try {
      outreach = JSON.parse(output);
    } catch (parseErr) {
      console.error("HR OUTREACH PARSE ERROR:", parseErr, "raw output:", output);
      return NextResponse.json(
        { success: false, error: "Failed to parse outreach output." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, outreach });
  } catch (err: unknown) {
    console.error("HR OUTREACH ERROR:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
