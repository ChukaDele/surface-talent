/*
 * Surface Talent — Airtable jobs integration via /api/jobs proxy.
 * Do NOT put an Airtable token in this file.
 *
 * GET /api/jobs  -> { records: [...] }
 * GET /api/jobs/:id -> { id, fields }
 */

async function fetchJobs() {
  const res = await fetch("/api/jobs");
  if (!res.ok) throw new Error(`Jobs API error ${res.status}`);
  const data = await res.json();
  return data.records.map((r) => ({ id: r.id, ...r.fields }));
}

async function fetchJob(id) {
  const res = await fetch(`/api/jobs/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Jobs API error ${res.status}`);
  const data = await res.json();
  return { id: data.id, ...data.fields };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function paragraphs(text) {
  if (!text) return "";
  return escapeHtml(text)
    .split(/\n+/)
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");
}

function stateBlock({ title, body, primaryHref, primaryLabel, secondaryHref, secondaryLabel }) {
  return `<div class="jobs-state">
    <p class="mono">Jobs board</p>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(body)}</p>
    <div class="cta-row">
      ${primaryHref ? `<a href="${primaryHref}" class="btn btn--copper">${escapeHtml(primaryLabel)}</a>` : ""}
      ${secondaryHref ? `<a href="${secondaryHref}" class="btn">${escapeHtml(secondaryLabel)}</a>` : ""}
    </div>
  </div>`;
}

function renderJobList(target, jobs, { hasFilters = false, boardEmpty = false } = {}) {
  if (!jobs.length) {
    if (boardEmpty && !hasFilters) {
      target.innerHTML = stateBlock({
        title: "No live roles right now.",
        body: "We're selective about what we post. Join the talent pool and we'll get in touch when a strong fit comes up — or book a confidential conversation.",
        primaryHref: "candidates.html#register",
        primaryLabel: "Join our talent pool",
        secondaryHref: "https://calendar.app.google/Wdm9xHVcBNwS2VuS7",
        secondaryLabel: "Book a confidential call",
      });
      return;
    }
    target.innerHTML = stateBlock({
      title: "No roles match these filters.",
      body: "Clear the filters, browse again, or join the talent pool — we'll follow up when something fits.",
      primaryHref: "candidates.html#register",
      primaryLabel: "Join our talent pool",
      secondaryHref: "#filters",
      secondaryLabel: "Adjust filters",
    });
    return;
  }

  target.innerHTML = `<div class="jobs-panel">${jobs
    .map(
      (j) => `<a href="job.html?id=${encodeURIComponent(j.id)}" class="job-row">
      <span>
        <span class="job-row__title">${escapeHtml(j.Title || "Untitled role")}</span>
        ${j.Subtitle ? `<span class="job-row__sub">${escapeHtml(j.Subtitle)}</span>` : ""}
      </span>
      <span class="job-row__meta">
        ${j.Location ? `<span>${escapeHtml(j.Location)}</span>` : ""}
        ${j.Salary ? `<span>${escapeHtml(j.Salary)}</span>` : ""}
        ${j.Type ? `<span>${escapeHtml(j.Type)}</span>` : ""}
        ${j.Discipline ? `<span>${escapeHtml(j.Discipline)}</span>` : ""}
      </span>
      <span class="job-row__go">View role →</span>
    </a>`
    )
    .join("")}</div>`;
}

function applyFilters(jobs, { q, discipline, funcArea, seniority, type }) {
  return jobs.filter((j) => {
    if ((j.Status || "Live") !== "Live") return false;
    if (discipline && j.Discipline !== discipline) return false;
    if (funcArea && j.Function !== funcArea) return false;
    if (seniority && j.Seniority !== seniority) return false;
    if (type && j.Type !== type) return false;
    if (q) {
      const hay = `${j.Title || ""} ${j.Subtitle || ""} ${j.Location || ""} ${j.Discipline || ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
}

function syncActiveState(els) {
  els.forEach((el) => {
    if (!el) return;
    el.classList.toggle("is-active", Boolean(el.value && String(el.value).trim()));
  });
}

function initJobsList() {
  const listEl = document.getElementById("jobs-list");
  const countEl = document.getElementById("jobs-count");
  const totalEl = document.getElementById("jobs-total");
  const q = document.getElementById("q");
  const disc = document.getElementById("discipline");
  const func = document.getElementById("function");
  const sen = document.getElementById("seniority");
  const type = document.getElementById("type");
  const reset = document.getElementById("filter-reset");
  if (!listEl) return;

  // Prefill from URL (disciplines deep-link)
  const params = new URLSearchParams(location.search);
  if (disc && params.get("discipline")) disc.value = params.get("discipline");
  if (func && params.get("function")) func.value = params.get("function");
  if (sen && params.get("seniority")) sen.value = params.get("seniority");
  if (type && params.get("type")) type.value = params.get("type");
  if (q && params.get("q")) q.value = params.get("q");

  listEl.innerHTML = `<div class="jobs-state"><p class="mono">Loading</p><h3>Loading live roles…</h3><p>Fetching the current board.</p></div>`;

  const controls = [q, disc, func, sen, type];

  fetchJobs()
    .then((jobs) => {
      const live = jobs.filter((j) => (j.Status || "Live") === "Live");
      if (totalEl) totalEl.textContent = String(live.length);

      const render = () => {
        const filtered = applyFilters(live, {
          q: q?.value,
          discipline: disc?.value,
          funcArea: func?.value,
          seniority: sen?.value,
          type: type?.value,
        });
        const hasFilter = controls.some((el) => el && el.value && String(el.value).trim());
        renderJobList(listEl, filtered, {
          hasFilters: hasFilter,
          boardEmpty: live.length === 0,
        });
        if (countEl) countEl.textContent = String(filtered.length);
        syncActiveState(controls);
        if (reset) reset.hidden = !hasFilter;
      };

      render();
      controls.forEach((el) => el && el.addEventListener("input", render));
      reset?.addEventListener("click", () => {
        controls.forEach((el) => {
          if (!el) return;
          el.value = "";
        });
        const url = new URL(location.href);
        ["discipline", "function", "seniority", "type", "q"].forEach((k) => url.searchParams.delete(k));
        history.replaceState({}, "", url.pathname + url.search);
        render();
      });
    })
    .catch((err) => {
      console.error(err);
      listEl.innerHTML = stateBlock({
        title: "Jobs board unavailable.",
        body: "We couldn't reach the live roles API. Join the talent pool and we'll follow up within 24 hours, or try again shortly.",
        primaryHref: "candidates.html#register",
        primaryLabel: "Join our talent pool",
        secondaryHref: "contact.html",
        secondaryLabel: "Contact us",
      });
      if (countEl) countEl.textContent = "—";
    });
}

function initJobDetail() {
  const wrap = document.getElementById("job-detail");
  if (!wrap) return;
  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    wrap.innerHTML = `<div class="container" style="padding:4rem 0">${stateBlock({
      title: "No role selected.",
      body: "Browse the live board or join the talent pool.",
      primaryHref: "jobs.html",
      primaryLabel: "See live roles",
      secondaryHref: "candidates.html#register",
      secondaryLabel: "Join our talent pool",
    })}</div>`;
    return;
  }

  fetchJob(id)
    .then((j) => {
      const title = j.Title || "Role";
      const desc = (j.Hook || j.TheRole || `${title} — live surface engineering role with Surface Talent.`).replace(/\s+/g, " ").trim().slice(0, 160);
      document.title = `${title} — Surface Talent`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", desc);
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      const canonUrl = `https://surfacetalent.co.uk/job?id=${encodeURIComponent(id)}`;
      canonical.setAttribute("href", canonUrl);

      // Remove prior JobPosting
      document.querySelectorAll('script[data-job-ld]').forEach((n) => n.remove());
      const ld = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title,
        description: (j.TheRole || j.Hook || title).toString(),
        datePosted: j.DatePosted || j.Created || undefined,
        validThrough: j.ValidThrough || undefined,
        employmentType: mapEmploymentType(j.Type),
        identifier: { "@type": "PropertyValue", name: "Surface Talent", value: id },
        hiringOrganization: j.Company
          ? { "@type": "Organization", name: j.Company }
          : {
              "@type": "Organization",
              name: "Surface Talent",
              url: "https://surfacetalent.co.uk/",
              description: "Specialist recruiter posting on behalf of a confidential client.",
            },
        jobLocation: j.Location
          ? {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: j.Location,
                addressCountry: "GB",
              },
            }
          : undefined,
        url: canonUrl,
      };
      Object.keys(ld).forEach((k) => ld[k] === undefined && delete ld[k]);
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.jobLd = "1";
      script.textContent = JSON.stringify(ld);
      document.head.appendChild(script);

      const applyHref = `apply.html?id=${encodeURIComponent(id)}&role=${encodeURIComponent(title)}`;
      wrap.innerHTML = `
      <section class="dossier-hero">
        <div class="container">
          <p class="eyebrow">${escapeHtml(j.Discipline || "Surface engineering")} · ${escapeHtml(j.Type || "Permanent")}</p>
          <h1 class="display-md">${escapeHtml(title)}${j.Subtitle ? ` — ${escapeHtml(j.Subtitle)}` : ""}</h1>
          ${j.Hook ? `<p class="lede">${escapeHtml(j.Hook)}</p>` : ""}
          <div class="cta-row" style="margin-top:1.5rem">
            <a href="${applyHref}" class="btn btn--copper btn--lg" data-cta="job_apply">Apply in confidence <span class="arrow">→</span></a>
            <a href="https://calendar.app.google/Wdm9xHVcBNwS2VuS7" class="btn btn--lg" data-booking target="_blank" rel="noopener noreferrer">Have a confidential call <span class="visually-hidden">(opens in a new tab)</span></a>
          </div>
        </div>
      </section>
      <div class="container dossier-layout">
        <div class="dossier-body">
          ${j.TheBusiness ? `<h2>The business</h2>${paragraphs(j.TheBusiness)}` : ""}
          ${j.TheRole ? `<h2>The role</h2>${paragraphs(j.TheRole)}` : ""}
          ${j.ThePerson ? `<h2>The person</h2>${paragraphs(j.ThePerson)}` : ""}
          <div class="cta-row" style="margin-top:2rem">
            <a href="${applyHref}" class="btn btn--primary">Apply in confidence</a>
            <a href="jobs.html" class="btn">See all live roles</a>
          </div>
        </div>
        <aside class="dossier-side" aria-label="Role summary">
          <dl>
            <div><dt>Location</dt><dd>${escapeHtml(j.Location || "—")}</dd></div>
            <div><dt>Salary guide</dt><dd>${escapeHtml(j.Salary || "—")}</dd></div>
            <div><dt>Type</dt><dd>${escapeHtml(j.Type || "—")}</dd></div>
            <div><dt>Discipline</dt><dd>${escapeHtml(j.Discipline || "—")}</dd></div>
            <div><dt>Function</dt><dd>${escapeHtml(j.Function || "—")}</dd></div>
            <div><dt>Seniority</dt><dd>${escapeHtml(j.Seniority || "—")}</dd></div>
          </dl>
          <div class="cta-row">
            <a href="${applyHref}" class="btn btn--copper">Apply in confidence</a>
            <a href="https://calendar.app.google/Wdm9xHVcBNwS2VuS7" class="btn" target="_blank" rel="noopener noreferrer">Book a confidential call</a>
          </div>
        </aside>
      </div>`;
    })
    .catch((err) => {
      console.error(err);
      wrap.innerHTML = `<div class="container" style="padding:4rem 0">${stateBlock({
        title: "Role not found.",
        body: "This vacancy may have closed. Browse live roles or join the talent pool.",
        primaryHref: "jobs.html",
        primaryLabel: "See live roles",
        secondaryHref: "candidates.html#register",
        secondaryLabel: "Join our talent pool",
      })}</div>`;
    });
}

function mapEmploymentType(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("contract")) return "CONTRACTOR";
  if (t.includes("interim") || t.includes("temp")) return "TEMPORARY";
  if (t.includes("part")) return "PART_TIME";
  return "FULL_TIME";
}

document.addEventListener("DOMContentLoaded", () => {
  initJobsList();
  initJobDetail();
});
