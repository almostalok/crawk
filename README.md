# Crawk — AI-Powered Recruiting Data Processor

**Live:** [crawl.vercel.app](https://crawl.vercel.app)

---

## Overview

Crawk transforms unstructured recruiting text into clean, structured data. Paste in raw interview transcripts, messy job descriptions, candidate responses, or internal feedback — Crawk sends them through Google Gemini AI and returns strictly typed, queryable JSON that you can immediately export to CSV.

It is built for speed and clarity: no unnecessary UI chrome, just rapid data extraction and a focused dashboard.

---

## Screenshot

![Crawk Dashboard](./public/crawk-screenshot.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | React 19 + Vite |
| AI Model | Google Gemini (`gemini-2.5-flash-001`) |
| Styling | Vanilla CSS (brutalist design system) |
| Session State | Custom in-memory session store |
| Data Export | CSV compiler (`src/utils/export.js`) |

---

## Processing Modes

| Mode | Description |
|---|---|
| **Interview Notes** | Extracts structured candidate scorecards and dimensional metrics from conversational transcripts. |
| **Job Descriptions** | Parses seniority level, remote policy, and required hard skills from raw job postings. |
| **Candidate Responses** | Evaluates response quality and infers applicant experience level. |
| **Internal Feedback** | Aggregates sentiment and urgency signals from recruiter or hiring-manager notes. |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository_url>
cd crawk
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and add your Gemini API key:

```env
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run pipeline` | Run the processing pipeline |
| `npm run pipeline:mock` | Run the pipeline with mock data |

---

## Design Philosophy

Crawk's UI is intentionally minimal and functional. Typography uses a monospace font for data output and a bold sans-serif for headers. Interactions are immediate — no transitions or animations — to keep the focus on data throughput. High-contrast black borders and hard drop shadows create clear visual boundaries without decorative overhead.
