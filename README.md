# ARC Journal

The publication of ARC — the Applied Research and Innovation Council.
Built with Next.js 14 (App Router) and Tailwind CSS.

- Public site: `/`
- Private admin: `/admin`

---

## What this is, honestly

This is a complete, working Next.js application, not a mockup — every
page, the admin panel, and the publishing API are real and functional.
It has **not** been deployed for you: nobody in this build process has
Vercel deployment access, so `arc-journal.vercel.app` will only exist
once you deploy it yourself. That takes about five minutes (see
**Deploying to Vercel** below).

The site ships with **zero seed content** — no fabricated articles,
authors, or stats. `data/*.json` are empty arrays on purpose. The
homepage, Articles archive, and THETA section all render real, honest
empty states until you publish something from `/admin`.

---

## Local development

```bash
npm install
cp .env.example .env.local
# edit .env.local: set ADMIN_PASSWORD and SESSION_SECRET
npm run dev
```

Visit `http://localhost:3000` for the site and
`http://localhost:3000/admin` to sign in (password = whatever you set
`ADMIN_PASSWORD` to; the repo's documented starting value is
`arc2026`).

In local dev, content is stored in the `data/` JSON files. That's fine
for testing, but read the note below before you rely on it in
production.

---

## Content storage: local JSON vs. Vercel KV

`lib/store.js` is the only place in the app that touches storage —
every page and API route goes through it, so the backend can change
without touching anything else.

- **Locally**, with no KV environment variables set, it reads and
  writes `data/articles.json`, `data/theta.json`, and
  `data/subscribers.json`.
- **On Vercel**, that fallback is not reliable: serverless functions
  run on a read-only, ephemeral filesystem, so edits made through
  `/admin` in production may not persist between requests.

**For a real deployment, connect Vercel KV** (a hosted Redis store,
Vercel's own simplest option for exactly this kind of data):

1. In your Vercel project, go to **Storage → Create Database → KV**.
2. Link it to this project. Vercel injects `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` automatically — you don't set these by hand.
3. Redeploy. `lib/store.js` detects those variables and switches to
   KV automatically.

If you'd rather use a different database (Postgres, Supabase, etc.),
swap the implementation inside `lib/store.js` — the function
signatures (`getArticles`, `createArticle`, `updateArticle`, …) are
the contract the rest of the app relies on.

---

## Environment variables

See `.env.example`. Required:

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Password to sign in at `/admin`. Never referenced from client-side code — checked only inside the server-side login route. |
| `SESSION_SECRET` | Signs the admin session cookie (JWT via `jose`). Generate a real one with `openssl rand -base64 32` before going live. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Auto-set by Vercel when you link a KV store. See above. |

Set these under **Vercel → Project Settings → Environment Variables**
for production — never commit real secrets.

---

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repo.
3. Framework preset: Next.js (auto-detected).
4. Add the `ADMIN_PASSWORD` and `SESSION_SECRET` environment variables.
5. Deploy.
6. Create and link a Vercel KV store (see above), then redeploy so the
   app picks up the KV environment variables.
7. If you want the project at the exact URL `arc-journal.vercel.app`,
   name the Vercel project `arc-journal` (or set that as a custom
   domain/alias) — Vercel assigns the `<project-name>.vercel.app`
   subdomain automatically.

After that, publishing from `/admin` will persist for real.

---

## Changing the admin password later

Update `ADMIN_PASSWORD` in Vercel's environment variables and
redeploy (or restart the deployment). The password is never stored in
the codebase or sent to the browser — only compared server-side in
`app/api/auth/login/route.js`.

---

## Project structure

```
app/
  page.js                  Homepage
  articles/page.js          Article archive (search + category filter)
  articles/[slug]/page.js   Article detail (supports ?preview=1 for drafts)
  theta/page.js              THETA index
  theta/[slug]/page.js       THETA edition detail (supports ?preview=1)
  about/page.js              About
  admin/                     Login + protected publishing dashboard
  api/                       Auth, articles, theta, newsletter endpoints
components/                  UI building blocks (editors, cards, shell)
lib/
  store.js                  Content storage abstraction (KV or JSON)
  auth.js                    Session token signing/verification
  utils.js                    Slugify, reading time, categories
data/                        Empty seed JSON (dev fallback only)
public/brand/                Official ARC Journal logo (replace here)
middleware.js                Protects /admin/* pages and API writes
```

## Replacing the logo later

Swap the file at `public/brand/arc-journal-logo.jpg` (same filename,
or update the path in `components/Logo.js`). It's used everywhere
through that single component — header, footer, admin login — so
nothing else needs to change.

## Content model

**Article**: title, slug, author, date, category, tags, excerpt,
coverImage (URL), body (Markdown, with GFM tables/lists and
`$...$` / `$$...$$` LaTeX via KaTeX), readingTime (computed
automatically), references, featured, isThetaLinked, status
(`draft`/`published`).

**THETA edition**: title, subtitle, slug, editionNumber, author, date,
introduction (Markdown), angles (array of `{ title, body }`),
references, featured, status.

Both are managed entirely from `/admin` — no manual JSON or HTML
editing required.
