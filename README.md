# ApiSync AI

**Detect breaking SDK changes, preview AST-based fixes, validate, and open a review-ready GitHub pull request.**

Live demo: **[apisync-ai.vercel.app](https://apisync-ai.vercel.app)** · Try without login: **[/sandbox](https://apisync-ai.vercel.app/sandbox)**

Example migrations on a real repo: [Jay-122/apisync-openai-demo](https://github.com/Jay-122/apisync-openai-demo) (merged PRs).

---

## What this is

ApiSync AI is a developer tool for **TypeScript/JavaScript** codebases that depend on third-party SDKs (starting with **OpenAI v3 → v4**). It:

1. Scans a repository (demo fixtures or a connected GitHub repo).
2. Finds outdated API usage with static analysis.
3. Applies **ts-morph** AST transforms (not regex-first, not raw LLM patches).
4. Validates changed files where possible.
5. Proposes changes on a branch like `apisync/*` via a **pull request** — it does **not** merge to `main` automatically.

The product is built to feel trustworthy: **detect → explain → preview → validate → PR**, with human review as the last step.

---

## Quick start (no GitHub required)

```bash
git clone https://github.com/Jay-122/apisync-ai.git
cd apisync-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and go to **Sandbox** to run the full migration flow on built-in demo files (diff, validation, simulated PR).

---

## Local development

| Command | Purpose |
|--------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Run production build |
| `npm run test` | Vitest (AST / pipeline tests) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

**Requirements:** Node.js 20+ recommended, npm.

### Environment variables

1. Copy the template:

   ```bash
   cp .env.example .env
   ```

2. For **sandbox-only** local use, you can leave GitHub and AI keys empty.

3. For **Connect GitHub** (install app, scan repos, create PRs), set the `GITHUB_*` variables in `.env` (see [GitHub App setup](#github-app-setup) below).

4. Optional: `DATABASE_URL` for Prisma-backed persistence. Without it, the app still runs in demo-oriented modes.

Never commit `.env`, private keys (`.pem`), or API secrets. `.env.example` only lists variable **names** with empty values.

---

## GitHub App setup

Create a [GitHub App](https://docs.github.com/en/apps/creating-github-apps) and configure:

| Setting | Value |
|--------|--------|
| Homepage URL | `https://YOUR_DOMAIN` (e.g. production Vercel URL) |
| Setup URL / callback | `https://YOUR_DOMAIN/api/github/install` |
| Webhook (optional) | `https://YOUR_DOMAIN/api/github/webhook` |

Repository permissions depend on what you need; typical minimum for this project:

- **Contents:** Read & write (branches, files, PRs)
- **Pull requests:** Read & write
- **Metadata:** Read-only

Install the app on a test repository, then set in `.env` (or Vercel project env):

- `GITHUB_APP_ID`
- `GITHUB_PRIVATE_KEY` (PEM; use `\n` for newlines in a single line if needed)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` (if using OAuth flows)
- `GITHUB_WEBHOOK_SECRET` (if webhooks are enabled)
- `GITHUB_APP_SLUG` (the app’s URL slug, used for install redirects)

Visit **Connect** in the app (`/connect`) to install and pick a repository.

---

## Architecture (high level)

```
app/           Next.js App Router (pages + API routes)
components/    UI (sandbox, dashboard, editors, 3D graph)
lib/
  ast/         Analyzer, planner, transformer, validator (ts-morph)
  github/      Octokit GitHub App, scan, branch/PR creation
  migration/   End-to-end migration orchestration
  ai/          Optional LLM providers (structured / Zod-validated output)
  demo/        Sandbox fixtures when GitHub is unavailable
```

**Safety defaults**

- No direct pushes to the default branch.
- Low-confidence or unsafe AST patterns are skipped.
- LLM output informs analysis; **code changes come from the AST engine**.

More API detail: in-app **[`/docs`](https://apisync-ai.vercel.app/docs)**.

---

## Deployment

The production site is deployed on **Vercel**. Set the same environment variables in the Vercel project settings (not in the repo).

Build command (from `package.json`):

```bash
prisma generate && next build
```

---

## Contributing / using this repo

This is an open portfolio and product codebase. If you fork it:

- Use your own GitHub App and secrets.
- Start with `/sandbox` before wiring production GitHub access.
- Issues and PRs are welcome; keep changes focused and tested (`npm test`, `npm run typecheck`).

---

## License

No license file is included yet. Treat the code as **all rights reserved** unless the owner adds an explicit license. Contact the repository owner before commercial use.
