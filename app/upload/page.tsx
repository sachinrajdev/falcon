import ResumeUploader from "@/components/ResumeUploader";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-20">

        <h1 className="text-5xl font-bold">
          Build Your Candidate Profile
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Start with your resume. Pragati will extract the profile it needs before comparing you against a real job description.
        </p>

        <ResumeUploader />

      </div>
    </main>
  );
}
