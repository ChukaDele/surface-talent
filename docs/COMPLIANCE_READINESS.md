# Surface Talent — website compliance readiness

**Scope of this document.** It records what the *public website* now says and does about
legal, privacy, AI-transparency and ethical-recruitment matters, and what remains to be done
**outside** the website before or during a pilot. It is documentation only — nothing here
changes application code, the production database, Recruitly, or scoring.

- **Pass completed:** 2026-08-20
- **Website source of record:** `ChukaDele/surface-talent` (`origin`) `main` @ `d08b80b`, mirrored to
  `ChukaDele/surface-talent-website` as branch `compliance/website-legal-readiness-20260820`
- **Hosting:** Cloudflare Pages project `surface-talent-website` (direct upload, no Git integration)
- **Temporary review URL (deployed):** `https://surface-talent-website.pages.dev`
- **Canonical domain:** `https://surfacetalent.co.uk/` — **NOT connected, and cutover is not
  authorised.** The owner reviews the temporary site first (see B14)
- **Retained placeholder:** `[COMPANY NUMBER]` — 22 occurrences across 18 pages. **Do not fill in
  by guessing.** The owner replaces it once Companies House registration completes.
- **Application changes in this pass:** zero.

---

## A. Done on the website

| # | Item | What changed | Evidence |
|---|------|--------------|----------|
| A1 | General privacy notice | `privacy.html` rewritten. Removed false Google Analytics and Microsoft Clarity disclosures. Lawful bases restated as a purpose-by-purpose table with legitimate interests / contractual necessity / legal obligation, and consent only where it genuinely applies. Added a software and AI-assisted processing section. Corrected processors to real categories. Corrected international transfers to UK adequacy / IDTA / UK Addendum. Added corporate disclosure with `[COMPANY NUMBER]`. | Source audit: no analytics code exists in the repository |
| A2 | Candidate privacy notice | New `candidate-privacy.html`. Plain-English notice covering controller, data categories, sources (including Recruitly and professional/public sources), purposes with a lawful-basis table, AI-assisted assessment, client sharing, transfers, retention, rights, human-review route, complaints | New page, linked from every footer and every candidate form |
| A3 | Fair recruitment / responsible AI | New `responsible-ai.html`. Describes what the technology does and does not do, nine named safeguards, an explicit "we do not claim bias-free operation" statement, and an explicit "not certified or audited" statement | New page, linked from every footer |
| A4 | Cookie notice matches reality | `cookies.html` rewritten. Site sets **no cookies**; removed the fabricated GA4 and six Clarity cookie rows and the false Airtable browser-cookie claim. Documents the two first-party session-storage keys (`st_landing`, `st_utm`), and the three third parties the browser actually contacts (Google Fonts, jsDelivr, Cloudflare) | Verified against source: no `document.cookie`, no analytics, no tag manager; only `sessionStorage` in `assets/attribution.js` |
| A5 | Consent vs acknowledgement | Form checkboxes changed from "I agree to the privacy policy" to "I have read the Candidate Privacy Notice" on `apply.html` and `candidates.html`, and to a notice acknowledgement on `contact.html`. No new checkboxes added. Representation permission left as a separate plain statement, not bundled into the checkbox | `apply.html`, `candidates.html`, `contact.html` |
| A6 | Modern slavery reframed | `modern-slavery.html` is now a voluntary "Modern slavery and ethical recruitment" policy that states plainly it is **not** a section 54 statement (threshold £36m, GOV.UK). Removed board approval, staff training programme, universal pre-placement verification and 12-week follow-up claims. Retained the no-candidate-fees commitment with its statutory basis, plus escalation routes and a "what we do not yet have in place" section | GOV.UK section 54 guidance; Employment Agencies Act 1973 s6; Conduct Regulations 2003 reg 26 |
| A7 | Rights and complaints route | New `privacy-requests.html`: what you can ask for, what to include, response times, limits, and escalation to the ICO and the Fair Work Agency | New page, linked from every footer |
| A8 | Terms of website use | New `terms.html`, website-scope only. Explicitly states it is not the recruitment terms of business | New page |
| A9 | Corporate disclosure and footer routes | Every page (18, including `404.html`) now carries the same legal link row — Privacy, Candidate privacy, Cookies, Responsible AI, Modern slavery, Terms, Privacy requests, Accessibility — plus a fine-print corporate disclosure line retaining `[COMPANY NUMBER]` | 18/18 pages verified |
| A10 | Accessibility statement | New `accessibility.html`. Claims WCAG 2.2 AA as a **target**, states no independent audit and no certification, lists what is implemented and five known limitations | Verified against source: skip links on all pages, `:focus-visible` styles, `prefers-reduced-motion` handling, 44px targets, `lang="en-GB"` |
| A11 | Unverified service promise removed | "We respond within 24 hours" (4 occurrences) softened to "We usually reply within one working day". Recorded in `docs/CLAIMS_LEDGER.md` | `candidates.html`, `jobs.html` |
| A12 | Vendor language corrected | Public notices now describe real processor **categories** plus the material named ones. Removed the implication that the browser contacts Airtable. Detailed vendor list to be maintained in the internal register (item B9) | `privacy.html`, `candidate-privacy.html`, `cookies.html` |
| A13 | Discovery of legal pages | `candidate-privacy` and `responsible-ai` added to `sitemap.xml`; all new trust and legal pages added to `llms.txt` | `sitemap.xml` validates as XML |
| A14 | Website credential hygiene | No live credential found client-side. `RECRUITLY`/Airtable/Apps Script secrets are read only from `env` inside Pages Functions (`functions/api/jobs.js`, `functions/api/jobs/[id].js`, `functions/api/submit.js`). `assets/jobs.js` calls the same-origin `/api/jobs` proxy, not `api.airtable.com`. No rotation required by this pass | Source audit 2026-08-20 |
| A15 | Non-essential device storage removed | `assets/attribution.js` no longer writes `st_landing` / `st_utm` to `sessionStorage`. PECR covers session storage as well as cookies, and campaign attribution is not "strictly necessary", so it could not lawfully be written before consent. Rather than put a consent banner in front of every visitor for two keys, the storage was removed. Attribution still works from parameters present on the page the form is submitted from | Verified in-browser: `document.cookie` empty, `localStorage` and `sessionStorage` empty on every page including form pages reached via a `utm_*` link |
| A16 | Form-submission transparency | `cookies.html` §4 and `privacy.html` §2 now state exactly what travels with a form: the submitting page URL including query string, `utm_*` and `gclid` if present, the referrer, and the form-start timestamp | `cookies.html`, `privacy.html` |
| A17 | Complaint-handling duty (DUAA 2025) | `privacy.html`, `candidate-privacy.html` and `privacy-requests.html` now commit to acknowledging a data protection complaint within 30 days, investigating without undue delay, keeping the complainant informed, and reporting the outcome. `privacy-requests.html` distinguishes a complaint from a rights request | Data (Use and Access) Act 2025, inserting s.164A / Art. 77A — legislation.gov.uk |
| A18 | Lawful bases narrowed to what the law supports | Contractual necessity limited to individuals personally party to a contract (client/supplier contacts moved to legitimate interests). Legal obligation limited to duties that actually fall on Surface Talent, with the employer's own right-to-work duty stated. B2B marketing now distinguishes corporate subscribers from sole traders and other individual subscribers under PECR | `privacy.html` §4, `candidate-privacy.html` §4 |
| A19 | Breach thresholds corrected | ICO notification at "risk to rights and freedoms"; notification of affected individuals only at "high risk", subject to exceptions — previously collapsed into one rule | `privacy.html` §11 |
| A20 | Article 14 timing corrected | Where information comes from Recruitly, referrals, public sources or employers, the notice is actively provided within one month, or earlier at first contact or before first disclosure — previously "the first time we make meaningful contact" | `candidate-privacy.html` §3 |
| A21 | Footer link contrast repaired | On the 8 legal pages the dark footer's site-nav links rendered at ~1.1:1 (near-black on near-black) because `styles.css` set `a { color: var(--anthracite) }` and `.site-foot__nav a` set no colour. Now 5.59:1. The new corporate-disclosure line was raised from 4.08:1 to ~6:1 | Measured in-browser on the preview at both desktop and 375px |
| A22 | Horizontal scroll on `/apply` and `/contact` fixed | Both form pages scrolled ~645px sideways at 1280px. `.visually-hidden` in `tokens.css` clamps to a 1px box, but `.form input { width: 100% }` in `site.css` has higher specificity and loads later, so the absolutely-positioned `_gotcha` spam honeypot was stretched to the full form width. Scoped the utility inside forms. Pre-existing — identical at `49520c9` | Measured on the deployed preview: 1925px scroll width in a 1280px viewport, page genuinely scrolled right; 0 overflow after the fix, all 17 pages |
| A23 | Asset caching no longer hides updates | `_headers` cached `/assets/*` for 7 days while the filenames carry no content hash, so any CSS/JS change stayed invisible to returning visitors for up to a week. It hid A22 from the reviewing browser minutes after deployment — the deployed file was correct while the page rendered the week-old stylesheet. Now `max-age=0, must-revalidate`, which ETags make cheap. Restore a long max-age only alongside real content hashing | Verified: `cache-control: public, max-age=0, must-revalidate` on `/assets/site.css`, and all 7 stylesheets/scripts on the shared alias now hash-match the repo |
| A24 | Cookie table no longer overflows on mobile | The third-party table in `cookies.html` pushed the page 4px past a 375px viewport, because long hostnames set a min-content floor. Cells now break long tokens | 0 overflowing pages at 375px and 1280px across all 17 routes |

### Website items deliberately NOT changed

- No visual redesign, no framework or CMS migration, no motion-system changes.
- The `privacy_consent` form field **name** was kept. It is enforced server-side in
  `functions/api/submit.js` and mapped into the Google Sheet. Only the user-facing label changed.
  Renaming the field is a coordinated website change (3 pages + `submit.js` + the Sheet column) and
  is listed as B12.
- The unmerged branch `codex/launch-readiness-website-20260815` (`3cffcf2`, landing-page
  accessibility and contrast fixes) was **not** folded into this pass. It is a separate change that
  should be reviewed and merged on its own merits — see B13.

---

## B. Required outside the website, before or during pilot

Split by who does the work. Nothing in this section is a code change to the website except
where it says "Website owner".

### B1. Owner / admin

Registrations, identities, mailboxes, money. None of this can be produced from the repository.

| # | Item | Status | Owner | Why | Blocks pilot? | Effort | Evidence required |
|---|------|--------|-------|-----|---------------|--------|-------------------|
| B0 | **Identify the current controller** | **Not done — P0 from independent review** | Owner | UK GDPR transparency requires the controller's identity. "Surface Talent" is a trading name with no incorporated entity yet, so the notices cannot name the legal person accountable for information already collected. The pages now say the controller is the person operating the business and that the full legal name is available on request — the honest interim position, but the name itself must be published. **This cannot be resolved from the repository; it needs the owner to state which existing person or entity is the controller today.** | **Yes** | 15 min once stated | The legal name published in `privacy.html` §1 and `candidate-privacy.html` §1 |
| B1 | Insert company number | Blocked on registration | Owner | 22 `[COMPANY NUMBER]` placeholders must become the real number. Legal notices should identify the contracting entity | **Yes** | 15 min once known | Companies House certificate; number visible on the register |
| B2 | Confirm `privacy@surfacetalent.co.uk` is monitored | Unconfirmed | Owner | It is the published route for every data right and privacy complaint on 8 pages. Domain MX is Google Workspace, but mailbox/alias existence and monitoring are not proven from outside. `hello@` is published as a fallback | **Yes** | 15 min | Successful test send and reply from an external address |
| B3 | ICO registration and data protection fee | Not done | Owner | Controllers using personal information must pay the fee unless exempt. Recruitment does not qualify for the not-for-profit exemption. Expected Tier 1 (£52) at ≤£632k turnover or ≤10 staff | **Yes** — process personal data without it and you are in breach | 30 min | ICO registration reference on the public register of fee payers. **Only then** may the site mention it — it currently makes no ICO registration claim |
| B4 | Named data protection contact | Not done | Owner | Someone must actually own privacy requests and the one-month clock. A DPO is not mandatory here, but a named responsible person is needed | **Yes** | 30 min | Named individual recorded in the internal policy |
| B18 | Insurance review | Not done | Owner | Professional indemnity and cyber cover appropriate to holding candidate personal data | No | Half day | Policy schedule |

### B2. Operating documents

Internal documents and procedures the published notices now depend on. The website makes the
promise; these make it real.

| # | Item | Status | Owner | Why | Blocks pilot? | Effort | Evidence required |
|---|------|--------|-------|-----|---------------|--------|-------------------|
| B5 | Record of processing activities (ROPA) | Not done | Owner | Art. 30 record. The public notices were written from a source audit, not from a maintained ROPA — they will drift | No, but expected on request | 1 day | ROPA covering purpose, categories, recipients, transfers, retention per activity |
| B6 | Lawful basis and legitimate interests assessments (LIA) | Not done | Owner | The site now publishes legitimate interests for sourcing, talent pool and assessment. Each needs a documented balancing test | No | 1 day | Written LIA per purpose |
| B7 | AI / DPIA for candidate assessment | Not done | Owner | Systematic evaluation of people for employment purposes using automated processing is high-risk profiling territory. A DPIA is very likely mandatory before the pilot processes real candidates at scale | **Yes** for scaled live use | 2–3 days | Completed DPIA with mitigations and sign-off |
| B8 | Retention schedule | Partly done | Owner | The 2-year candidate period is published and consistent across pages, but no internal schedule or deletion mechanism enforces it. A published period nobody enforces is worse than none | No | Half day | Written schedule plus an owner for the deletion routine |
| B9 | Vendor / subprocessor register | Not done | Owner | Public notices use categories and name the material processors. The detailed list, DPAs and transfer instruments must exist internally | No | Half day | Register naming each processor, purpose, location, transfer mechanism, DPA reference |
| B10 | International transfer review | Not done | Owner | Notices commit to UK adequacy / IDTA / UK Addendum. Each non-UK processor needs the actual instrument in place | No | Half day | Executed IDTA or Addendum per non-UK processor |
| B11 | Client recruitment terms of business | Not done | Owner | `terms.html` covers website use only and says so. Commercial terms — fees, rebates, liability, introductions — are a separate contract | **Yes** for paid placements | 1–2 days with legal input | Signed terms of business template |
| B16 | Breach / incident procedure | Not done | Owner | `privacy.html` commits to notifying the ICO and affected people. That commitment needs a procedure and a 72-hour clock behind it | No | Half day | Written procedure with roles and timings |
| B17 | Recruitment compliance and candidate representation SOPs | Not done | Owner | The site now makes firm operational promises: ask before every submission, never approach a current employer, confirm terms directly, escalate exploitation indicators. These must be written down so they survive the first busy week | No | 1 day | Written SOPs |

### B3. Website follow-ups

Website work deliberately left out of the compliance pass. **B14 is the canonical-domain cutover
and is explicitly NOT authorised** — the owner reviews the temporary Pages site first and will give
separate approval for any live-domain change.

| # | Item | Status | Owner | Why | Blocks pilot? | Effort | Evidence required |
|---|------|--------|-------|-----|---------------|--------|-------------------|
| B14 | Connect the custom domain to Cloudflare Pages | **Not done — and material** | Owner | `surfacetalent.co.uk` is **not** served by the `surface-talent-website` Pages project. It currently returns a single early-build page for every path from a Cloudflare zone outside the `Engineeringsapa1@gmail.com` account. Until the domain is connected, none of the work in section A is publicly reachable | **Yes** — nothing in section A is live without it | 30 min plus DNS propagation | `https://surfacetalent.co.uk/candidate-privacy` returns the new page, and a nonsense path returns the 404 page rather than the homepage |
| B12 | Rename `privacy_consent` field | Not done | Website owner | The visible wording is now an acknowledgement, but `functions/api/submit.js` still names the field `privacy_consent`, rejects submissions with `consent_required`, and records `privacy_consent: true`. The independent review flagged that this internal naming is operational evidence contradicting both notices' statement that acknowledging a notice is not consent. The required checkbox itself was kept because the task specified that wording; the field name should follow | No | 1 hour plus an end-to-end form test | Form submission succeeds and the Sheet column is renamed |
| B13 | Review and merge the landing a11y branch | Open | Website owner | `codex/launch-readiness-website-20260815` (`3cffcf2`) holds landing-page accessibility and contrast fixes that never reached production | No | 1 hour | Reviewed diff, preview QA, merged |
| B15 | Restore cross-page attribution, with consent | Optional | Owner / website owner | The session-storage attribution was **removed** (A15) rather than left unconsented, so campaign attribution now only survives if the visitor enquires from the page they landed on. If cross-page attribution matters commercially, it needs a consent mechanism — and `cookies.html` must be updated before any storage is reintroduced | No | Half day | A consent gate that blocks the storage until accepted, plus updated `cookies.html` |

---

## C. Deferred / scale

| # | Item | Why deferred | Revisit when |
|---|------|--------------|--------------|
| C1 | Candidate rights self-service portal | Email is a legitimate MVP route and the volume does not justify a build. Explicitly out of scope for this pass | Subject request volume becomes unmanageable by email |
| C2 | Automated retention and deletion workflow | The 2-year rule can be operated manually at pilot scale | Candidate record count outgrows manual review |
| C3 | Formal fairness / bias monitoring dashboard | Needs a real outcome dataset. Publishing metrics from a handful of placements would mislead | Enough placement outcomes exist to measure without fabricating a signal |
| C4 | Independent accessibility audit and a WCAG conformance claim | `accessibility.html` currently claims AA as a target and states no audit has happened. That is honest and sufficient | Before any public sector or enterprise client requires a conformance statement |
| C5 | Section 54 modern slavery statement | Statutory duty starts at £36m turnover. The voluntary policy is the correct instrument now | Turnover approaches the threshold, or a client contractually requires a statement |
| C6 | Cyber Essentials | Useful trust signal, not a legal requirement | An enterprise client or tender requires it |
| C7 | ISO 27001 / SOC 2 | Disproportionate at this stage | Enterprise procurement demands it |
| C8 | EU AI Act compliance package | The AI Act's employment-related high-risk obligations bind EU deployers and providers. Current operations are UK-only, UK-placed | Any EU candidate or client processing begins |
| C9 | Temporary worker / umbrella compliance (AWR, conduct regs for employment businesses) | The published model is permanent, contract and interim placement, not supplying temporary agency workers on our own payroll | Before supplying temporary workers as an employment business |

---

## Verification record for this pass

| Check | Result |
|-------|--------|
| Local links across all pages | 532 resolved, 0 broken |
| Placeholder sweep (`TODO`, `REPLACE_`, `FIXME`, `lorem`, `localhost`, `127.0.0.1`, `dummy`, `XXX`, `TBC/TBD`) | Clean |
| Bracket placeholders | 22 occurrences, all `[COMPANY NUMBER]` — intentional |
| Corporate disclosure coverage | 18/18 HTML pages |
| Stale analytics claims (`Google Analytics`, `Microsoft Clarity`, `_ga`, `_clck`) | Removed from `privacy.html`; only the explicit "no analytics" statements remain in `cookies.html` |
| `sitemap.xml` | Valid XML |
| Client-side secrets | None found |
| Application code changed | None |
| Horizontal overflow, 17 routes × {1280px, 375px} | 0 |
| Live jobs feed on the preview | `/api/jobs` returns real Airtable records; `/job?id=…` renders a role with an `h1` |

### Primary sources used

- Modern Slavery Act 2015 s54 threshold and approval requirements — GOV.UK, *Publish an annual modern slavery statement*
- Employment Agencies Act 1973 s6 and Conduct of Employment Agencies and Employment Businesses Regulations 2003 reg 26 — legislation.gov.uk / GOV.UK
- ICO data protection fee tiers and exemptions — ico.org.uk
- Fair Work Agency (operational from 7 April 2026, replacing the Employment Agency Standards Inspectorate) — GOV.UK
- Modern Slavery and Exploitation Helpline, 08000 121 700 — GOV.UK / modernslaveryhelpline.org

---

## Independent content review

An independent read-only compliance red-team review was run against commit `c4134b7` using a
different provider (Codex, `codex-cli` 0.147.0) so that the reviewer was not the author. Its
verdict was **REQUEST CHANGES**, with 3 P0 and 8 P1/P2 findings.

### Accepted and fixed

| Finding | Resolution |
|---|---|
| P0 — controller not legally identified (`privacy.html`, `candidate-privacy.html`) | Copy improved to state that Surface Talent is currently a trading name, that the controller is the person operating it, and that the full legal name is available on request. **Not fully closed** — publishing the name needs the owner. Tracked as B0, and it blocks pilot |
| P0 — "no consent needed" / "no tracking" unsupportable while `sessionStorage` attribution runs | Fixed at the root: the storage was removed (A15), so the claim is now literally true. Copy rewritten to match, plus a new section on what a form submission actually sends (A16) |
| P1 — stored values under-described (full URL, `gclid`) | Superseded by removal; the same detail is now disclosed for form submissions instead (A16) |
| P1 — Article 14 notification timing | Corrected to within one month, or earlier at first contact or before first disclosure (A20) |
| P1 — B2B marketing basis ignored PECR subscriber distinctions | Corrected (A18) |
| P1 — contractual necessity too broad for client/supplier contacts | Corrected (A18) |
| P1 — legal obligation too broad for right-to-work and equality records | Corrected (A18) |
| P1 — complaint-handling duty omitted | Added across three pages (A17) |
| P1 — breach-notification thresholds collapsed | Corrected (A19) |
| P1 — accessibility statement contained absolutes it cannot guarantee | Softened: an inaccessible page will not be the reason an application fails to reach us, and adjustments are discussed and put to the employer rather than guaranteed |
| P2 — one-month response promise contradicted the requests page | Both pages now state the same rule, including the lawful extension |

### Considered and deliberately not changed

| Finding | Reason |
|---|---|
| P1 — the mandatory notice-acknowledgement checkbox is arguably contradictory "consent" evidence | The acknowledgement wording was specified by the task, and both notices state plainly that acknowledging them is not a lawful basis. `functions/api/submit.js` also requires the field, so removing the checkbox breaks submissions. The reviewer's underlying point is real and is tracked as B12 (rename the field), not as a copy change |

### Reviewer findings with no defect

The reviewer separately confirmed that `responsible-ai.html` and the AI sections of the candidate
notice accurately describe the product's actual behaviour without claiming bias-free operation or
certification, and that `modern-slavery.html` correctly presents itself as a voluntary policy
rather than a section 54 statement, with a current and accurate Fair Work Agency reference.

### Residual P0

One P0 remains open: **B0, the current controller's legal identity.** It cannot be closed from the
repository, and it is not the `[COMPANY NUMBER]` placeholder — it is the separate question of which
existing person or entity is the controller before incorporation. The published copy is the most
accurate wording available without inventing a legal name, and it gives readers a route to obtain
it.
