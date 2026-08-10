# Surface Talent — Website

A multi-page static website built to launch `surfacetalent.co.uk`. Designed to run free on Cloudflare Pages or Netlify, with a live jobs list wired to Airtable.

## What's in this folder

```
Website/
├── index.html          Home
├── clients.html        For clients
├── candidates.html     For candidates
├── disciplines.html    Six process lanes
├── jobs.html           Live jobs list (pulls from Airtable)
├── job.html            Individual role detail (pulls from Airtable)
├── about.html          About + leadership appointments
├── contact.html        Contact (call / form / direct)
├── assets/
│   ├── styles.css      Shared stylesheet
│   └── jobs.js         Airtable integration
├── README.md           You are here
└── airtable-schema.md  Exact Airtable base setup
```

## Quick start — ship the site in under an hour

### Step 1. Test the site locally

Double-click `index.html` to open in your browser. Everything works except the live jobs list (which needs Airtable configured). Click through every page to check it looks right on your screen.

**If you're testing CSS/JS changes in Chrome and edits don't seem to take effect:** Chrome will keep serving a stale cached copy of `assets/*.css`/`assets/*.js` across repeat loads of a plain static server, even after a hard reload — this cost real debugging time during a full-site QA pass (2026-08-09). Run `python3 .devserver.py` instead of `python3 -m http.server` for local testing; it sends `Cache-Control: no-store` and `Clear-Site-Data` on every response so edits always show up on the next reload.

### Step 2. Buy the domain

Check availability of `surfacetalent.co.uk` at a UK registrar. Recommended options:

- **Cloudflare Registrar** — cheapest, at-cost pricing, no upsells. Requires Cloudflare account.
- **Gandi** — clean UI, solid support, slightly more expensive.
- **123-reg or Namecheap** — mainstream, fine.

If `surfacetalent.co.uk` isn't available, alternatives in descending order of preference:
- `surfacetalent.com`
- `surfacetalentuk.co.uk`
- `surface-talent.co.uk`
- `surfacetalent.io`

Budget about £8–12 per year for `.co.uk`.

### Step 3. Host the site on Cloudflare Pages

Free, fast, globally served. Takes 5 minutes.

1. Create a free account at **dash.cloudflare.com**.
2. Go to **Workers &amp; Pages → Create → Pages → Upload assets**.
3. Name the project `surfacetalent`.
4. Drag the entire `Website` folder contents (the files, not the folder itself) into the upload area.
5. Click **Deploy**.

You'll get a temporary URL like `surfacetalent.pages.dev`. Check it works.

### Step 4. Connect your domain

In the Cloudflare Pages project:
1. **Custom domains → Set up a custom domain**.
2. Enter `surfacetalent.co.uk` (and `www.surfacetalent.co.uk`).
3. If you bought the domain at Cloudflare, it's automatic.
4. If you bought elsewhere, Cloudflare will give you DNS records to add at your registrar.

Allow up to 24 hours for DNS to propagate.

### Step 5. Wire up the live jobs list

See **Airtable setup** below.

### Step 6. Wire up forms (Sheets + Drive + email)

Forms post to same-origin `/api/submit` (Cloudflare Pages Function), which forwards to Google Apps Script.

See `docs/DEPLOY.md` and `integrations/google-apps-script/README.md`.

Required Cloudflare secrets: `APPS_SCRIPT_URL`, `SUBMISSION_SECRET`, plus Airtable vars for jobs.

### Step 7. Confirm live contact details

Booking link (canonical): `https://calendar.app.google/Wdm9xHVcBNwS2VuS7`

Email: `hello@surfacetalent.co.uk` · Phone: `+44 7798 673 654`

## Airtable setup

### Step 1. Create the base

1. Log in to **airtable.com** and create a new base called **Surface Talent — Jobs**.
2. Rename the first table to **Jobs**.
3. Set up the fields exactly as described in `airtable-schema.md`.

### Step 2. Create a read-only access token

1. Go to **airtable.com/create/tokens**.
2. Click **Create new token**.
3. Name it `Surface Talent website (read-only)`.
4. Scope: **data.records:read**.
5. Access: add the **Surface Talent — Jobs** base.
6. Create. Copy the token (starts with `pat...`).

### Step 3. Find your base ID

1. With the base open, look at the URL: `airtable.com/appXXXXXXXXXXXXXX/...`
2. The `appXXXXXXXXXXXXXX` part is your base ID.

### Step 4. Connect the site via a server-side proxy

**Do not paste the token into `assets/jobs.js`.** Anything in that file is visible to every visitor in the page source, even a "read-only" token — it exposes all your role data, lets anyone hammer your Airtable quota, and tokens have a habit of getting wider scopes over time.

Instead, keep the token server-side:

1. In Cloudflare Pages, go to your project → **Settings → Environment variables** and add `AIRTABLE_TOKEN`.
2. Add a Pages Function at `functions/api/jobs.js` that calls the Airtable API with that token and returns the JSON.
3. Point `fetchJobs()` / `fetchJob()` in `assets/jobs.js` at `/api/jobs` instead of `api.airtable.com`.

Until the proxy is in place the jobs pages show a friendly "get in touch for the current list" fallback, so the site still works.

Redeploy to Cloudflare Pages by dragging the updated folder in again, or hook up Git for automatic deploys.

### Step 5. Add roles

In Airtable, add a row per role. Set **Status = Live** for roles you want to show. **Status = Draft** or **Closed** hides them.

The seven launch roles are listed in `airtable-schema.md` so you can copy-paste them in.

## Security notes

A token was hardcoded in this site's source (`assets/jobs.js`) and shipped in the browser bundle of the live public site. It has been removed from the file (2026-08-09) — `assets/jobs.js` now calls `/api/jobs` instead of Airtable directly, matching Step 4 below. **You should still revoke that token in Airtable now** (airtable.com/create/tokens → delete it), because anyone who viewed the deployed site's source or the public git history may have copied it. Until a proxy exists at `/api/jobs`, the jobs pages show the "get in touch for the current list" fallback described below — this is expected, not a bug.

Never ship any API token in browser-delivered files. Keep tokens in environment variables and call Airtable from a Cloudflare Pages Function (see Step 4 above).

## What this gets you at launch

- Professional, branded website at your domain
- Live jobs list you update from a spreadsheet-style interface
- Individual role pages with clean URLs (`job.html?id=recXXX`)
- Three contact routes (book a call, form, direct email)
- SEO-ready meta tags on every page
- Mobile-responsive across all breakpoints
- Free hosting, free forms, cheap domain

## When to upgrade

Migrate to a proper CMS (Webflow or similar) or a full ATS (Loxo, Bullhorn, JobAdder) when you hit one of these:

- More than 20 live roles at a time
- Need candidate portal / self-service applications
- Need interview scheduling, pipelines, invoicing integrations
- Non-technical team members need to edit every page (not just jobs)

Until then, this stack is faster, cheaper and more under your control.

## Questions or changes

Most edits are straightforward: open the HTML in a text editor, change the text, save, re-upload the folder to Cloudflare Pages. Larger changes (new pages, design tweaks) come back to me.
