export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              F
            </div>

            <span className="text-xl font-bold tracking-tight">
              Falcon
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#">Features</a>
            <a href="#">How it Works</a>
            <a href="#">Pricing</a>
            <a href="#">Blog</a>
          </nav>

          <button className="rounded-xl bg-slate-900 px-5 py-2 text-white transition hover:bg-slate-800">
            Start Free
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          AI Career Operating System
        </span>

        <h1 className="mt-8 max-w-5xl text-6xl font-extrabold leading-tight tracking-tight">
          Know Your Chances
          <br />
          Before You Apply.
        </h1>

        <p className="mt-8 max-w-3xl text-xl leading-8 text-slate-600">
          Falcon analyzes your resume, understands every job description,
          identifies missing skills, and tells you exactly what to improve
          before applying.
        </p>

        <div className="mt-12 flex gap-4">
          <button className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Start Free
          </button>

          <button className="rounded-xl border border-slate-300 px-8 py-4 font-semibold hover:bg-slate-100">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-400"></div>
            </div>
          </div>

          <div className="grid gap-10 p-10 md:grid-cols-2">

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Interview Probability
              </p>

              <h2 className="mt-3 text-6xl font-black text-blue-600">
                82%
              </h2>

              <div className="mt-8 rounded-2xl bg-green-50 p-5">
                <p className="font-semibold text-green-700">
                  Recommendation
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Apply Now
                </h3>

                <p className="mt-2 text-slate-600">
                  Strong resume match with only one minor skill gap.
                </p>
              </div>
            </div>

            <div className="space-y-4">

              <div className="rounded-xl border p-5">
                <p className="font-semibold">
                  Top Strengths
                </p>

                <ul className="mt-3 space-y-2 text-slate-600">
                  <li>✅ AWS</li>
                  <li>✅ Docker</li>
                  <li>✅ Terraform</li>
                </ul>
              </div>

              <div className="rounded-xl border p-5">
                <p className="font-semibold">
                  Missing Skill
                </p>

                <h3 className="mt-3 text-xl font-bold text-orange-500">
                  Helm
                </h3>

                <p className="mt-2 text-slate-600">
                  Learning Helm can significantly improve interview chances.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

    </main>
  );
} 