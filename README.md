# PulseTrack 📈

> **Your competitor intelligence, at a glance.** Monitor competitor websites 24/7, track design or pricing updates, detect features, and leverage Llama 3.3 AI to understand what those changes mean for your business.

---

## 📸 Overview

![PulseTrack Dashboard](image.png)

PulseTrack automates competitor tracking by periodically scraping pages, running smart word-level diffs, and sending the diff text to Groq AI. The AI classifies the change, assesses its urgency, and generates a business action plan.

---

## ✨ Key Features

*   **Hybrid Scraping Pipeline:** Tries fast, lightweight scraping using Axios/Cheerio first. If it detects bot-blocking or empty content, it seamlessly falls back to the ScrapingBee API.
*   **AI-Powered Competitive Analysis:** Integrates Groq SDK (`llama-3.3-70b-versatile`) to instantly analyze text diffs, explaining *what changed*, *why it happened*, *business impact*, and a *recommended action*.
*   **Intelligent Alert System:** Filters out noisy modifications (e.g. timestamp updates, minor styling) using a custom 2% change ratio threshold. Categorizes alerts into High, Medium, or Low urgency.
*   **Visual Diff Viewer:** Highlights exact word-level text additions and deletions across competitor website revisions.
*   **Passwordless Magic Link Authentication:** Uses NextAuth.js combined with Resend for secure, credential-less user authentication.
*   **Automated Digests:** Sends beautifully formatted weekly email digests summarizing all competitor activities using Inngest and Resend.

---

## 🛠 Tech Stack

| Category | Technologies Used | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript | Modern, high-performance UI structure |
| **Styling** | Tailwind CSS v4, Framer Motion, GSAP, Radix UI | Rich, premium interactive layouts and micro-animations |
| **Database** | PostgreSQL (Neon serverless), Prisma ORM | Scalable cloud database with typed schema management |
| **Authentication**| NextAuth.js | Magic Links via Resend, Google OAuth |
| **Scraping** | Cheerio, Axios, ScrapingBee | Flexible extraction with proxy/CAPTCHA fallback |
| **AI Insights** | Groq SDK (`llama-3.3-70b-versatile`) | Fast, high-fidelity strategic analysis |
| **Background Jobs**| Inngest | Event-driven architecture with built-in cron triggers |

---

## 🚀 Local Setup

Follow these steps to run PulseTrack locally:

### 1. Clone the repository
```bash
git clone https://github.com/prerna020/pulsetrack.git
cd pulsetrack
```

### 2. Install dependencies
> [!IMPORTANT]
> Because this project uses Next.js 16 and React 19, you **must** use the `--legacy-peer-deps` flag to install dependencies without resolution conflicts.
```bash
npm install --legacy-peer-deps
```

### 3. Set up environment variables
Copy the template `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Fill in the values in `.env` (see the [Environment Variables](#-environment-variables) section below).

### 4. Sync and migrate the database
Push the Prisma schema to your database instance and generate the typed client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Start the development environment
Start the local Next.js server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔑 Environment Variables

Make sure to configure the following environment variables in your `.env` file:

```ini
# Database URLs (Neon PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@your-host-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@your-host.region.aws.neon.tech/neondb?sslmode=require" # Used for migrations

# NextAuth Config
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Auth Provider Integrations (Optional)
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Resend API (Transactional emails and magic links)
RESEND_API_KEY="re_yourkeyhere"
RESEND_FROM_EMAIL="PulseTrack <onboarding@resend.dev>"

# Groq API Key (AI-powered diff intelligence)
GROQ_API_KEY="gsk_yourkeyhere"

# Inngest (Required for production background workers)
# INNGEST_EVENT_KEY=""
# INNGEST_SIGNING_KEY=""
```

---

## 🏗 System Architecture & Pipeline Flow

The system scraper runs asynchronously as shown below:

```mermaid
graph TD
    A[Inngest Cron Trigger <br/> Daily at 9:00 AM] --> B[Fetch Active Tracked Pages]
    B --> C[Scrape URL: Cheerio / Axios]
    C -->|Content < 200 chars or blocked| D[Fallback: ScrapingBee JS Rendering]
    C -->|Content OK| E[Compare with Latest Snapshot]
    D --> E
    E -->|Diff Ratio < 2%| F[Ignore Noise]
    E -->|Diff Ratio >= 2%| G[Calculate Word-level Diff]
    G --> H[Groq AI Llama 3.3 Analysis]
    H --> I[Save Change & Category to DB]
    I --> J[Trigger Realtime UI Alert & Queue Weekly Digest]
```

1.  **Trigger:** An Inngest cron job is scheduled to trigger the scraper daily at 9:00 AM (`0 9 * * *`).
2.  **Fetch & Scrape:** The pipeline fetches active tracked pages and scrapes them. It falls back to ScrapingBee if simple cheerio fetches return thin content (< 200 chars).
3.  **Diff Filtering:** Changes are analyzed. Any change ratio below `0.02` (2% diff compared to the previous content) is discarded as noise.
4.  **AI Insight:** Groq's Llama 3.3 engine parses the additions/deletions, evaluates the change's business urgency (Low, Medium, High), and extracts actionable recommendations.
5.  **Alerting:** Changes are written to the database, instantly populating the dashboard activity feed and queueing up the weekly email digest.

---

## ☁️ Deployment

PulseTrack is pre-configured and optimized to run on **Vercel**:
1. Add your repository to your Vercel Dashboard.
2. Vercel automatically detects Next.js configurations. The build script is defined as `prisma generate && next build`.
3. Add the required `.env` variables under the Vercel **Environment Variables** settings.
4. Click **Deploy**.
