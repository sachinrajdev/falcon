import { NextRequest, NextResponse } from "next/server";
import { llama } from "@/lib/llama";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Parse Resume using LlamaCloud
    // -----------------------------
    const result = await llama.parsing.parse({
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
        ?.map((page: any) => page.markdown)
        .join("\n\n") ||
      result.text?.pages
        ?.map((page: any) => page.text)
        .join("\n\n") ||
      "";

    if (!resumeText) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to extract resume text.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------
    // Analyze using OpenAI
    // -----------------------------
    const response = await openai.responses.create({
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

- Return ONLY valid JSON.
- No markdown.
- No explanation.
- No paragraphs.
- No extra text.
- Keep everything concise.
- Skills should be technology names only.
- Missing skills should be technology names only.
- Strengths max 5.
- Weaknesses max 5.
- Suggestions max 5.
- Experience should only contain years.
- Role should only contain ONE job title.

Career score must contain:

{
  "overall": number,
  "ats": number,
  "technical": number,
  "presentation": number,
  "marketDemand": number
}

Return EXACTLY this JSON:

{
  "careerScore": {
    "overall": 0,
    "ats": 0,
    "technical": 0,
    "presentation": 0,
    "marketDemand": 0
  },
  "role": "",
  "experience": "",
  "summary": "",
  "careerLevel": "",
  "industry": "",
  "salaryRange": "",
  "topCompanies": [],
  "skills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Resume:

${resumeText}
`,
});

const output = response.output_text ?? "{}";

const analysis = JSON.parse(output);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}