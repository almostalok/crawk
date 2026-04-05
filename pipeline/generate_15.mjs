import fs from 'fs';
import path from 'path';

const inboxDir = 'pipeline/inbox';
if (!fs.existsSync(inboxDir)) fs.mkdirSync(inboxDir, { recursive: true });

const files = {
  // Job Descriptions
  "jd_frontend_lead.txt": "We are seeking a Lead Frontend Engineer to guide our React team. Must have 7+ years of experience, heavy TypeScript knowledge, and experience building design systems. Salary: $140,000 - $170,000. Remote within US. Benefits include unlimited PTO.",
  "jd_data_scientist.txt": "Data Scientist required for our anti-fraud division. Key requirements: Python, SQL, and practical ML/PyTorch experience (3+ years). This is a hybrid role (3 days in our London office). Salary: £80,000.",
  "jd_product_manager.txt": "Looking for a seasoned Product Manager for our B2B SaaS platform. Will report to VP Product. Experience with agile, Jira, and cross-functional teams is a must. Location: New York (On-site).",
  "jd_devops_engineer.txt": "DevOps Engineer needed. You will manage our AWS infrastructure and Kubernetes clusters. Requirements: CI/CD, Terraform, Docker. 4+ years of experience. Contract role for 12 months. Remote.",
  
  // Interview Notes
  "interview_sarah_jenkins.txt": "Candidate: Sarah Jenkins. Position: Staff Engineer. Technical round was flawless. She easily coded a graph traversal algorithm and clearly explained time complexity. Excellent communication skills, very concise. However, she struggled slightly on behavioral questions regarding conflict resolution. Overall: Strong Hire. Confidence: High.",
  "interview_michael_t.txt": "Candidate: Michael T. Did not perform well today. The coding task (simple string manipulation) took him 40 minutes and required multiple hints. Poor problem solving. Kept blaming the IDE setup. Communication was defensive. Recommend pass.",
  "interview_alexa_p.txt": "Alexa is a solid mid-level engineer. She answered the system design questions decently, though she missed a caching edge case. Culture fit is great, she's very enthusiastic about our product. Lean Hire.",
  "interview_david_w.txt": "David interviewed for the Lead Designer role. His portfolio presentation was excellent and he clearly understands UX principles. But when asked about metrics and A/B testing, he struggled. I would say Hire, but maybe we adjust the level to Senior instead of Lead.",
  
  // Candidate Responses
  "candidate_john_doe.txt": "Hi, I'm John applying for the Data Scientist role. I have 4 years of experience using Python and PyTorch directly on fraud detection projects at my previous company, where my model reduced false positives by 12%. I communicate complex models clearly to non-technical stakeholders.",
  "candidate_emma_smith.txt": "To whom it may concern, I am a recent bootcamp grad looking for my first frontend role. I know React, HTML, CSS. I am a very fast learner and hard worker. Please see attached my resume.",
  "candidate_raj_patel.txt": "Hi! I've been a DevOps engineer for 6 years, working heavily with AWS and Terraform. At my last job, I automated our entire deployment pipeline, reducing deploy time from 2 hours to 15 minutes. Very comfortable with K8s.",
  "candidate_lisa_r.txt": "I'm applying for the PM role. I have 5 years of SaaS PM experience, and led a cross-functional team of 10 engineers to launch our enterprise tier last quarter, generating $2M in new ARR. I use Jira/Agile daily.",
  
  // Internal Feedback
  "feedback_q2_retro.txt": "The Q2 release was painfully slow. The QA team was a bottleneck because they were understaffed. That said, the new billing module works perfectly. We need to hire 2 more QA engineers ASAP to prevent this next quarter.",
  "feedback_manager_review_tom.txt": "Tom has been an excellent addition to the backend team. His code quality is pristine. He just needs to speak up more in planning meetings. Overall, very positive performance this cycle.",
  "feedback_all_hands_survey.txt": "People are very unhappy about the new RTO policy requiring 4 days in the office. Several engineers have threatened to resign. Productivity is already taking a hit. We need leadership to address this urgently."
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(inboxDir, filename), content, 'utf8');
  console.log(`Created: ${filename}`);
}

console.log("15 files successfully generated in pipeline/inbox/");
