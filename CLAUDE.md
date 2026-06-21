# PulseTrack — Developer Guide (CLAUDE.md)

PulseTrack is a competitor intelligence dashboard. It monitors competitor websites 24/7, extracts text changes, uses Groq AI to analyze business impact/urgency, and generates visual diffs and weekly email digests.

## 🛠 Command Reference

### Development & Build
* **Start Dev Server**: `npm run dev` (Runs Next.js development server at `http://localhost:3000`)
* **Production Build**: `npm run build` (Generates Prisma client and builds Next.js production output)
* **Start Production**: `npm run start` (Runs the built application)
* **Linting**: `npm run lint` (Runs ESLint check)

### Database Management (Prisma)
* **Prisma Schema**: Located in [schema.prisma](file:///Users/vartikasharma/pulse-track/prisma/schema.prisma)
* **Sync Schema with DB**: `npx prisma db push` (Pushes schema changes to the PostgreSQL/Neon database)
* **Generate Client**: `npx prisma generate` (Generates the Prisma client under `src/generated/prisma`)
* **Prisma Studio**: `npx prisma studio` (Interactive database viewer)

---

## 🎨 Tech Stack & Conventions

* **Core**: Next.js 16 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS v4 + PostCSS, Framer Motion, GSAP, Lucide React, Radix UI (via shadcn/ui)
* **Database**: PostgreSQL (Neon Serverless), Prisma ORM
* **Async Pipelines**: Inngest (Background cron jobs and event queues)
* **AI Analysis**: Groq SDK (Llama 3 / Mixtral models)
* **Web Scraping**: Cheerio + Axios

---

## 📝 Code Style & Guidelines

### Imports & File Resolution
* Use path aliases starting with `@/` to reference files inside the `src/` directory.
  * Good: `import { prisma } from "@/lib/prisma"`
  * Bad: `import { prisma } from "../../../lib/prisma"`

### Database Operations
* Always import and reuse the shared Prisma client instance from `@/lib/prisma`. Do not instantiate `PrismaClient` manually.
* The Prisma client is generated locally in `src/generated/prisma` to avoid global namespace conflicts.

### Tailwind CSS styling
* Use the class-merging helper function `cn()` from `@/lib/utils` when conditionally combining Tailwind classes or merging custom classes into components:
  ```typescript
  import { cn } from "@/lib/utils";
  
  export function MyComponent({ className }) {
    return <div className={cn("p-4 bg-card text-card-foreground", className)} />;
  }
  ```

### Async Pipelines (Inngest)
* Background jobs, event listeners, and cron triggers are organized in `src/inngest/`.
* When adding a new background pipeline, ensure the Inngest function is registered in the API route handler (`src/app/api/inngest/route.ts`).
