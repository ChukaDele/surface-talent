# Surface Talent — Google Apps Script submissions

Connects Cloudflare `/api/submit` → Google Sheet + Drive CV folder + email.

## Existing resources (do not recreate)

| Resource | ID |
|----------|-----|
| Spreadsheet | `1r3jM0vzVdJUD4t89yTabVvGx9HJ0DkXKm0ztaSdMWkM` |
| CV folder | `1sgZaaBpPlFwkpeVumf9Qu7vSyvgE2yJm` |
| Notify | `hello@surfacetalent.co.uk` |

## Workbook architecture (redesigned)

Visible operational tabs:

`Inbox`, `Home`, `Clients`, `Candidates`, `Disciplines`, `Jobs`, `About`, `Contact`, `Applications`

Hidden infrastructure:

`_Config`, `_Audit`, `_Raw`

### Write pattern

Every successful submission writes **exactly four places**:

1. **`_Raw`** — full normalized source of truth (timestamps, attribution, UTMs, E.164 phone, etc.)
2. **`Inbox`** — concise triage row (`Status` default **New** — no UTM dump)
3. **ONE** operational/page tab (never spray into unrelated tabs)
4. **`_Audit`** — technical write/email/CV results

Rows are mapped by **header name** (sheet row 1), not column index. Existing page-tab schemas are respected; the script does **not** recreate the old universal 38-column layout on every page tab.

Arrays are stored as human-readable delimited text, e.g. `Anodising | Electroplating`.

### Routing (allowlisted)

| Form type | Page tab |
|-----------|----------|
| `candidate_registration` | `Candidates` |
| `job_application` | `Applications` |
| `contact_hiring` | `Clients` if `source_page=clients`; `Home` / `Disciplines` / `Jobs` / `About` when those are the source; else `Contact` |
| `contact_career_move` | `Contact` |
| `contact_general` | `Contact` |

The browser never chooses a sheet name.

### Inbox columns

`Received`, `Submission ID`, `Type`, `Name`, `Company / Current Role`, `Email`, `Phone`, `Source`, `Role / Job`, `Status`, `Owner`, `Next Follow-up`, `CV / Record Link`, `Notes`

## Deploy (owner)

1. Open [script.google.com](https://script.google.com) → **New project** (or open the existing Surface Talent project).
2. Paste `Code.gs` contents. Save as **Surface Talent Website Submissions**.
3. **Project Settings → Script properties** → add:
   - `WEBHOOK_SECRET` = same value as Cloudflare `SUBMISSION_SECRET`
4. Confirm the Google account can edit the spreadsheet and the CV folder.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (auth is the shared secret)
6. Copy the Web App URL → Cloudflare Pages env `APPS_SCRIPT_URL`.

## Cloudflare env

```
APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
SUBMISSION_SECRET=<shared secret>
AIRTABLE_TOKEN=<read-only>
AIRTABLE_BASE_ID=<app...>
AIRTABLE_TABLE=Jobs
```

## Test

```bash
curl -X POST https://YOUR_PREVIEW/api/submit \
  -F form_type=contact_general \
  -F name="Test User" \
  -F email="test@example.com" \
  -F enquiry_type="General enquiry" \
  -F message="Launch pipeline test" \
  -F privacy_consent=on \
  -F source_page=contact \
  -F _form_started=$(($(date +%s%3N)-5000))
```

Expect rows in **`_Raw` + `Inbox` + `Contact`**, an `_Audit` entry, and email to `hello@surfacetalent.co.uk`.

## Auth note for Cloudflare

Apps Script web apps sometimes drop custom headers. Cloudflare `/api/submit` also appends `?secret=` (server-side only — never expose to the browser).
