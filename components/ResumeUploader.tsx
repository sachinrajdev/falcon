"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import CommunicationActions from "@/components/CommunicationActions";

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

type DecisionResult = {
  jobProfile: {
    company: string;
    roleTitle: string;
    seniority: string;
    employmentType: string;
    location: string;
    mustHaveSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
  };
  verdict: "Apply Now" | "Improve First" | "Skip";
  why: string;
  interviewProbability: number;
  resumeStrength: number;
  skillGap: number;
  criticalMissingSkills: string[];
  topStrengthsForThisRole: string[];
  estimatedTimeToImprove: string;
  nextStepsChecklist: string[];
  resumeTailoring: {
    summaryFocus: string;
    bulletsToEmphasize: string[];
    missingEvidenceToAdd: string[];
    keywordsToNaturallyInclude: string[];
  };
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
    answerFramework: string[];
    resumeEvidenceToUse: string[];
    mistakesToAvoid: string[];
    followUps: string[];
  }>;
};

type ResumeTailorResult = {
  professionalSummary: string;
  skills: string[];
  experienceBullets: string[];
  keywordAdditions: string[];
  recruiterNotes: string[];
};

type SavedSession = {
  id: string;
  createdAt: string;
  fileName: string | null;
  candidateProfile: CandidateProfile;
  resumeText: string;
  jobDescription: string;
  decision: DecisionResult;
  interviewPrep: InterviewPrepResult | null;
  tailoredResume: ResumeTailorResult | null;
};

const STORAGE_KEY = "pragati.savedSessions.v1";

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
  const [resumeText, setResumeText] = useState("");
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrepResult | null>(null);
  const [tailoredResume, setTailoredResume] = useState<ResumeTailorResult | null>(null);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [prepLoading, setPrepLoading] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as SavedSession[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("Failed to load saved Pragati sessions", err);
      return [];
    }
  });

  const persistSessions = useCallback((nextSessions: SavedSession[]) => {
    setSavedSessions(nextSessions);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
  }, []);

  const saveCurrentSession = useCallback((options?: {
    nextInterviewPrep?: InterviewPrepResult | null;
    nextTailoredResume?: ResumeTailorResult | null;
  }) => {
    if (!analysis || !decision || !jobDescription.trim()) return;

    const session: SavedSession = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      fileName: file?.name ?? null,
      candidateProfile: analysis,
      resumeText,
      jobDescription,
      decision,
      interviewPrep: options?.nextInterviewPrep ?? interviewPrep,
      tailoredResume: options?.nextTailoredResume ?? tailoredResume,
    };

    const deduped = savedSessions.filter(
      (item) => !(item.jobDescription === session.jobDescription && item.decision.jobProfile.roleTitle === session.decision.jobProfile.roleTitle)
    );

    persistSessions([session, ...deduped].slice(0, 8));
  }, [analysis, decision, file?.name, interviewPrep, jobDescription, persistSessions, resumeText, savedSessions, tailoredResume]);

  const restoreSession = useCallback((session: SavedSession) => {
    setFile(session.fileName ? new File([], session.fileName, { type: "application/pdf" }) : null);
    setAnalysis(session.candidateProfile);
    setResumeText(session.resumeText ?? "");
    setDecision(session.decision);
    setJobDescription(session.jobDescription);
    setInterviewPrep(session.interviewPrep);
    setTailoredResume(session.tailoredResume);
    setError(null);
  }, []);

  const analyzeFit = useCallback(async () => {
    if (!analysis || !jobDescription.trim()) return;

    setDecisionLoading(true);
    setInterviewPrep(null);
    setTailoredResume(null);
    setError(null);

    try {
      const response = await fetch("/api/decision", {
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
        throw new Error(data.error || "Decision analysis failed");
      }

      setDecision(data.decision);
      setInterviewPrep(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Decision analysis failed.");
    } finally {
      setDecisionLoading(false);
    }
  }, [analysis, jobDescription]);

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
      saveCurrentSession({ nextInterviewPrep: data.interviewPrep });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Interview prep failed.");
    } finally {
      setPrepLoading(false);
    }
  }, [analysis, jobDescription, saveCurrentSession]);
  
  const generateResumeTailor = useCallback(async () => {
  if (!analysis || !jobDescription.trim()) return;

  setTailorLoading(true);
  setTailoredResume(null);
  setError(null);

  try {
    const response = await fetch("/api/resume-tailor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        candidateProfile: analysis,
        resumeText,
        jobDescription: jobDescription.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Resume tailoring failed.");
    }

    if (!data.tailoredResume) {
      throw new Error("Resume tailor API did not return tailoredResume.");
    }

    setTailoredResume(data.tailoredResume);
    saveCurrentSession({ nextTailoredResume: data.tailoredResume });
  } catch (err) {
    console.error(err);

    setError(
      err instanceof Error
        ? err.message
        : "Resume tailoring failed."
    );
  } finally {
    setTailorLoading(false);
  }
}, [analysis, jobDescription, resumeText, saveCurrentSession]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    const uploadedFile = acceptedFiles[0];

    if (uploadedFile.type !== "application/pdf") {
      alert("Please upload a PDF resume.");
      return;
    }

    setFile(uploadedFile);
    setAnalysis(null);
    setResumeText("");
    setDecision(null);
    setInterviewPrep(null);
    setTailoredResume(null);
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
      setResumeText(typeof data.resumeText === "string" ? data.resumeText : "");
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
  const stepThreeStatus: "done" | "active" | "upcoming" = analysis
    ? hasJobDescription
      ? "done"
      : "active"
    : "upcoming";
  const stepFourStatus: "done" | "active" | "upcoming" = decision
    ? "done"
    : decisionLoading
      ? "active"
      : hasJobDescription
        ? "active"
        : "upcoming";

  const decisionTone = decision?.verdict === "Apply Now"
    ? "border-emerald-200 bg-emerald-50"
    : decision?.verdict === "Improve First"
      ? "border-amber-200 bg-amber-50"
      : "border-rose-200 bg-rose-50";

  return (
    <div className="mt-10 space-y-8">
      {savedSessions.length > 0 ? (
        <SectionShell
          eyebrow="Saved Dashboard"
          title="Recent Pragati sessions"
          description="Until auth is added, Pragati saves your recent analyses locally in this browser so you can come back and restore them."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {savedSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => restoreSession(session)}
                className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {new Date(session.createdAt).toLocaleString()}
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">
                  {session.decision.jobProfile.roleTitle}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {session.decision.jobProfile.company} · {session.decision.verdict}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700 line-clamp-3">
                  {session.decision.why}
                </p>
                <p className="mt-4 text-sm font-semibold text-blue-700">Restore session</p>
              </button>
            ))}
          </div>
        </SectionShell>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <StepCard
          number={1}
          title="Upload resume"
          description="Start with your current resume so Pragati can extract your candidate profile."
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
          description="Add one target role so Pragati can extract the job profile and compare fit."
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
            Pragati is working
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Extracting your candidate profile from the resume.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            This is the first step only. Pragati is building the profile it will later compare against a specific job description.
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
            description="This is the information Pragati will carry into the Job Intelligence and Decision Engine steps. Review it before comparing yourself against a specific job."
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
            description="Pragati should not decide from the resume alone. The real product decision happens after it extracts the job profile and compares both sides."
          >
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <label htmlFor="job-description" className="text-sm font-semibold text-slate-900">
                Target job description
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) => {
                  setJobDescription(event.target.value);
                  setDecision(null);
                  setInterviewPrep(null);
                  setTailoredResume(null);
                }}
                placeholder="Paste the full job description here. Pragati will use it in the next step to extract the job profile and return Apply Now, Improve First, or Skip."
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
                  onClick={analyzeFit}
                  disabled={!jobDescription.trim()}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Analyze fit
                </button>
              </div>
            </div>
          </SectionShell>

          <SectionShell
            eyebrow="Step 4"
            title="Decision for this exact job"
            description="Pragati should decide whether you should apply now, improve first, or skip, then optionally generate interview prep for the same role."
          >
            {decisionLoading ? (
              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Pragati is deciding</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  Comparing your candidate profile against the job description.
                </p>
              </div>
            ) : decision ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`rounded-3xl border p-5 ${decisionTone}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Pragati verdict</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-950">{decision.verdict}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-700">{decision.why}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white/70 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Interview probability</p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">{decision.interviewProbability}%</p>
                      </div>
                      <div className="rounded-2xl bg-white/70 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Resume strength</p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">{decision.resumeStrength}%</p>
                      </div>
                      <div className="rounded-2xl bg-white/70 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Skill gap</p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">{decision.skillGap}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Target role</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-950">{decision.jobProfile.roleTitle}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {decision.jobProfile.company} · {decision.jobProfile.seniority} · {decision.jobProfile.employmentType}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{decision.jobProfile.location}</p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <ChipSection title="Must-have skills" items={decision.jobProfile.mustHaveSkills} color="bg-emerald-600" />
                      <ChipSection title="Preferred skills" items={decision.jobProfile.preferredSkills} color="bg-blue-700" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ChipSection
                    title="Critical missing skills"
                    items={decision.criticalMissingSkills.length ? decision.criticalMissingSkills : ["No critical missing skills"]}
                    color="bg-rose-600"
                  />
                  <ChipSection
                    title="Top strengths for this role"
                    items={decision.topStrengthsForThisRole}
                    color="bg-emerald-700"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ListSection title="Next steps checklist" items={decision.nextStepsChecklist} />
                  <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-bold">Estimated time to improve</h3>
                    <p className="text-2xl font-bold text-slate-950">{decision.estimatedTimeToImprove}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Pragati uses this to decide whether the role is ready now, should be improved for first, or should be skipped.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-bold">Resume summary focus</h3>
                    <p className="leading-7 text-slate-700">{decision.resumeTailoring.summaryFocus}</p>
                  </div>
                  <ChipSection
                    title="Keywords to naturally include"
                    items={decision.resumeTailoring.keywordsToNaturallyInclude}
                    color="bg-slate-900"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ListSection title="Bullets to emphasize on the resume" items={decision.resumeTailoring.bulletsToEmphasize} />
                  <ListSection title="Missing evidence to add before applying" items={decision.resumeTailoring.missingEvidenceToAdd} />
                </div>

                <ListSection title="Responsibilities Pragati detected" items={decision.jobProfile.responsibilities} />

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Optional next layer</p>
                      <h3 className="mt-2 text-xl font-bold text-slate-950">Generate interview prep for this same role</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Once Pragati has decided on the role fit, it can generate job-specific mock interview questions and answer guidance.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={generateResumeTailor}
                      disabled={tailorLoading}
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {tailorLoading ? "Tailoring Resume..." : "✨ Tailor Resume"}
                    </button>

                    <button
                      type="button"
                      onClick={generateInterviewPrep}
                      disabled={prepLoading}
                      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {prepLoading ? "Generating interview prep..." : "Generate interview prep"}
                    </button>
                  </div>
                </div>

                {prepLoading ? (
                  <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Pragati is preparing</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      Generating professional interview questions from the job description and your profile.
                    </p>
                  </div>
                ) : null}

                {interviewPrep ? (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Likely interview focus</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {interviewPrep.likelyInterviewFocus.map((focus) => (
                          <span key={focus} className="rounded-full bg-slate-900 px-3 py-2 text-sm text-white">
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>

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
                              <p className="text-sm font-semibold text-slate-900">Answer framework</p>
                              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                                {item.answerFramework.map((value) => (
                                  <li key={value}>• {value}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl bg-emerald-50 p-4">
                              <p className="text-sm font-semibold text-slate-900">Resume evidence to use</p>
                              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                                {item.resumeEvidenceToUse.map((value) => (
                                  <li key={value}>• {value}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="rounded-2xl bg-rose-50 p-4">
                              <p className="text-sm font-semibold text-slate-900">Mistakes to avoid</p>
                              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                                {item.mistakesToAvoid.map((value) => (
                                  <li key={value}>• {value}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">Possible follow-up questions</p>
                            <ul className="mt-2 space-y-2 text-sm text-slate-700">
                              {item.followUps.map((value) => (
                                <li key={value}>• {value}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {tailoredResume ? (
                  <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                      Resume Tailor
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
                      ✨ ATS Optimized Resume
                    </h2>

                    <div className="mt-6 rounded-2xl bg-white p-5">
                      <h3 className="mb-3 text-lg font-bold">
                        Professional Summary
                      </h3>

                      <p className="leading-7 text-slate-700">
                        {tailoredResume.professionalSummary}
                      </p>
                    </div>

                    <div className="mt-6 rounded-2xl bg-white p-5">
                      <h3 className="mb-3 text-lg font-bold">
                        Optimized Skills
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {tailoredResume.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-blue-600 px-3 py-2 text-sm text-white"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-white p-5">
                      <h3 className="mb-3 text-lg font-bold">
                        Experience Bullets
                      </h3>

                      <ul className="space-y-3">
                        {tailoredResume.experienceBullets.map((bullet) => (
                          <li key={bullet}>• {bullet}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 rounded-2xl bg-white p-5">
                      <h3 className="mb-3 text-lg font-bold">
                        JD Keywords Added
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {tailoredResume.keywordAdditions.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full bg-emerald-600 px-3 py-2 text-sm text-white"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-white p-5">
                      <h3 className="mb-3 text-lg font-bold">
                        Recruiter Notes
                      </h3>

                      <ul className="space-y-3">
                        {tailoredResume.recruiterNotes.map((note) => (
                          <li key={note}>• {note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}

                {analysis && jobDescription.trim() ? (
                  <CommunicationActions
                    candidateProfile={analysis}
                    jobDescription={jobDescription}
                    tailoredResume={tailoredResume}
                  />
                ) : null}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  Once the candidate profile and job description are both available, Pragati can decide whether you should apply now, improve first, or skip before moving into interview prep.
                </p>
              </div>
            )}
          </SectionShell>
        </>
      )}
    </div>
  );
}
