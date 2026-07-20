import { NextRequest, NextResponse } from "next/server";
import { getLlama } from "@/lib/llama";
import { getOpenAI } from "@/lib/openai";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — resumes are never legitimately larger
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 5 uploads / hour / IP

const FALCON_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    careerScore: {
      type: "object",
      properties: {
        overall: { type: "number" },
        ats: { type: "number" },
        technical: { type: "number" },
        presentation: { type: "number" },
        marketDemand: { type: "number" },
      },
      required: ["overall", "ats", "technical", "presentation", "marketDemand"],
      additionalProperties: false,
    },
    role: { type: "string" },
    experience: { type: "string" },
    summary: { type: "string" },
    careerLevel: {
      type: "string",
      enum: ["Junior", "Mid-Level", "Senior", "Lead", "Principal"],
    },
    industry: { type: "string" },
    salaryRange: { type: "string" },
    topCompanies: { type: "array", items: { type: "string" }, maxItems: 5 },
    skills: { type: "array", items: { type: "string" } },
    missingSkills: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" }, maxItems: 5 },
    weaknesses: { type: "array", items: { type: "string" }, maxItems: 5 },
    suggestions: { type: "array", items: { type: "string" }, maxItems: 5 },
  },
  required: [
    "careerScore",
    "role",
    "experience",
    "summary",
    "careerLevel",
    "industry",
    "salaryRange",
    "topCompanies",
    "skills",
    "missingSkills",
    "strengths",
    "weaknesses",
    "suggestions",
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
You are Falcon AI Career Coach.

Your job is to analyze resumes.

IMPORTANT RULES

summary:
Write a professional summary in maximum 2 sentences.

careerLevel:
Must be one of:
Junior
Mid-Level
Senior
Lead
Principal

industry:
One industry only.

salaryRange:
Estimate annual salary based on skills and experience.
Examples:
₹18L–₹25L
₹35L–₹45L
$140k–$180k

topCompanies:
Maximum 5 company names.
Only companies that realistically match this profile.

Keep every field concise.
Skills should be technology names only.
Missing skills should be technology names only.
Strengths max 5.
Weaknesses max 5.
Suggestions max 5.
Experience should only contain years.
Role should only contain ONE job title.

Resume:

${resumeText}
`,
      text: {
        format: {
          type: "json_schema",
          name: "falcon_analysis",
          schema: FALCON_ANALYSIS_SCHEMA,
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