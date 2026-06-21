name - AGENTS.md
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 🤖 PulseTrack Agent Instructions

### 📦 Dependency Installation
* Always use `--legacy-peer-deps` when running `npm install` to avoid conflicts between Next.js 16/React 19 peer dependencies:
  `npm install <package> --legacy-peer-deps`

### 🗄️ Database Changes (Prisma)
* Whenever you modify [schema.prisma](file:///Users/vartikasharma/pulse-track/prisma/schema.prisma), always generate the client and push the schema changes:
  1. `npx prisma generate`
  2. `npx prisma db push`
* Do NOT instantiate `new PrismaClient()` directly in your code. Always import the shared instance from `@/lib/prisma`:
  `import { prisma } from "@/lib/prisma";`

### 🎛️ Background Functions (Inngest)
* Background events, jobs, and cron setups are located under `src/inngest/`.
* When adding a new background pipeline, ensure the Inngest function is registered in the API route handler (`src/app/api/inngest/route.ts`).

### 📚 General Context
* Refer to [CLAUDE.md](file:///Users/vartikasharma/pulse-track/CLAUDE.md) for full commands, style guidelines, and tech stack details.