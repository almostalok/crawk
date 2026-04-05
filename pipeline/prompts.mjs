/**
 * pipeline/prompts.mjs
 * ─────────────────────────────────────────────────────────────────────────
 * Type-specific system prompts and document type detection logic.
 * Each prompt instructs Claude to extract document-type-appropriate
 * structured fields from raw unstructured text.
 */

/* ── Type detection ──────────────────────────────────────────────────────── */
export function detectType(filename = "", text = "") {
  const f = filename.toLowerCase();
  const t = text.toLowerCase().slice(0, 600);

  // Filename prefix conventions: jd_, candidate_, feedback_, interview_
  if (/^jd_|job[-_]desc|job[-_]post|posting/.test(f))          return "job_description";
  if (/^candidate_|^cv_|^resume_|^response_|^applicant_/.test(f)) return "candidate_response";
  if (/^feedback_|^review_|^retro_|^eval_|^perf_/.test(f))     return "internal_feedback";
  if (/^interview_|^notes_|^scorecard_/.test(f))                return "interview_notes";

  // Content heuristics (fallback)
  if (/responsibilities|qualifications|we are (looking|hiring)|role overview|job (title|summary)/.test(t))
    return "job_description";
  if (/my background|i (have|am) (worked|currently)|years of experience|attache(d|s) (my|the) resume/.test(t))
    return "candidate_response";
  if (/team morale|action item|burn(ing)? out|retro(spective)?|on-call|process issue/.test(t))
    return "internal_feedback";

  return "interview_notes"; // default
}

/* ── Schema reference (for CSV headers) ─────────────────────────────────── */
export const SCHEMAS = {
  interview_notes: [
    "overall_recommendation","confidence","candidate_name","role",
    "technical_skill","communication","problem_solving","culture_fit","leadership",
    "key_strengths","key_concerns","seniority_signal","feedback_quality",
    "standout_quote","reasoning",
  ],
  job_description: [
    "job_title","company_name","location","remote_policy","employment_type",
    "seniority_level","department","salary_min","salary_max","salary_currency",
    "required_skills","preferred_skills","key_responsibilities","required_qualifications",
    "benefits_mentioned","team_size","reports_to","summary",
  ],
  candidate_response: [
    "candidate_name","role_applied","response_quality","experience_level",
    "claimed_skills","communication_score","key_themes","green_flags","red_flags",
    "recommended_follow_up","summary",
  ],
  internal_feedback: [
    "subject","about_category","sentiment","urgency","category",
    "mentioned_people","mentioned_teams","key_points","action_items","summary",
  ],
};

/* ── System prompts ──────────────────────────────────────────────────────── */
export const PROMPTS = {

  /* ── Interview Notes ── */
  interview_notes: `You are an expert hiring analyst. Given ANY unstructured text (interview notes,
feedback emails, recruiter comments, candidate summaries), extract a structured scorecard.
Return ONLY valid JSON — no markdown — with these exact fields:
{
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
}`,

  /* ── Job Description ── */
  job_description: `You are an expert recruiter and data analyst. Given ANY raw job posting text
(from emails, docs, websites, or spreadsheets), extract a structured job record.
Return ONLY valid JSON — no markdown — with these exact fields:
{
  "job_title":              string or null,
  "company_name":           string or null,
  "location":               string or null (city, country, or "Remote"),
  "remote_policy":          one of ["Remote","Hybrid","On-site","Unclear"],
  "employment_type":        one of ["Full-time","Part-time","Contract","Freelance","Unclear"],
  "seniority_level":        one of ["Intern","Junior","Mid","Senior","Lead","Director","VP","Unclear"],
  "department":             string or null,
  "reports_to":             string or null,
  "team_size":              string or null (e.g. "8 engineers"),
  "salary_min":             number or null,
  "salary_max":             number or null,
  "salary_currency":        string or null (e.g. "USD"),
  "salary_period":          one of ["hourly","monthly","annual"] or null,
  "required_skills":        array of strings (hard requirements),
  "preferred_skills":       array of strings (nice-to-have),
  "key_responsibilities":   array of 3-6 concise strings,
  "required_qualifications":array of strings,
  "benefits_mentioned":     array of strings,
  "application_contact":    email or URL or null,
  "summary":                1-2 sentence overview of the role
}`,

  /* ── Candidate Response ── */
  candidate_response: `You are an expert talent acquisition specialist. Given ANY unstructured candidate
text (cover letters, emails, self-assessments, application answers, LinkedIn messages), extract a
structured candidate profile. Return ONLY valid JSON — no markdown — with these exact fields:
{
  "candidate_name":           string or null,
  "role_applied":             string or null,
  "response_quality":         one of ["Strong","Good","Average","Weak"],
  "experience_level":         one of ["Junior","Mid","Senior","Staff/Principal","Unclear"],
  "years_of_experience":      number or null,
  "claimed_skills":           array of strings (technologies, tools, methodologies mentioned),
  "communication_score":      integer 1-5 (clarity and professionalism of writing),
  "key_themes":               array of 2-5 strings (main points candidate emphasises),
  "green_flags":              array of strings (strong positive signals),
  "red_flags":                array of strings (missing info, vague claims, concerns),
  "quantified_achievements":  array of strings (any specific metrics or impact data mentioned),
  "recommended_follow_up":    array of 2-4 questions worth asking in a screen call,
  "current_company":          string or null,
  "contact_info":             string or null (email, phone, LinkedIn if mentioned),
  "summary":                  2-3 sentence assessment of the candidate's fit
}`,

  /* ── Internal Feedback ── */
  internal_feedback: `You are an expert organisational analyst. Given ANY internal company text
(team feedback emails, retrospective notes, manager comments, Slack exports, survey responses,
performance notes), extract a structured feedback record. Return ONLY valid JSON — no markdown — with
these exact fields:
{
  "subject":           1-line summary of what this feedback is about,
  "about_category":    one of ["Person","Team","Process","Product","Hiring","Culture","Compensation","Other"],
  "sentiment":         one of ["Positive","Negative","Neutral","Mixed"],
  "urgency":           one of ["High","Medium","Low"],
  "category":          one of ["Performance","Process","Morale","Compensation","Hiring","Technical Debt","Other"],
  "mentioned_people":  array of names mentioned (first name or full name),
  "mentioned_teams":   array of team/squad names mentioned,
  "key_points":        array of 3-6 concise factual observations extracted from the text,
  "action_items":      array of strings (explicit or implied things that need to happen),
  "risks_flagged":     array of strings (attrition risk, compliance, burnout, etc.),
  "positive_signals":  array of strings (things going well),
  "author_role":       inferred role/title of the person who wrote this, or null,
  "summary":           2-3 sentence neutral summary of the feedback content
}`,
};
