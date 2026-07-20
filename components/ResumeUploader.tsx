"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type CandidateProfile = {
  currentRole: string;
  experienceYears: string;
  summary: string;
  careerLevel: "Junior" | "Mid-Level" | "Senior" | "Lead" | "Principal";
  industry: string;
  skills: string[];
  targetRoles: string[];
  preferredLocations: string[];
  projects: string[];
  certifications: string[];
  topStrengths: string[];
  preparationAreas: string[];
};

type InterviewPrepResult = {
  jobProfile: {
    company: string;
    roleTitle: string;
    seniority: string;
    employmentType: string;
    location: string;
    companyContextNote: string;
    mustHaveSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
  };
  likelyInterviewFocus: string[];
  interviewQuestions: Array<{
    question: string;
    category: "technical" | "scenario" | "experience" | "behavioral" | "company-fit" | "gap-probing";
    whyThisIsAsked: string;
    whatTheyEvaluate: string[];
    difficulty: "easy" | "medium" | "hard";
    candidateRisk: "low" | "medium" | "high";
    answerGuidance: string[];
    followUps: string[];
  }>;
};

function StepCard({
  number,
  title,
  description,
  status,
}: {
  number: number;
  title: string;
  description: string;
  status: "done" | "active" | "upcoming";
}) {
  const styles = {
    done: "border-emerald-200 bg-emerald-50 text-emerald-900",
    active: "border-blue-200 bg-blue-50 text-blue-950",
    upcoming: "border-slate-200 bg-white text-slate-900",
  } as const;

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${styles[status]}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
          {number}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {status === "done"
              ? "Completed"
              : status === "active"
                ? "Current"
                : "Next"}
          </p>

          <h3 className="mt-1 text-lg font-bold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ChipSection({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full px-3 py-2 text-sm text-white ${color}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function SectionShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrepResult | null>(null);
  const [prepLoading, setPrepLoading] = useState(false);

  const generateInterviewPrep = useCallback(async () => {
    if (!analysis || !jobDescription.trim()) return;

    setPrepLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/interview-prep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateProfile: analysis,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Interview prep failed");
      }

      setInterviewPrep(data.interviewPrep);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Interview prep failed.");
    } finally {
      setPrepLoading(false);
    }
  }, [analysis, jobDescription]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    const uploadedFile = acceptedFiles[0];

    if (uploadedFile.type !== "application/pdf") {
      alert("Please upload a PDF resume.");
      return;
    }

    setFile(uploadedFile);
    setAnalysis(null);
    setInterviewPrep(null);
    setJobDescription("");
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const hasJobDescription = jobDescription.trim().length > 0;
  const stepOneStatus: "done" | "active" | "upcoming" = analysis ? "done" : "active";
  const stepTwoStatus: "done" | "active" | "upcoming" = analysis ? "done" : "upcoming";
  const stepThreeStatus: "done" | "active" | "upcoming" = interviewPrep
    ? "done"
    : analysis
      ? hasJobDescription
        ? "done"
        : "active"
      : "upcoming";
  const stepFourStatus: "done" | "active" | "upcoming" = interviewPrep
    ? "done"
    : prepLoading
      ? "active"
      : hasJobDescription
        ? "active"
        : "upcoming";

  return (
    <div className="mt-10 space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <StepCard
          number={1}
          title="Upload resume"
          description="Start with your current resume so Falcon can extract your candidate profile."
          status={stepOneStatus}
        />
        <StepCard
          number={2}
          title="Confirm profile"
          description="Review the extracted role, experience, skills, projects, and certifications."
          status={stepTwoStatus}
        />
        <StepCard
          number={3}
          title="Paste job description"
          description="Add one target role so Falcon can extract the job profile and compare fit."
          status={stepThreeStatus}
        />
        <StepCard
          number={4}
          title="Get decision"
          description="Receive Apply Now, Improve First, or Skip with clear reasoning and next steps."
          status={stepFourStatus}
        />
      </div>

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-[2rem] border-2 border-dashed p-16 text-center transition ${
          isDragActive
            ? "border-blue-600 bg-blue-50"
            : "border-slate-300 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-6xl">📄</div>
        <h2 className="mt-6 text-2xl font-bold">Upload Your Resume</h2>
        <p className="mt-2 text-slate-500">Drag and drop a PDF or click to select one.</p>
      </div>

      {file && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-bold">Uploaded Resume</h3>
          <p className="mt-2">{file.name}</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800 shadow-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-[2rem] border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
            Falcon is working
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Extracting your candidate profile from the resume.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            This is the first step only. Falcon is building the profile it will later compare against a specific job description.
          </p>
        </div>
      )}

      {analysis && (
        <>
          <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
              Candidate Profile Extracted
            </p>

            <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold">{analysis.currentRole}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  {analysis.summary}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Experience</p>
                  <p className="mt-2 text-lg font-semibold">{analysis.experienceYears}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Level</p>
                  <p className="mt-2 text-lg font-semibold">{analysis.careerLevel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Industry</p>
                  <p className="mt-2 text-lg font-semibold">{analysis.industry}</p>
                </div>
              </div>
            </div>
          </section>

          <SectionShell
            eyebrow="Step 2"
            title="Confirm your extracted profile"
            description="This is the information Falcon will carry into the Job Intelligence and Decision Engine steps. Review it before comparing yourself against a specific job."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ChipSection title="Core skills" items={analysis.skills ?? []} color="bg-emerald-600" />
              <ChipSection title="Likely target roles" items={analysis.targetRoles ?? []} color="bg-blue-700" />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ChipSection
                title="Preferred locations"
                items={analysis.preferredLocations ?? []}
                color="bg-slate-800"
              />
              <ChipSection
                title="Certifications"
                items={analysis.certifications?.length ? analysis.certifications : ["No certifications detected"]}
                color="bg-violet-700"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ListSection title="Projects called out from resume" items={analysis.projects ?? []} />
              <ListSection title="Top strengths visible from resume" items={analysis.topStrengths ?? []} />
            </div>

            <div className="mt-4">
              <ListSection
                title="Preparation areas to validate against target jobs"
                items={analysis.preparationAreas ?? []}
              />
            </div>
          </SectionShell>

          <SectionShell
            eyebrow="Step 3"
            title="Paste one job description next"
            description="Falcon should not decide from the resume alone. The real product decision happens after it extracts the job profile and compares both sides."
          >
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <label htmlFor="job-description" className="text-sm font-semibold text-slate-900">
                Target job description
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the full job description here. Falcon will use it in the next step to extract the job profile and return Apply Now, Improve First, or Skip."
                className="mt-3 min-h-52 w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-600">
                  {jobDescription.trim().length > 0
                    ? `${jobDescription.trim().split(/\s+/).length} words captured for the next Job Intelligence step.`
                    : "No job description added yet."}
                </p>

                <button
                  type="button"
                  onClick={generateInterviewPrep}
                  disabled={!jobDescription.trim()}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Generate interview prep
                </button>
              </div>
            </div>
          </SectionShell>

          <SectionShell
            eyebrow="Step 4"
            title="Interview prep for this exact job"
            description="Falcon should generate realistic interview questions from the JD, your experience level, and the likely company context instead of giving generic mock interviews."
          >
            {prepLoading ? (
              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Falcon is preparing</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  Generating professional interview questions from the job description and your profile.
                </p>
              </div>
            ) : interviewPrep ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Target role</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-950">{interviewPrep.jobProfile.roleTitle}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {interviewPrep.jobProfile.company} · {interviewPrep.jobProfile.seniority} · {interviewPrep.jobProfile.employmentType}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{interviewPrep.jobProfile.location}</p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {interviewPrep.jobProfile.companyContextNote}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Likely interview focus</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {interviewPrep.likelyInterviewFocus.map((focus) => (
                        <span key={focus} className="rounded-full bg-slate-900 px-3 py-2 text-sm text-white">
                          {focus}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <ChipSection title="Must-have skills" items={interviewPrep.jobProfile.mustHaveSkills} color="bg-emerald-600" />
                      <ChipSection title="Preferred skills" items={interviewPrep.jobProfile.preferredSkills} color="bg-blue-700" />
                    </div>
                  </div>
                </div>

                <ListSection title="Responsibilities Falcon detected" items={interviewPrep.jobProfile.responsibilities} />

                <div className="space-y-4">
                  {interviewPrep.interviewQuestions.map((item, index) => (
                    <div key={`${index + 1}-${item.question}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Question {index + 1} · {item.category}
                          </p>
                          <h3 className="mt-2 text-xl font-bold text-slate-950">{item.question}</h3>
                        </div>

                        <div className="flex gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                          <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700">{item.difficulty}</span>
                          <span className={`rounded-full px-3 py-2 ${item.candidateRisk === "high" ? "bg-rose-100 text-rose-700" : item.candidateRisk === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                            Risk {item.candidateRisk}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-900">Why this is asked</p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{item.whyThisIsAsked}</p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-900">What they evaluate</p>
                          <ul className="mt-2 space-y-2 text-sm text-slate-700">
                            {item.whatTheyEvaluate.map((value) => (
                              <li key={value}>• {value}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-blue-50 p-4">
                          <p className="text-sm font-semibold text-slate-900">What a strong answer should include</p>
                          <ul className="mt-2 space-y-2 text-sm text-slate-700">
                            {item.answerGuidance.map((value) => (
                              <li key={value}>• {value}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-2xl bg-amber-50 p-4">
                          <p className="text-sm font-semibold text-slate-900">Possible follow-up questions</p>
                          <ul className="mt-2 space-y-2 text-sm text-slate-700">
                            {item.followUps.map((value) => (
                              <li key={value}>• {value}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  Once the candidate profile and job description are both available, Falcon can generate 10 to 15 realistic interview questions with answer guidance, risk areas, and company-context focus.
                </p>
              </div>
            )}
          </SectionShell>
        </>
      )}
    </div>
  );
}
