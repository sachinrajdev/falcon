import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen scroll-smooth bg-white text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              P
            </div>

            <span className="text-xl font-bold tracking-tight">
              Pragati
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#features" className="transition hover:text-blue-700">Features</a>
            <a href="#how-it-works" className="transition hover:text-blue-700">How it Works</a>
            <a href="#pricing" className="transition hover:text-blue-700">Pricing</a>
            <a href="#blog" className="transition hover:text-blue-700">Blog</a>
          </nav>

          <Link
            href="/upload"
            className="rounded-xl bg-slate-900 px-5 py-2 text-white transition hover:bg-slate-800"
          >
            Start Free
          </Link>
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
          Pragati analyzes your resume, understands every job description,
          identifies missing skills, and tells you exactly what to improve
          before applying.
        </p>

        <div className="mt-12 flex gap-4">
          <Link
            href="/upload"
            className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700"
          >
            Start Free
          </Link>

          <a
            href="#demo"
            className="rounded-xl border border-slate-300 px-8 py-4 font-semibold transition hover:bg-slate-100"
          >
            Watch Demo
          </a>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="demo" className="mx-auto max-w-7xl px-6 pb-24 scroll-mt-24">
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

      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
            Features
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight">
            Built to increase interview chances, not just generate content.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Pragati stays focused on one outcome: helping candidates decide where to apply, what to improve, and how to prepare for the interview that matters.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xl font-bold">Decision Engine</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Pragati compares the candidate profile against the JD and returns Apply Now, Improve First, or Skip.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xl font-bold">Resume Tailoring</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Role-specific guidance on summary focus, evidence gaps, bullets to emphasize, and keywords to include naturally.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xl font-bold">Interview Prep</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Professional interview questions with answer coaching, evidence prompts, mistakes to avoid, and follow-ups.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xl font-bold">Saved Sessions</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Restore recent local analyses and continue improving without rerunning every step from scratch.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-200 bg-slate-50 py-24 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
              How It Works
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight">
              A simple four-step workflow with one clear outcome.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Step 1</p>
              <h3 className="mt-3 text-xl font-bold">Upload resume</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Pragati extracts the candidate profile: role, years, skills, projects, certifications, and preparation areas.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Step 2</p>
              <h3 className="mt-3 text-xl font-bold">Paste the job description</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Pragati extracts the target job profile, must-have skills, responsibilities, and role context.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Step 3</p>
              <h3 className="mt-3 text-xl font-bold">Get the decision</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">The Decision Engine returns Apply Now, Improve First, or Skip with reasoning and next actions.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Step 4</p>
              <h3 className="mt-3 text-xl font-bold">Prepare for the interview</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Generate role-specific questions, answer coaching, and resume tailoring before applying.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight">
            Start free, then pay only when Pragati saves real effort.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Free</p>
            <h3 className="mt-3 text-3xl font-bold">Get started</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Upload a resume, analyze a job description, and see how Pragati decides what to do next.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>• Resume profile extraction</li>
              <li>• Job fit decision</li>
              <li>• Basic interview prep</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-900 bg-slate-900 p-8 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Planned Pro</p>
            <h3 className="mt-3 text-3xl font-bold">For serious job search</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Save role history, track improvement over time, unlock deeper tailoring, and prepare faster for interviews that matter.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li>• Persistent dashboard</li>
              <li>• Advanced answer coaching</li>
              <li>• Deeper resume targeting</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="blog" className="border-t border-slate-200 bg-slate-50 py-24 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
              Blog
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight">
              Product thinking and job-search strategy, not generic career fluff.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Product Note</p>
              <h3 className="mt-3 text-xl font-bold">Why Pragati uses Apply Now, Improve First, or Skip</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                The real problem is application triage, not another generic resume score.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Interview Prep</p>
              <h3 className="mt-3 text-xl font-bold">How to use JD-specific mock questions properly</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Good prep is not memorizing answers. It is matching evidence to the role.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Resume Strategy</p>
              <h3 className="mt-3 text-xl font-bold">What to tailor on a resume before applying</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Focus on evidence, keywords in context, and the right experience signals for the target job.
              </p>
            </article>
          </div>
        </div>
      </section>

    </main>
  );
} 
