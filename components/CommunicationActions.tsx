"use client";

import { useMemo, useState } from "react";

type ResumeTailorResult = {
  professionalSummary: string;
  skills: string[];
  experienceBullets: string[];
  keywordAdditions: string[];
  recruiterNotes: string[];
};

type CoverLetterResult = {
  title: string;
  emailSubject: string;
  coverLetter: string;
  shortPitch: string;
  keyHighlights: string[];
  cautionNotes: string[];
};

type OutreachResult = {
  linkedInMessage: string;
  hrEmailSubject: string;
  hrEmailBody: string;
  referralMessage: string;
  followUpMessage: string;
  sendChecklist: string[];
};

type CandidateProfile = Record<string, unknown>;

type Props = {
  candidateProfile: CandidateProfile | null;
  jobDescription: string;
  tailoredResume: ResumeTailorResult | null;
};

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function copyText(content: string) {
  return navigator.clipboard.writeText(content);
}

export default function CommunicationActions({ candidateProfile, jobDescription, tailoredResume }: Props) {
  const [tone, setTone] = useState<"professional" | "confident" | "concise">("professional");
  const [recruiterName, setRecruiterName] = useState("");

  const [coverLetter, setCoverLetter] = useState<CoverLetterResult | null>(null);
  const [outreach, setOutreach] = useState<OutreachResult | null>(null);

  const [coverLoading, setCoverLoading] = useState(false);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canGenerate = Boolean(candidateProfile && jobDescription.trim());

  const fullCoverLetterText = useMemo(() => {
    if (!coverLetter) return "";

    return [
      coverLetter.title,
      "",
      `Subject: ${coverLetter.emailSubject}`,
      "",
      coverLetter.coverLetter,
      "",
      "Short pitch:",
      coverLetter.shortPitch,
      "",
      "Key highlights:",
      ...coverLetter.keyHighlights.map((item) => `- ${item}`),
      "",
      "Caution notes:",
      ...coverLetter.cautionNotes.map((item) => `- ${item}`),
    ].join("\n");
  }, [coverLetter]);

  const fullOutreachText = useMemo(() => {
    if (!outreach) return "";

    return [
      "LinkedIn message:",
      outreach.linkedInMessage,
      "",
      `HR email subject: ${outreach.hrEmailSubject}`,
      "HR email body:",
      outreach.hrEmailBody,
      "",
      "Referral message:",
      outreach.referralMessage,
      "",
      "Follow-up message:",
      outreach.followUpMessage,
      "",
      "Send checklist:",
      ...outreach.sendChecklist.map((item) => `- ${item}`),
    ].join("\n");
  }, [outreach]);

  async function generateCoverLetter() {
    if (!canGenerate) return;

    setCoverLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateProfile,
          jobDescription,
          tailoredResume,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Cover letter generation failed.");
      }

      setCoverLetter(data.coverLetter);
      setNotice("Cover letter generated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover letter generation failed.");
    } finally {
      setCoverLoading(false);
    }
  }

  async function generateOutreach() {
    if (!canGenerate) return;

    setOutreachLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/hr-outreach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateProfile,
          jobDescription,
          tailoredResume,
          recruiterName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "HR outreach generation failed.");
      }

      setOutreach(data.outreach);
      setNotice("HR outreach messages generated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "HR outreach generation failed.");
    } finally {
      setOutreachLoading(false);
    }
  }

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Next Step</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-950">Cover Letter + HR Outreach</h3>
        <p className="mt-2 text-sm text-slate-600">
          Generate role-specific communication after resume tailoring.
        </p>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
      {notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-900">Cover letter tone</span>
          <select
            value={tone}
            onChange={(event) => setTone(event.target.value as "professional" | "confident" | "concise")}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="professional">Professional</option>
            <option value="confident">Confident</option>
            <option value="concise">Concise</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-900">Recruiter name (optional)</span>
          <input
            value={recruiterName}
            onChange={(event) => setRecruiterName(event.target.value)}
            placeholder="Priya Sharma"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generateCoverLetter}
          disabled={!canGenerate || coverLoading}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {coverLoading ? "Generating cover letter..." : "Generate cover letter"}
        </button>

        <button
          type="button"
          onClick={generateOutreach}
          disabled={!canGenerate || outreachLoading}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {outreachLoading ? "Generating HR outreach..." : "Generate HR outreach"}
        </button>
      </div>

      {coverLetter ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h4 className="text-lg font-bold text-slate-950">Cover letter output</h4>
          <p className="text-sm font-semibold text-slate-700">{coverLetter.emailSubject}</p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{coverLetter.coverLetter}</p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                void copyText(fullCoverLetterText);
                setNotice("Cover letter copied.");
              }}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Copy cover letter
            </button>
            <button
              type="button"
              onClick={() => downloadTextFile("cover-letter.txt", fullCoverLetterText)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Download .txt
            </button>
          </div>
        </div>
      ) : null}

      {outreach ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h4 className="text-lg font-bold text-slate-950">HR outreach output</h4>
          <p className="text-sm font-semibold text-slate-700">LinkedIn message</p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{outreach.linkedInMessage}</p>

          <p className="text-sm font-semibold text-slate-700">HR email subject</p>
          <p className="text-sm leading-7 text-slate-800">{outreach.hrEmailSubject}</p>

          <p className="text-sm font-semibold text-slate-700">HR email body</p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{outreach.hrEmailBody}</p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                void copyText(fullOutreachText);
                setNotice("Outreach messages copied.");
              }}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Copy outreach
            </button>
            <button
              type="button"
              onClick={() => downloadTextFile("hr-outreach.txt", fullOutreachText)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Download .txt
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
