import { NextRequest, NextResponse } from "next/server";
import { getLlama } from "@/lib/llama";
import { getOpenAI } from "@/lib/openai";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — resumes are never legitimately larger
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 5 uploads / hour / IP

const CANDIDATE_PROFILE_SCHEMA = {
  type: "object",
  properties: {
    currentRole: { type: "string" },
    experienceYears: { type: "string" },
    summary: { type: "string" },
    careerLevel: {
      type: "string",
      enum: ["Junior", "Mid-Level", "Senior", "Lead", "Principal"],
    },
    industry: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
    targetRoles: { type: "array", items: { type: "string" }, maxItems: 5 },
    preferredLocations: { type: "array", items: { type: "string" }, maxItems: 5 },
    projects: { type: "array", items: { type: "string" }, maxItems: 6 },
    certifications: { type: "array", items: { type: "string" }, maxItems: 6 },
    topStrengths: { type: "array", items: { type: "string" }, maxItems: 5 },
    preparationAreas: { type: "array", items: { type: "string" }, maxItems: 5 },
  },
  required: [
    "currentRole",
    "experienceYears",
    "summary",
    "careerLevel",
    "industry",
    "skills",
    "targetRoles",
    "preferredLocations",
    "projects",
    "certifications",
    "topStrengths",
    "preparationAreas",
  ],
  additionalProperties: false,
} as const;

export async function POST(req: NextRequest) {
  try {
    // -----------------------------
    // Rate limit (per IP)
    // -----------------------------
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many uploads. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file uploaded." },
        { status: 400 }
      );
    }

    // -----------------------------
    // Server-side validation
    // (client-side checks in ResumeUploader.tsx can be bypassed by anyone
    // calling this endpoint directly, so these checks are the real gate)
    // -----------------------------
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // -----------------------------
    // Parse Resume using LlamaCloud
    // -----------------------------
    const result = await getLlama().parsing.parse({
      upload_file: file,
      tier: "agentic",
      version: "latest",
      expand: ["text", "markdown"],
    });

    // -----------------------------
    // Extract Resume Text
    // -----------------------------
    const resumeText =
      result.markdown?.pages
        ?.map((page) => ("markdown" in page ? page.markdown : undefined))
        .join("\n\n") ||
      result.text?.pages
        ?.map((page) => ("text" in page ? page.text : undefined))
        .join("\n\n") ||
      "";

    if (!resumeText) {
      return NextResponse.json(
        { success: false, error: "Failed to extract resume text." },
        { status: 500 }
      );
    }

    // -----------------------------
    // Analyze using OpenAI (Structured Outputs — guarantees schema-conforming JSON,
    // no more hoping a prompt instruction like "return only JSON" is honored)
    // -----------------------------
    const response = await getOpenAI().responses.create({
      model: "gpt-5-mini",
      input: `
You are Falcon, an AI Career Operating System.

Your job in this step is not to grade the resume. Your job is to extract a structured Candidate Profile from the resume so Falcon can later compare it against a job description.

IMPORTANT RULES

Return only information that can be reasonably inferred from the resume.
Do not invent certifications, target roles, or locations that have no evidence.
Keep every field concise and practical.

summary:
Write a professional summary in maximum 2 sentences.

currentRole:
Return one likely current or most recent role title.

experienceYears:
Return only the number of years as a short string, for example:
2 years
5 years
11 years

careerLevel:
Must be one of:
Junior
Mid-Level
Senior
Lead
Principal

industry:
One industry only.

skills:
Technology names or professional skills only.

targetRoles:
Likely job titles this candidate should target next.

preferredLocations:
Only include locations or remote preferences explicitly stated or strongly implied.

projects:
Short project names or project descriptions from the resume.

certifications:
Only real certifications mentioned in the resume.

topStrengths:
Maximum 5 concise strengths visible from the resume.

preparationAreas:
Maximum 5 areas the candidate may need to strengthen before applying broadly. These are not final job-specific gaps.

Resume:

${resumeText}
`,
      text: {
        format: {
          type: "json_schema",
          name: "falcon_analysis",
          schema: FALCON_PROFILE_SCHEMA,
          strict: true,
        },
      },
    });

    const output = response.output_text ?? "{}";

    let analysis;
    try {
      analysis = JSON.parse(output);
    } catch (parseErr) {
      console.error("FALCON ANALYSIS PARSE ERROR:", parseErr, "raw output:", output);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse analysis output. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err: unknown) {
    console.error("UPLOAD ERROR:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";

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