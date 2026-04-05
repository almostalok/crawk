/* ── System prompts for each document type ───────────────────────────────── */

const INTERVIEW_PROMPT = `You are an expert hiring analyst. Given ANY unstructured text, extract structured scorecards.
If the text contains multiple distinct interviews or candidates, extract one object for each.
Return ONLY valid JSON — a JSON ARRAY of objects. Each object MUST have these exact fields:
[{
  "overall_recommendation": one of ["Strong Hire","Hire","Lean Hire","Lean No Hire","No Hire","Strong No Hire"],
  "confidence": one of ["High","Medium","Low"],
  "scores": {
    "technical_skill": integer 1-5 or null,
    "communication":   integer 1-5 or null,
    "problem_solving": integer 1-5 or null,
    "culture_fit":     integer 1-5 or null,
    "leadership":      integer 1-5 or null
  },
  "key_strengths":    2-4 short strings,
  "key_concerns":     0-3 short strings,
  "standout_quote":   most signal-rich sentence verbatim or null,
  "seniority_signal": one of ["Junior","Mid","Senior","Staff/Principal","Unclear"],
  "feedback_quality": one of ["Detailed","Moderate","Thin"],
  "candidate_name":   inferred name or null,
  "role":             inferred role or null,
  "reasoning":        2-3 sentence explanation
}]`;

const JD_PROMPT = `You are an expert recruiter and data analyst. Given ANY raw job posting text, extract structured job records.
If the text contains multiple distinct job descriptions, extract one object for each distinct job.
Return ONLY valid JSON — a JSON ARRAY of objects. Each object MUST have these exact fields:
[{
  "job_title": string or null,
  "company_name": string or null,
  "location": string or null,
  "remote_policy": one of ["Remote","Hybrid","On-site","Unclear"],
  "employment_type": one of ["Full-time","Part-time","Contract","Freelance","Unclear"],
  "seniority_level": one of ["Intern","Junior","Mid","Senior","Lead","Director","VP","Unclear"],
  "department": string or null,
  "reports_to": string or null,
  "team_size": string or null,
  "salary_min": number or null,
  "salary_max": number or null,
  "salary_currency": string or null,
  "salary_period": one of ["hourly","monthly","annual"] or null,
  "required_skills": array of strings,
  "preferred_skills": array of strings,
  "key_responsibilities": array of 3-6 concise strings,
  "required_qualifications": array of strings,
  "benefits_mentioned": array of strings,
  "application_contact": string or null,
  "summary": 1-2 sentence overview
}]`;

const CANDIDATE_PROMPT = `You are an expert talent acquisition specialist. Given ANY unstructured candidate text, extract structured candidate profiles.
If the text contains multiple distinct candidates or responses, extract one object for each.
Return ONLY valid JSON — a JSON ARRAY of objects. Each object MUST have these exact fields:
[{
  "candidate_name": string or null,
  "role_applied": string or null,
  "response_quality": one of ["Strong","Good","Average","Weak"],
  "experience_level": one of ["Junior","Mid","Senior","Staff/Principal","Unclear"],
  "years_of_experience": number or null,
  "claimed_skills": array of strings,
  "communication_score": integer 1-5,
  "key_themes": array of 2-5 strings,
  "green_flags": array of strings,
  "red_flags": array of strings,
  "quantified_achievements": array of strings,
  "recommended_follow_up": array of 2-4 questions for the screen call,
  "current_company": string or null,
  "contact_info": string or null,
  "summary": 2-3 sentence assessment
}]`;

const FEEDBACK_PROMPT = `You are an expert organisational analyst. Given ANY internal company text, extract structured feedback records.
If the text contains distinct feedback instances (e.g. from multiple people, or discussing distinct topics), extract one object for each.
Return ONLY valid JSON — a JSON ARRAY of objects. Each object MUST have these exact fields:
[{
  "subject": 1-line summary,
  "about_category": one of ["Person","Team","Process","Product","Hiring","Culture","Compensation","Other"],
  "sentiment": one of ["Positive","Negative","Neutral","Mixed"],
  "urgency": one of ["High","Medium","Low"],
  "category": one of ["Performance","Process","Morale","Compensation","Hiring","Technical Debt","Other"],
  "mentioned_people": array of names,
  "mentioned_teams": array of team names,
  "key_points": array of 3-6 concise factual observations,
  "action_items": array of strings,
  "risks_flagged": array of strings,
  "positive_signals": array of strings,
  "author_role": inferred role or null,
  "summary": 2-3 sentence neutral summary
}]`;

/* ── Document type definitions ───────────────────────────────────────────── */
export const DOC_TYPES = {
  interview_notes: {
    id: "interview_notes", label: "Interview Notes", icon: "📝",
    description: "Panel notes, recruiter feedback, interview comments",
    prompt: INTERVIEW_PROMPT,
    examples: [
      { label: "Strong hire", text: `Honestly one of the best technical interviews I've done in a while. She walked us through her system design approach methodically — started with clarifying requirements which not everyone does — and her answer on sharding was genuinely impressive. Communication was crisp, no hand-waving. The coding round was clean, O(n log n) solution on the first try with a good explanation of the tradeoffs. Strong yes from me.` },
      { label: "Mixed signals", text: `Technical knowledge seems fine on the surface but kept getting defensive when I pushed back on his design choices. Couldn't really explain why he'd chosen a particular approach — felt like he'd memorized solutions rather than understood them. Communication was a problem, answers were very long and meandering. Might be okay as an IC but I don't see growth potential here. Probably a pass for me.` },
      { label: "Thin feedback", text: `Good candidate. Seemed knowledgeable. Answered questions. Was a bit nervous at first but warmed up. I think she'd be fine. Recommend moving forward.` },
      { label: "Strong no hire", text: `This was not a good interview. Completely unprepared for behavioral questions. The technical round exposed significant gaps — couldn't implement a basic BFS without heavy hints and didn't understand why. Also showed up 10 minutes late without acknowledgment. Strong no from the whole panel.` },
    ],
  },
  job_description: {
    id: "job_description", label: "Job Description", icon: "📋",
    description: "Raw job postings from emails, docs, or job boards",
    prompt: JD_PROMPT,
    examples: [
      { label: "Engineering JD", text: `We're looking for a Senior Full-Stack Engineer to join our product team. You'll own end-to-end delivery of new features across React and Node.js. Strong proficiency in TypeScript and PostgreSQL required. 5+ years experience. Compensation: $140k–$175k + equity. Remote-first. Reports to Head of Platform Engineering.` },
      { label: "PM role", text: `Product Manager, Growth — Series B SaaS company. You'll drive our activation and retention funnel, working cross-functionally with engineering and design. 3+ years PM experience, SQL proficiency, strong analytical mindset. Location: New York or remote.` },
      { label: "Design role", text: `UX Designer (Mid-level) — 40-person startup building DevOps tooling. Own our design system and lead user research. Figma required, Framer a bonus. Report to CPO. Hybrid — 2 days in London office. Competitive package including EMI options.` },
      { label: "Data role", text: `Data Analyst — Marketing team. Build dashboards in Looker, own attribution modelling. Requirements: SQL (advanced), Python (basic), GA4 or Amplitude. 2+ years analytics. Contract, 6 months. $75–90/hr.` },
    ],
  },
  candidate_response: {
    id: "candidate_response", label: "Candidate Response", icon: "👤",
    description: "Cover letters, emails, self-assessments, application text",
    prompt: CANDIDATE_PROMPT,
    examples: [
      { label: "Strong applicant", text: `Hi, I'm applying for the Senior Backend role. I currently lead platform infrastructure at Stripe's Payments team (team of 6, 8 years experience). My most recent project cut p99 latency by 60ms by redesigning our rate-limiting layer. Proficient in Go, Rust, and distributed systems. My current TC is $320k.` },
      { label: "Mid-level", text: `Hello, I'd love to be considered for the frontend engineer position. I've been working in React for about 3 years, mostly in e-commerce. Comfortable with hooks, context, and Redux. No TypeScript experience professionally but I've done tutorials. Looking for a team where I can grow.` },
      { label: "Career changer", text: `I'm interested in the Data Analyst role. Coming from 5 years at McKinsey doing financial modelling and Excel analysis. Recently completed a SQL bootcamp and statistics course. I don't have direct product analytics experience yet but my structured problem-solving transfers well.` },
      { label: "Weak application", text: `Hi there. I saw your job listing and I think I'd be a good fit. I have experience in software. I am a fast learner and work well in teams. Please find my CV attached. Looking forward to hearing from you.` },
    ],
  },
  internal_feedback: {
    id: "internal_feedback", label: "Internal Feedback", icon: "💬",
    description: "Team reviews, retros, manager notes, Slack threads",
    prompt: FEEDBACK_PROMPT,
    examples: [
      { label: "Team retro", text: `The Q1 infra migration went well — Leon's squad hit every milestone and the K8s move was smoother than expected. The growth team is a different story. Three engineers feel disconnected from company goals. One is actively interviewing externally. On-call rotation is unsustainable: 11 P1s in 6 weeks. People are burning out quietly.` },
      { label: "Perf note", text: `Quick note on James from platform team. Technical output is high — the caching refactor was clean. However he's been late to three consecutive sprint reviews without notice, and in two 1:1s he's mentioned frustration with "too many meetings." Worth a focused conversation before this becomes a pattern.` },
      { label: "Hiring feedback", text: `Hiring is taking way too long. Senior backend role open 8 weeks with no decision. The team sees empty headcount and it signals leadership can't decide. Real morale issue. Can we commit to a hire-or-close decision within 2 weeks? Also interview process needs shortening — 6 rounds is too many for IC.` },
      { label: "Culture note", text: `Product and engineering teams are increasingly siloed. Almost no informal communication across those functions. Engineering sees product as handing down requirements, product sees engineering as slow. The offsite highlighted this dynamic rather than solved it. Need more structured cross-functional collaboration in day-to-day work.` },
    ],
  },
};
