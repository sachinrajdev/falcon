import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const RATE_LIMIT_MAX_REQUESTS = 8;
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
        responsibilities: { type: "array", items: { type: "string" }, maxItems: 6 },
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
    likelyInterviewFocus: { type: "array", items: { type: "string" }, maxItems: 6 },
    interviewQuestions: {
      type: "array",
      minItems: 10,
      maxItems: 15,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          category: {
            type: "string",
            enum: ["technical", "scenario", "experience", "behavioral", "company-fit", "gap-probing"],
          },
          whyThisIsAsked: { type: "string" },
          whatTheyEvaluate: { type: "array", items: { type: "string" }, maxItems: 5 },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
          },
          candidateRisk: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          answerGuidance: { type: "array", items: { type: "string" }, maxItems: 5 },
          answerFramework: { type: "array", items: { type: "string" }, maxItems: 5 },
          resumeEvidenceToUse: { type: "array", items: { type: "string" }, maxItems: 4 },
          mistakesToAvoid: { type: "array", items: { type: "string" }, maxItems: 4 },
          followUps: { type: "array", items: { type: "string" }, maxItems: 3 },
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
        { success: false, error: "Too many interview prep requests. Please try again later." },
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

    const response = await getOpenAI().responses.create({
      model: "gpt-5-mini",
      input: `
You are Falcon, an AI Career Operating System.

Your job is to generate job-specific interview preparation.

You will receive:
1. A structured candidate profile extracted from a resume.
2. A raw job description.

Your task:
1. Extract a concise job profile.
2. Infer likely interview focus areas based on the role, company context, seniority, and candidate profile.
3. Generate 10 to 15 realistic professional interview questions tailored to this exact candidate and job.
4. For each question, provide coaching for how the candidate should answer.

RULES

Questions must feel like real interviewer questions for a professional hiring process.
Do not generate generic filler.
Questions should reflect the JD, the candidate's experience level, likely company expectations, and any visible gaps.
Use company-fit questions only when there is enough signal from the company or role context.
When the company is not explicit in the JD, be honest and use a generic but professional company context note.
For each question, provide:
- answerFramework: the structure the candidate should use
- resumeEvidenceToUse: examples or evidence from the candidate profile to draw on
- mistakesToAvoid: common weak-answer patterns to avoid

Question distribution should roughly include:
- technical questions from must-have skills
- scenario questions from responsibilities
- experience-validation questions from the candidate profile
- behavioral or leadership questions based on seniority
- gap-probing questions where the candidate may be weaker

Candidate profile:
${JSON.stringify(candidateProfile, null, 2)}

Job description:
${jobDescription}
`,
      text: {
        format: {
          type: "json_schema",
          name: "falcon_interview_prep",
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
        { success: false, error: "Failed to parse interview prep output. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, interviewPrep });
  } catch (err: unknown) {
    console.error("INTERVIEW PREP ERROR:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}