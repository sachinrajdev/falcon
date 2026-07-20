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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    const uploadedFile = acceptedFiles[0];

    if (uploadedFile.type !== "application/pdf") {
      alert("Please upload a PDF resume.");
      return;
    }

    setFile(uploadedFile);
    setAnalysis(null);
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

  return (
    <div className="mt-10 space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <StepCard
          number={1}
          title="Upload resume"
          description="Start with your current resume so Falcon can extract your candidate profile."
          status={analysis ? "done" : loading ? "active" : "active"}
        />
        <StepCard
          number={2}
          title="Confirm profile"
          description="Review the extracted role, experience, skills, projects, and certifications."
          status={analysis ? "active" : "upcoming"}
        />
        <StepCard
          number={3}
          title="Paste job description"
          description="Add one target role so Falcon can extract the job profile and compare fit."
          status={analysis ? "upcoming" : "upcoming"}
        />
        <StepCard
          number={4}
          title="Get decision"
          description="Receive Apply Now, Improve First, or Skip with clear reasoning and next steps."
          status="upcoming"
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
                  disabled={!jobDescription.trim()}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Continue to job analysis
                </button>
              </div>
            </div>
          </SectionShell>

          <SectionShell
            eyebrow="Step 4"
            title="What the decision screen will return"
            description="Once the Job Intelligence and Decision Engine pieces are wired, Falcon should stop showing generic scores and instead answer exactly what the user should do next for that specific role."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Verdict</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">Apply Now</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Strong match against must-have requirements with only minor gaps.
                </p>
              </div>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Verdict</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">Improve First</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Close enough to target, but missing skills need a short improvement plan first.
                </p>
              </div>
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-700">Verdict</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">Skip</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Core requirements or seniority are too far off to justify the application right now.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-700">
                Each verdict should include why, interview probability, resume strength, skill gap, critical missing skills, top strengths, estimated time to improve, and a personalized checklist.
              </p>
            </div>
          </SectionShell>
        </>
      )}
    </div>
  );
}
