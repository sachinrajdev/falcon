# Falcon Pricing Tiers

## 🆓 Free Tier
**$0 / Forever**

### What You Get
- **1 Resume Upload** (per 7 days)
- **1 Job Description Analysis** (per 7 days)
- **Decision Engine**: Apply Now / Improve First / Skip verdict
- **Basic Resume Fit Score** (0-100, high-level feedback)
- **Interview Prep Preview**: First 3 questions only
- **No Interview Coaching**: Answers are basic templates, not personalized
- **No Resume Tailoring**: General fit feedback only
- **No Saved Sessions**: Results are cleared after browser close
- **No Answer Samples**: No editable candidate profile

### Positioning
*Try Falcon free and see if this role is worth your time.*

---

## 💎 Pro Tier
**₹499 / Month**

### What You Get (Everything in Free, Plus)
- **Unlimited Resume Uploads**
- **Unlimited Job Analyses** (same resume, multiple JDs)
- **Full Interview Prep**: All 10–15 questions with coaching
  - Answer framework (how to structure your response)
  - Evidence to highlight (specific stories from your profile)
  - Mistakes to avoid (common pitfalls, tailor to this role)
- **Resume Tailoring**: AI rewrites key sections to match JD keywords
- **Saved Sessions**: Cloud-backed (login required)
  - View past analysis results
  - Revisit interview prep for roles you've analyzed
  - Track your prep progress
- **Candidate Profile Editor**: Refine your experience, skills, achievements
- **Sample Answers** (optional feature): See 1–2 real-world answer examples per question
- **Decision Reasoning**: Full audit trail of why Falcon said "Apply Now" vs "Improve First"

### Positioning
*Go deep on roles you're serious about. Prep smarter, not harder.*

---

## 🎯 Key Conversion Levers

### Why Free Users Upgrade
1. **Hit the 1 analysis/week cap** → frustration → try Pro
2. **See preview of Interview Prep** → want full 15 questions → upgrade
3. **Lose session after browser close** → want to save & revisit → upgrade
4. **Analyze same resume against 5 JDs** → "unlimited would save me time" → upgrade

### Why ₹399 Works
- **Accessible**: ~$5 USD for early adopter, 1–2 coffee budget
- **Friction-free first try**: Free tier is generous enough to validate Falcon's value
- **Aligned with job search urgency**: Someone analyzing 5 roles is job-searching seriously and will pay

---

## Implementation Roadmap

### Phase 1 (MVP): Free Tier Only
- All current features ship as free
- No paywall, no auth required (browser-local sessions only)
- Gather signal on usage, favorites, repeat analyses

### Phase 2: Launch Pro (Week 2–3)
- Add auth (Google OAuth, email)
- Cloud persistence for sessions
- Usage metering on backend (1 free analysis/week, unlimited on Pro)
- Paywall at decision screen if free tier is exhausted
- Add Resume Tailoring API

### Phase 3: Optimize (Week 4+)
- A/B test paywall messaging
- Add sample answers feature
- Measure upgrade rate, churn, LTV
