# Falcon — AI Career Operating System

Falcon is an intelligent job search platform that helps you make smarter career decisions. Upload your resume, analyze job descriptions, and get AI-powered guidance on whether to apply, improve first, or skip.

## 🎯 Core Features

### 📊 Decision Engine
Analyze any JD and get a clear verdict:
- **Apply Now** — You're a strong fit; apply with confidence
- **Improve First** — You have potential but need development in key areas
- **Skip** — Not aligned with your profile; focus on better matches

### 🎤 Interview Prep
For roles you're pursuing:
- 10–15 targeted questions based on the JD and your profile
- **Answer frameworks** — structure your responses
- **Evidence guidance** — specific stories to highlight from your experience
- **Mistake avoidance** — common pitfalls to sidestep for this role

### ✏️ Resume Tailoring
Get AI-generated suggestions to make your resume stand out:
- Keywords from the JD to incorporate
- Section rewrites to boost relevance
- Proof points to emphasize

### 💾 Saved Sessions
Track your analyses across all roles you've explored (Phase 2).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/sachinrajdev/falcon.git
cd falcon

# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env.local
# Add your OPENAI_API_KEY and LLAMAINDEX_API_KEY

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using Falcon.

---

## 📋 Pricing

**Phase 1 (Now):** All features free while we gather feedback.

**Phase 2 (TBD):** Pro tier (₹499/month) with unlimited analyses, full interview coaching, and cloud-backed saved sessions. See [PRICING_TIERS.md](./PRICING_TIERS.md) for full breakdown.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **LLM:** OpenAI Responses API (structured outputs)
- **PDF Parsing:** LlamaCloud
- **Persistence:** Browser localStorage (Phase 1), Firebase/Supabase (Phase 2)

---

## 📁 Project Structure

```
app/
  page.tsx              # Landing page
  upload/page.tsx       # Onboarding flow
  api/
    upload/route.ts     # Resume extraction
    decision/route.ts   # JD analysis & verdict
    interview-prep/route.ts  # Question generation
components/
  ResumeUploader.tsx    # Main UI component (all 4 steps)
lib/
  openai.ts            # OpenAI client
  llama.ts             # LlamaCloud client
  rateLimit.ts         # Rate limiting
```

---

## 🔄 How It Works

1. **Upload Resume** → Parsed via LlamaCloud, extracted to structured `CandidateProfile`
2. **Paste JD** → Analyzed against your profile
3. **Get Decision** → Decision Engine returns verdict + reasoning
4. **View Interview Prep** (optional) → Full 10–15 questions with coaching
5. **Save Session** → Bookmark for later (browser-local in Phase 1)

---

## 📊 Metrics We Track

To guide Phase 2:
- Daily/weekly active users
- Repeat analyses (same user, multiple JDs)
- Session save frequency
- Decision distribution (Apply Now % vs Improve First % vs Skip %)

---

## 🤝 Contributing

We're in early development. Issues and PRs welcome.

- **Feature requests:** Open an issue with the tag `enhancement`
- **Bugs:** Open an issue with the tag `bug`
- **Roadmap:** See [PRICING_TIERS.md](./PRICING_TIERS.md) for Phase 2+ plans

---

## 📄 License

MIT
