# CivicResolve

> **Report. Track. Resolve.**  
> An AI-powered civic grievance intelligence platform that bridges the gap between citizens and municipal administration.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Google Gemini** via the `@google/genai` SDK.

---

## 🏛️ What is CivicResolve?

CivicResolve is a modern civic engagement and municipal triage platform designed for rapid response to public infrastructure issues. Citizens report everyday civic problems—such as potholes, overflowing garbage dumps, broken streetlights, water pipeline bursts, or drainage overflows—and **Google Gemini** instantly:
1. **Categorizes** the issue into standard municipal classifications.
2. **Evaluates Risk & Priority** (`Low`, `Medium`, `High`, `Critical`) based on public safety hazards, traffic impact, and human urgency.
3. **Dispatches & Routes** the grievance to the exact municipal department (e.g. Public Works, Solid Waste Management, Electricity Board).
4. **Keeps Citizens Informed** through a transparent 3-step public tracking timeline (`Reported` → `In Progress` → `Resolved`).
5. **Empowers Municipal Officers** with an administrative triage dashboard to manage work orders and update statuses in real time.

---

## ⚡ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a calm civic teal/cyan palette
- **AI Engine:** Google Gemini via the official `@google/genai` SDK
  - Server-side only (API keys are never exposed to the client)
  - Structured JSON response generation
  - Configurable model via `GEMINI_MODEL` (defaults to `gemini-3.8-flash`)
  - Resilient keyword-based fallback classifier ensures the demo never breaks
- **Storage:** Lightweight file-based JSON storage (`data/complaints.json`) with an abstracted data layer (`lib/db.ts`)
- **File Uploads:** Local image upload processing to `public/uploads` (capped at 5 MB; supports JPG, PNG, WebP)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Quick Start Guide

### 1. Clone the repository
```bash
git clone https://github.com/dekasri-karthic/civicresolve.git
cd civicresolve
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your Google Gemini API key:
```env
# Get an API key from Google AI Studio: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

> **Note:** If `GEMINI_API_KEY` is not provided or invalid, CivicResolve automatically activates an intelligent keyword fallback classifier so your demo and evaluation run smoothly without interruption.

### 4. Seed realistic sample complaints
Populate the app with 8 realistic civic complaints across major Indian metropolitan cities (Bengaluru, Mumbai, Chennai, Hyderabad, Pune, Noida, Kolkata, New Delhi):
```bash
npm run seed
```
*(The seed script is idempotent and will never overwrite or erase existing complaints.)*

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Key Features

- **Automated AI Triage (`POST /api/classify`):**
  - Instant classification into: *Road & Potholes*, *Garbage & Sanitation*, *Street Lighting*, *Water Supply & Leakage*, *Drainage & Sewage*, *Public Safety*, or *Other*.
  - Safety risk detection evaluates hazards (e.g. open live wires or sinkholes as *Critical*).
  - Single-line executive summaries and explanatory AI reasoning context.
  - Transparent attribution indicator: shows `"Analyzed by Gemini"` or `"Basic analysis (fallback)"`.

- **Citizen Reporting (`/report`):**
  - Intuitive form with title, detailed description, landmark/location, and category selection (with *"Let AI decide"* default).
  - Optional photo upload with live client-side preview and validation.
  - Dynamic loading state: *"AI is analyzing your report..."*.
  - Interactive AI Review Card allowing citizens to inspect and modify AI-suggested categories or priorities before final submission.

- **Public Tracker (`/track`):**
  - Transparent grievance cards featuring color-coded priority badges (Green, Yellow, Orange, Red).
  - 3-step visual progress bar (`Reported` → `In Progress` → `Resolved`).
  - Real-time search across titles, landmarks, complaint IDs (e.g. `CR-87468`), and departments.
  - Status and category filtering with instant count tallies.
  - Expandable AI reasoning drawer.

- **Municipal Admin Portal (`/admin`):**
  - Control room dashboard with high-level KPI cards (Total, Reported, In Progress, Resolved, Active Critical).
  - Comprehensive, responsive table scrolling smoothly on mobile viewports.
  - Instant status update dropdowns (`PATCH /api/complaints/[id]`) with live confirmation toasts.
  - Multi-parameter search and status/priority filters.

---

## 🌟 Future Improvements (Demo Talking Points)

For future versions beyond the hackathon prototype, CivicResolve is architected to support:

1. **Role-Based Authentication & SSO:**
   - Aadhaar / DigiLocker verification or Google OAuth for verified citizen reporting.
   - Secure departmental logins with role-based access control (RBAC) for field engineers and supervisors.
2. **Interactive GIS Map & Geo-Tagging:**
   - Automatic GPS capture from uploaded smartphone photos (EXIF metadata).
   - Interactive OpenStreetMap/Mapbox integration with density heatmaps and municipal ward overlays.
3. **Automated Duplicate Detection:**
   - Vector similarity search (via Gemini Embeddings) to detect when multiple citizens report the same pothole or broken streetlight, auto-merging them into a single high-priority civic ticket.
4. **Omnichannel Alerts (WhatsApp / SMS / Email):**
   - Instant WhatsApp notifications to citizens as their grievance progresses from Reported to Resolved with before-and-after resolution photos.
5. **Municipal SLA & Predictive Analytics:**
   - Automated SLA countdown timers and escalation workflows when high-priority safety hazards remain unaddressed.

---

## 📄 License
MIT License. Built for civic good and hackathon innovation.
