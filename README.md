# Bina Adult Care — website

Marketing website for Bina Adult Care, a residential and in-home senior care provider in El Sobrante, California.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · React Router · Vercel Serverless Functions · Vercel Blob (private storage)

## Pages

Built from the approved design ("Bina Adult Care Homepage" export). Main menu: Home, Services, Our Team, Gallery, Careers, Contact + Book a Visit.

| Route             | Content                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------- |
| `/`               | Hero + photo slider, why choose us, about + photos, services link, care philosophy, visit box, testimonials |
| `/services`       | Hero, intro, Residential / Home Care tabs, comparison, values, care approach, FAQs       |
| `/team`           | Leadership cards (photo/bio appear when added to `src/data/content.ts`)                  |
| `/gallery`        | All 44 photos of the home with a full-screen viewer                                      |
| `/careers`        | Why work with us, vacancies (or "No Current Openings"), application form with resume    |
| `/contact`        | Contact form, contact information, Google Map                                            |
| `/book-a-visit`   | Visit request form (a request, confirmed later by staff)                                |
| `/about`          | About page (linked from the footer)                                                      |
| `/admin`          | Staff-only admin dashboard (see “Admin dashboard” below) — not indexed |
| `/privacy-policy`, `/terms` | Legal pages — **have them reviewed by a lawyer before launch**                |

Deep links: `/services#home-care`, `/book-a-visit?service=home`, `/contact?service=residential`.
The old `/booking` URL redirects permanently to `/book-a-visit` (`vercel.json`).

Every page is pre-rendered to static HTML at build time (`scripts/prerender.mjs`) with its own
title, description, canonical URL and Open Graph tags, then hydrated by React. Unknown URLs get `404.html`.

Design tokens and guidelines: see [DESIGN.md](DESIGN.md).

## Local development

```bash
npm install
cp .env.example .env.local   # set ADMIN_USERNAME / ADMIN_PASSWORD to try the dashboard
npm run dev                  # http://localhost:5173 — forms and /admin work here too (saved in ./.data)
```

| Script              | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| `npm run dev`       | Dev server, including `/api/*` routes (see `vite.config.ts`)         |
| `npm run build`     | Pull published content, optimize images, type-check, build and pre-render every page |
| `npm run preview`   | Serve the production build                                           |
| `npm run images`    | Re-generate optimised images from `src-images/` (see below)          |

## Forms & backend

Everything runs on Vercel — no other service is needed.

| Form            | Component                           | API                | Stored in the private Blob store            |
| --------------- | ----------------------------------- | ------------------ | ------------------------------------------- |
| Contact         | `src/components/forms/ContactForm`  | `api/contact.ts`   | `inbox/contact_submissions/<id>.json`       |
| Book a visit    | `src/components/forms/VisitForm`    | `api/visit.ts`     | `inbox/visit_requests/<id>.json` (status starts `requested`) |
| Job application | `src/components/forms/ApplicationForm` | `api/apply.ts`  | `inbox/job_applications/<id>.json` + `resumes/…` |

- Validation is shared by browser and server (`src/lib/validation.ts`); the server is the source of truth.
- Spam protection: hidden honeypot field + minimum time-on-form. Filtered requests get a silent "ok".
- Resumes: PDF/DOC/DOCX up to 3 MB, checked by file signature on the server, stored under a random name.
- Storage (`api/_lib/store.ts`) is a **private** Vercel Blob store: no file has a public URL. Submissions,
  resumes and uploaded photos are only readable through `/api/admin`, after the admin session is checked.
- Optional email alert per submission via [Resend](https://resend.com).
- Staff read and manage submissions in the admin dashboard (**Inbox**).

### One-time storage setup

1. Vercel → your project → **Storage** → **Create** → **Blob**. Choose **Private** access.
2. Connect it to the project (all environments). Vercel adds `BLOB_READ_WRITE_TOKEN` automatically.
3. Redeploy.

## Admin dashboard

Staff manage the website at **`/admin`** (e.g. `https://www.binaadultcare.com/admin`).

| Area | What you can do |
| --- | --- |
| **Dashboard** | Counts of hero images, gallery photos, team members and services; quick actions; latest form submissions |
| **Inbox** — Messages, Visit Requests, Applications | Read details, call/email in one tap, change status, add private staff notes, download resumes, delete entries |
| **Content** | Homepage Headline, Hero Images (homepage slideshow), Gallery, Services, Why Choose Us, Testimonials, FAQs |
| **People** | Team Members — names, roles, credentials, emails and short messages |
| **Locations** | Address and opening hours, with a map preview |
| **Job Positions** | Open positions on the Careers page (empty list shows “No Current Openings”) |
| **Settings** | Phone, email, Instagram / Facebook / LinkedIn links |

**Saving vs publishing:** edits are saved straight away. Press **Publish website** (top right) to rebuild the
public site with your changes — it goes live in about 1–2 minutes. The site stays fully static (fast, search-engine
friendly); photos uploaded in the dashboard are optimized during that rebuild.

**Security:** there is one login — an **Admin ID and password** stored as private Vercel settings
(`ADMIN_USERNAME`, `ADMIN_PASSWORD`). After signing in, the server sets a signed, HttpOnly session cookie
that lasts 8 hours; every dashboard request is checked on the server (`api/admin.ts`). After 5 wrong
attempts from the same connection, logins are blocked for 15 minutes. The browser never receives the storage
token, all stored files are private, and `/admin` is excluded from search engines.

### One-time setup

1. **Storage:** connect a private Blob store (see “One-time storage setup” above).
2. **Login:** in Vercel → Settings → Environment Variables, set `ADMIN_USERNAME` (your Admin ID) and
   `ADMIN_PASSWORD` (a strong password, 12+ characters).
3. **Publish button:** in Vercel → Project → Settings → Git → **Deploy Hooks**, create a hook for the
   production branch and save its URL as `VERCEL_DEPLOY_HOOK_URL`.
4. Redeploy, then sign in at `/admin`.

**Forgot the password / someone left?** Change `ADMIN_PASSWORD` in Vercel and redeploy — this also signs
out everyone who is currently signed in.

## Environment variables

Set in **Vercel → Project → Settings → Environment Variables**, then redeploy.

| Name                         | Where it’s used | Required | Description |
| ---------------------------- | --------------- | -------- | ----------- |
| `BLOB_READ_WRITE_TOKEN`      | server + build  | yes      | Added automatically when the private Blob store is connected — **secret** |
| `ADMIN_USERNAME`             | server          | for admin | The Admin ID used to sign in at `/admin` |
| `ADMIN_PASSWORD`             | server          | for admin | The admin password — **secret**, 12+ characters |
| `VERCEL_DEPLOY_HOOK_URL`     | server          | for admin | Deploy hook used by **Publish website** |
| `RESEND_API_KEY`             | server          | no       | Enables email alerts for new submissions |
| `CONTACT_NOTIFY_EMAIL`       | server          | no       | Alert recipient(s), comma-separated |
| `CONTACT_FROM_EMAIL`         | server          | no       | Verified Resend sender |

Without a connected Blob store, the live forms show a friendly “please call us” message, and the build uses the
content in `src/data/cms.json` (empty = the defaults in `src/data/*.ts`).

## Images

Source photos live in `src-images/`. `npm run images` writes WebP variants (480–1600 px) to `public/images/`,
a size manifest to `src/data/image-manifest.json`, and `public/og-image.jpg`.
`<ResponsiveImage name="…">` serves them with `srcset`, intrinsic dimensions and lazy loading.

To add or replace a photo: drop it in `src-images/`, run `npm run images`, then reference it by file name.

- **Facility photos** (`gallery-*`, `home-*`, `living-room`, `dining-room`, `bedroom`, `sitting-area`) are the real El Sobrante home, taken from the previous site.
- **Page hero photos** (`services-hero`, `team-hero`, `careers-hero`) are free stock photos from Unsplash
  (Unsplash License — free for commercial use, no attribution required), photographed by Age Cymru:
  [walker](https://unsplash.com/photos/2obyM4zYt3Y), [colouring](https://unsplash.com/photos/bSXk1lOp8T0),
  [nurse](https://unsplash.com/photos/dMhB7w99ju8). They show models, not Bina Adult Care staff or residents —
  replace them with real photos when available. All other photos are the real home.

## Business information

Most content is edited in the **admin dashboard**. The defaults it starts from live in `src/data/site.ts`, `src/data/content.ts` and `src/data/gallery.ts`; published dashboard content is written to `src/data/cms.json` at build time and takes priority.
Change them there and they update everywhere. Facebook and LinkedIn are set to `null` until confirmed.

## Deploying (GitHub + Vercel)

```bash
git init && git add -A && git commit -m "Bina Adult Care website"
git remote add origin git@github.com:<you>/bina-adult-care.git
git push -u origin main
```

Then in Vercel: **Add New → Project → Import** the repo. The framework (Vite), build command and output directory are read from `vercel.json`. Add the environment variables above, deploy, then point `www.binaadultcare.com` at the project under **Settings → Domains**.
