/**
 * pipeline/inputs.mjs
 * ─────────────────────────────────────────────────────────
 * 15 raw, unstructured interview feedback texts.
 * These represent the kind of freeform notes that live in
 * emails, shared docs, and recruiter spreadsheets.
 */

export const INPUTS = [
  {
    id: 1,
    label: "Full-Stack Engineer",
    text: `Maya did an impressive job across the board. She architected a clean React + Node solution to our design problem, explained her choices clearly, and wrote production-quality code in the live session. When I pushed back on her state management approach she defended it well with actual benchmarks. No hand-waving. Communication is excellent — she'd be easy to work with. Strong yes from me, probably best candidate we've seen this quarter.`,
  },
  {
    id: 2,
    label: "Data Scientist",
    text: `Background in ML is solid — PhD from a decent program, familiar with the standard toolkit (sklearn, XGBoost, some PyTorch). But the practical application felt thin. When asked to design an experiment for our churn model he jumped straight to a complex ensemble approach without asking any business-context questions. Stats fundamentals were okay but not exceptional. Communication was a bit academic — I'm not sure he'd translate well to a business stakeholder audience. Lean pass.`,
  },
  {
    id: 3,
    label: "DevOps / SRE",
    text: `Interview with Leon for the SRE role. He has 5 years of solid infrastructure experience — AWS, Terraform, good Kubernetes depth. His incident story from his last role was genuinely impressive: he root-caused a cascading latency issue across three services in a live outage. On-call mindset seems right. One concern: hasn't worked with our specific observability stack (Datadog) but said he'd ramp quickly and I believe him. Overall good hire, minor gaps are learnable.`,
  },
  {
    id: 4,
    label: "UX Designer",
    text: `Aisha's portfolio was the strongest we've seen in this hire cycle. Her case study on redesigning a fintech onboarding flow showed real depth — she walked through discovery, synthesis, iteration, and impact metrics. In the whiteboard exercise she asked great clarifying questions before touching the board. Interaction design sense is advanced. She's also thoughtful about accessibility, which is rare at this level. Would be an upgrade over anyone currently on the design team. Strong hire, move fast.`,
  },
  {
    id: 5,
    label: "Marketing Manager",
    text: `Daniel has a good track record in B2B SaaS marketing — led demand gen at his last place, comfortable with HubSpot and attribution modelling. The strategy question revealed some gaps though: his instinct was to run more ads rather than rethink the funnel, which felt a bit surface-level. He's strong on execution but I'm less sure about strategic vision. Probably solid for the role as currently scoped, which doesn't require a lot of independent strategic thinking. Reluctant lean yes.`,
  },
  {
    id: 6,
    label: "Sales Development Rep",
    text: `Not a great interview. He showed up unprepared — didn't know our product, hadn't looked at our website. The cold call roleplay was rough: talked over the prospect, went straight to pitch without qualifying, got defensive when I objected. When I asked why he wanted to work in sales he gave a generic answer about being a people person. Quota attainment at current role is also below average per his own admission. Pass.`,
  },
  {
    id: 7,
    label: "QA Engineer",
    text: `Solid QA interview with Nkechi. She's done both manual and automation testing — solid Selenium, getting into Cypress. Test design was good: when I gave her a feature spec she immediately thought about edge cases and wrote a reasonable test plan. Bug reporting standards she described were clean and well-organised. Communication clear, asks good questions. She's not the flashiest candidate but would be a dependable addition to the team. Recommend hiring.`,
  },
  {
    id: 8,
    label: "Engineering Manager",
    text: `Ravi has managed teams of 8-12 engineers at two different Series B companies. His answer on handling underperformance was the best I've heard — specific, compassionate, with clear process. He spoke about technical debt prioritisation in a way that showed he can hold his own with senior ICs. One thing I want to flag: he's coming from a company with more process than us, so he'd need to adapt to our pace. But the fundamentals of leadership are there and the team would respect him. Strong yes.`,
  },
  {
    id: 9,
    label: "Finance Analyst",
    text: `The modelling test revealed some issues. She completed the three-statement model but made an error in the working capital section that cascaded into the DCF. More concerning is that she couldn't identify the error when I pointed to the output — suggests she doesn't deeply understand the mechanics. Excel proficiency was okay but not fast. Communication was pleasant enough but the technical gaps are a problem for an analyst role at this level. Probably better suited to a junior position.`,
  },
  {
    id: 10,
    label: "Customer Success Manager",
    text: `Mixed feelings on this one. Ben is personable and has good energy — customers would like him. His churn-prevention story was decent, showed he can build relationships. But his approach to escalations felt reactive rather than proactive, and he struggled to articulate how he'd use data to drive retention strategy. For a high-touch enterprise CS role this matters. He'd be better suited to SMB. Might work if we have budget for coaching, otherwise lean pass at senior level.`,
  },
  {
    id: 11,
    label: "Android Developer",
    text: `Yuki was strong in the technical portion. Her knowledge of Jetpack Compose is current and practical — she's clearly using it in production, not just reading docs. She implemented a clean MVVM solution to our coding problem, talked through the architecture unprompted, and caught her own edge case before I flagged it. Background in accessibility on mobile is a bonus for us. A bit quiet in the culture interview but thoughtful when she spoke. Recommend moving forward.`,
  },
  {
    id: 12,
    label: "Scrum Master",
    text: `Spoke with Chris today. Seems fine. Has done scrum at a few companies. Knows the ceremonies. Team seemed to like him in the panel session. I think he'd be okay. Nothing jumped out as a red flag. He's done some Jira admin and backlog grooming. Probably good to hire him.`,
  },
  {
    id: 13,
    label: "Security Engineer",
    text: `Exceptional interview. Fatima has a background in red-teaming and has transitioned into defensive security — that combination is rare and exactly what we need. Her threat modelling exercise was methodical: she correctly identified three attack surfaces I expected and one I hadn't considered. When I threw in a social engineering scenario she didn't just recite policy — she walked through how she'd investigate and contain. She's also clearly security-minded in how she thinks about product features, not just infrastructure. Hire immediately.`,
  },
  {
    id: 14,
    label: "Technical Writer",
    text: `Grace's writing samples were clean and well-structured. She understands the difference between reference docs and tutorials, which not everyone does. In the exercise she took a dense API spec and turned it into a readable quickstart in about 40 minutes. Questions on tooling were good — she uses docs-as-code workflows and is familiar with Markdown, Sphinx, and some DITA. One gap: limited experience documenting distributed systems, which is most of what we build. Lean yes with a plan to ramp on our stack.`,
  },
  {
    id: 15,
    label: "ML Researcher",
    text: `Impressive candidate. Omar published two papers at NeurIPS on efficient transformers — the work is legible and novel. His explanation of the core ideas was clear enough that non-ML engineers in the room could follow. The research taste question was revealing: he immediately called out a real weakness in a prominent recent paper and proposed a plausible fix. He thinks carefully before answering, which I like. His interest in applied ML at our scale seems genuine, not just a pivot out of academia. Strong hire, fast-track if possible.`,
  },
];
