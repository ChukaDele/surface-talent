# Surface Talent — website compliance readiness

**Scope of this document.** It records what the *public website* now says and does about
legal, privacy, AI-transparency and ethical-recruitment matters, and what remains to be done
**outside** the website before or during a pilot. It is documentation only — nothing here
changes application code, the production database, Recruitly, or scoring.

- **Pass completed:** 2026-08-20
- **Website repository:** `ChukaDele/surface-talent-website`
- **Branch:** `compliance/website-legal-readiness-20260820` (based on `main` @ `49520c9`)
- **Live domain:** `https://surfacetalent.co.uk/`
- **Hosting:** Cloudflare Pages project `surface-talent-website` (direct upload, no Git integration)
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

| # | Item | Status | Owner | Why | Blocks pilot? | Effort | Evidence required |
|---|------|--------|-------|-----|---------------|--------|-------------------|
| B1 | Insert company number | Blocked on registration | Owner | 22 `[COMPANY NUMBER]` placeholders must become the real number. Legal notices should identify the contracting entity | **Yes** | 15 min once known | Companies House certificate; number visible on the register |
| B2 | Confirm `privacy@surfacetalent.co.uk` is monitored | Unconfirmed | Owner | It is the published route for every data right and privacy complaint on 8 pages. Domain MX is Google Workspace, but mailbox/alias existence and monitoring are not proven from outside. `hello@` is published as a fallback | **Yes** | 15 min | Successful test send and reply from an external address |
| B3 | ICO registration and data protection fee | Not done | Owner | Controllers using personal information must pay the fee unless exempt. Recruitment does not qualify for the not-for-profit exemption. Expected Tier 1 (£52) at ≤£632k turnover or ≤10 staff | **Yes** — process personal data without it and you are in breach | 30 min | ICO registration reference on the public register of fee payers. **Only then** may the site mention it — it currently makes no ICO registration claim |
| B4 | Named data protection contact | Not done | Owner | Someone must actually own privacy requests and the one-month clock. A DPO is not mandatory here, but a named responsible person is needed | **Yes** | 30 min | Named individual recorded in the internal policy |
| B5 | Record of processing activities (ROPA) | Not done | Owner | Art. 30 record. The public notices were written from a source audit, not from a maintained ROPA — they will drift | No, but expected on request | 1 day | ROPA covering purpose, categories, recipients, transfers, retention per activity |
| B6 | Lawful basis and legitimate interests assessments (LIA) | Not done | Owner | The site now publishes legitimate interests for sourcing, talent pool and assessment. Each needs a documented balancing test | No | 1 day | Written LIA per purpose |
| B7 | AI / DPIA for candidate assessment | Not done | Owner | Systematic evaluation of people for employment purposes using automated processing is high-risk profiling territory. A DPIA is very likely mandatory before the pilot processes real candidates at scale | **Yes** for scaled live use | 2–3 days | Completed DPIA with mitigations and sign-off |
| B8 | Retention schedule | Partly done | Owner | The 2-year candidate period is published and consistent across pages, but no internal schedule or deletion mechanism enforces it. A published period nobody enforces is worse than none | No | Half day | Written schedule plus an owner for the deletion routine |
| B9 | Vendor / subprocessor register | Not done | Owner | Public notices use categories and name the material processors. The detailed list, DPAs and transfer instruments must exist internally | No | Half day | Register naming each processor, purpose, location, transfer mechanism, DPA reference |
| B10 | International transfer review | Not done | Owner | Notices commit to UK adequacy / IDTA / UK Addendum. Each non-UK processor needs the actual instrument in place | No | Half day | Executed IDTA or Addendum per non-UK processor |
| B11 | Client recruitment terms of business | Not done | Owner | `terms.html` covers website use only and says so. Commercial terms — fees, rebates, liability, introductions — are a separate contract | **Yes** for paid placements | 1–2 days with legal input | Signed terms of business template |
| B12 | Rename `privacy_consent` field | Not done | Website owner | The user-facing wording is now an acknowledgement, but the field name and the Sheet column still say "consent". Cosmetic internally, but it invites the wrong legal reading later | No | 1 hour plus an end-to-end form test | Form submission succeeds and the Sheet column is renamed |
| B13 | Review and merge the landing a11y branch | Open | Website owner | `codex/launch-readiness-website-20260815` (`3cffcf2`) holds landing-page accessibility and contrast fixes that never reached production | No | 1 hour | Reviewed diff, preview QA, merged |
| B14 | Connect the custom domain to Cloudflare Pages | **Not done — and material** | Owner | `surfacetalent.co.uk` is **not** served by the `surface-talent-website` Pages project. It currently returns a single early-build page for every path from a Cloudflare zone outside the `Engineeringsapa1@gmail.com` account. Until the domain is connected, none of the work in section A is publicly reachable | **Yes** — nothing in section A is live without it | 30 min plus DNS propagation | `https://surfacetalent.co.uk/candidate-privacy` returns the new page, and a nonsense path returns the 404 page rather than the homepage |
| B15 | Confirm the session-storage basis | Open judgement call | Owner | `st_landing` / `st_utm` are first-party, tab-scoped, shared with nobody and used to give an enquiry context. `cookies.html` discloses them fully. Whether they are "strictly necessary" under PECR is a judgement; the conservative alternative is to drop the cross-page memory | No | 1 hour if removal is chosen | Documented decision, or the code change |
| B16 | Breach / incident procedure | Not done | Owner | `privacy.html` commits to notifying the ICO and affected people. That commitment needs a procedure and a 72-hour clock behind it | No | Half day | Written procedure with roles and timings |
| B17 | Recruitment compliance and candidate representation SOPs | Not done | Owner | The site now makes firm operational promises: ask before every submission, never approach a current employer, confirm terms directly, escalate exploitation indicators. These must be written down so they survive the first busy week | No | 1 day | Written SOPs |
| B18 | Insurance review | Not done | Owner | Professional indemnity and cyber cover appropriate to holding candidate personal data | No | Half day | Policy schedule |

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

### Primary sources used

- Modern Slavery Act 2015 s54 threshold and approval requirements — GOV.UK, *Publish an annual modern slavery statement*
- Employment Agencies Act 1973 s6 and Conduct of Employment Agencies and Employment Businesses Regulations 2003 reg 26 — legislation.gov.uk / GOV.UK
- ICO data protection fee tiers and exemptions — ico.org.uk
- Fair Work Agency (operational from 7 April 2026, replacing the Employment Agency Standards Inspectorate) — GOV.UK
- Modern Slavery and Exploitation Helpline, 08000 121 700 — GOV.UK / modernslaveryhelpline.org
