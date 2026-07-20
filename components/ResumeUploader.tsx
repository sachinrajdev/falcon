"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type FalconAnalysis = {
  careerScore: {
    overall: number;
    ats: number;
    technical: number;
    presentation: number;
    marketDemand: number;
  };
  role: string;
  experience: string;
  skills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  careerLevel: string;
  industry: string;
  salaryRange: string;
  topCompanies: string[];
};

function ScoreCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-2 text-3xl font-bold">{value}%</h3>
      <div className="mt-3 h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-blue-600"
          style={{ width: `${value}%` }}
        />
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

export default function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<FalconAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    const uploadedFile = acceptedFiles[0];

    if (uploadedFile.type !== "application/pdf") {
      alert("Please upload a PDF resume.");
      return;
    }

    setFile(uploadedFile);
    setAnalysis(null);
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
      alert("Upload failed.");
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
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-3xl border-2 border-dashed p-16 text-center transition ${
          isDragActive
            ? "border-blue-600 bg-blue-50"
            : "border-slate-300 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-6xl">📄</div>
        <h2 className="mt-6 text-2xl font-bold">Upload Your Resume</h2>
        <p className="mt-2 text-slate-500">Drag & Drop PDF or Click</p>
      </div>

      {file && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-bold">Uploaded Resume</h3>
          <p className="mt-2">{file.name}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border bg-blue-50 p-6">
          Analyzing your resume with Falcon AI...
        </div>
      )}

      {analysis && (
        <>
          <div className="rounded-3xl bg-slate-900 p-8 text-white">
  <h2 className="text-3xl font-bold">🦅 Falcon AI Career Report</h2>

  <h3 className="mt-6 text-2xl font-bold">
    {analysis.role}
  </h3>

  <div className="mt-4 flex flex-wrap gap-6 text-slate-300">
    <p>
      💼 {analysis.experience}
    </p>

    <p>
      🚀 {analysis.careerLevel}
    </p>

    <p>
      🏢 {analysis.industry}
    </p>
  </div>
</div>  

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-bold">📝 AI Summary</h3>
            <p className="leading-7 text-slate-700">{analysis.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <ScoreCard title="Overall" value={analysis.careerScore.overall} />
            <ScoreCard title="ATS" value={analysis.careerScore.ats} />
            <ScoreCard title="Technical" value={analysis.careerScore.technical} />
            <ScoreCard title="Presentation" value={analysis.careerScore.presentation} />
            <ScoreCard title="Market" value={analysis.careerScore.marketDemand} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-green-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold">💰 Estimated Salary</h3>
              <p className="mt-4 text-3xl font-bold text-green-700">
                {analysis.salaryRange}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-bold">🏢 Best Matching Companies</h3>
              <div className="flex flex-wrap gap-2">
                {(analysis.topCompanies ?? []).map((company) => (
                  <span
                    key={company}
                    className="rounded-full bg-blue-600 px-4 py-2 text-white"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ChipSection title="Skills" items={analysis.skills ?? []} color="bg-green-600" />
          <ChipSection title="Missing Skills" items={analysis.missingSkills ?? []} color="bg-red-500" />
          <ListSection title="Strengths" items={analysis.strengths ?? []} />
          <ListSection title="Weaknesses" items={analysis.weaknesses ?? []} />
          <ListSection title="AI Suggestions" items={analysis.suggestions ?? []} />
        </>
      )}
    </div>
  );
}
