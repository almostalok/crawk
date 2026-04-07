# CRAWK 

> **Unstructured Data. Demolished.**

CRAWK is a brutalist, typography-first web application designed to ingest raw, unstructured recruiting data (interview notes, job descriptions, candidate emails, internal feedback) and transform it into highly structured, queryable JSON arrays. Powered entirely by Google Gemini, CRAWK serves as an intelligence pipeline with a striking, high-contrast visual identity.

🔗 **Deployed Application:** [https://crawl.vercel.app](https://crawl.vercel.app)

---

## 📷 Platform Screenshot

![CRAWK Platform Dashboard](./public/crawk-screenshot.png)
*(Note: Please insert your product screenshot at `./public/crawk-screenshot.png` to display it here).*

---

## 🏗 Technical Overview

CRAWK is built as a highly robust, performant React Single Page Application (SPA) with the following technical foundation:

- **Core Framework:** React 19 + Vite
- **Styling Architecture:** Pure Vanilla CSS following Brutalist design principles (heavy `#000` borders, hard `4px 4px 0 0` box-shadows, sharp corners, and high-contrast `#e2ff00` accents).
- **AI Integrations:** Native integration with Google Gemini (`gemini-2.5-flash`) with custom system prompts for rapid, structured JSON extraction.
- **State Management:** Optimized React hooks (`useState`, `useCallback`) governing a volatile session store for aggregated record keeping.
- **Data Visualizations:** Dynamic, batch-processing analytical views via specialized chart components.
- **Data Exportation:** Modular CSV export engine (`src/utils/export.js`) for pushing data to downstream ATS platforms.

### Core Pipeline Capabilities

1. **Intelligent Document Parsing:** Instantly extract dimensional metrics, scorecard ratings, recommendations, and structured metadata from raw text dumps.
2. **Multi-Document Support:** Custom extraction schemas for:
   - *Interview Notes* 
   - *Job Descriptions*
   - *Candidate Responses*
   - *Internal Feedback*
3. **Batch Processing Dashboard:** Aggregate and visualize data across multiple extracted entries (e.g., Sentiment Analysis, Feedback Urgency, Seniority Distribution).
4. **Unified Session Aggregation:** Accumulate all queried data in a unified session state, filterable and exportable to CSV at any time.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A valid Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd crawk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env` and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🎨 Design System

CRAWK firmly rejects the standard "Soft AI Aesthetic" (glassmorphism, rounded corners, soft gradients). Instead, it embraces a strict, data-focused brutalist aesthetic:
- **Typography:** Structural use of monospace body text `var(--font-mono)` with heavy sans-serif headers `var(--font-body)`.
- **Layout:** High-contrast `border: 3px solid #000` dividers and strictly uniform padding.
- **Interactions:** Functional, high-visibility visual feedback via stark translation offsets and background-color swaps.
