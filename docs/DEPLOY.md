# Surface Talent — production deploy

## Hosting

Production must be **Cloudflare Pages** (not GitHub Pages alone) because `/api/submit` and `/api/jobs` are Pages Functions.

Domain: `https://surfacetalent.co.uk/`

## Environment variables (Cloudflare Pages → Settings → Environment variables)

| Name | Secret? | Notes |
|------|---------|-------|
| `APPS_SCRIPT_URL` | yes | Web app `/exec` URL |
| `SUBMISSION_SECRET` | yes | Same as Apps Script `WEBHOOK_SECRET` |
| `AIRTABLE_TOKEN` | yes | New read-only token (do not reuse any previously exposed token) |
| `AIRTABLE_BASE_ID` | yes | Airtable base id `app…` |
| `AIRTABLE_TABLE` | no | Default `Jobs` |

## Google Apps Script

See `integrations/google-apps-script/README.md`.

Resources (already created — do not recreate):

- Sheet: `1r3jM0vzVdJUD4t89yTabVvGx9HJ0DkXKm0ztaSdMWkM`
- CV folder: `1sgZaaBpPlFwkpeVumf9Qu7vSyvgE2yJm`

Workbook write pattern (redesigned — do not restore old universal page schemas):

1. `_Raw` (full attribution)
2. `Inbox` (triage, Status=New)
3. ONE page tab (`Contact` / `Candidates` / `Applications` / …)
4. `_Audit`

## GitHub Pages

After Cloudflare production is live, disable GitHub Pages or keep it as a non-indexed preview only. Do not leave competing indexed canonicals.

## Local API preview

```bash
npx wrangler pages dev . --port 8788
```

## Owner actions still required for full go-live

1. Deploy Apps Script web app + set `WEBHOOK_SECRET`
2. Set Cloudflare secrets above
3. Provide Airtable base id + new read-only token
4. Confirm legal entity / company number for privacy pages
5. Supply named Surface Talent people for About
6. Connect custom domain DNS to Cloudflare Pages when preview passes
