import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-slate-300 mb-8">Page not found</p>
        <p className="text-slate-400 mb-12 max-w-md">
          The page you're looking for doesn't exist. Let's get you back to analyzing your career path.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          Back to Pragati
        </Link>
      </div>
    </main>
  );
}
