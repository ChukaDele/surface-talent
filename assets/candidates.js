/* Candidates — live roles preview + registration via /api/submit
   ─────────────────────────────────────────────────────────── */

import { initSimpleSubmitForm } from "./forms.js";

async function initLiveRoles() {
  const root = document.querySelector("[data-live-roles]");
  if (!root) return;

  const loading = root.querySelector("[data-roles-loading]");
  const empty = root.querySelector("[data-roles-empty]");
  const list = root.querySelector("[data-roles-list]");

  try {
    const res = await fetch("/api/jobs");
    if (!res.ok) throw new Error("unavailable");
    const data = await res.json();
    const jobs = (data.records || [])
      .map((r) => ({ id: r.id, ...r.fields }))
      .filter((j) => (j.Status || "Live") === "Live")
      .slice(0, 4);

    loading?.setAttribute("hidden", "");
    if (!jobs.length) {
      empty?.removeAttribute("hidden");
      return;
    }

    list.innerHTML = jobs
      .map((j) => {
        const id = j.id || "";
        const title = j.Title || j.Role || j.Name || "Open role";
        const loc = j.Location || "UK";
        const disc = j.Discipline || "";
        const href = id ? `job.html?id=${encodeURIComponent(id)}` : "jobs.html";
        return `<a class="role-row" href="${href}">
          <span>
            <span class="role-row__title">${escapeHtml(title)}</span>
          </span>
          <span class="role-row__meta">${escapeHtml([loc, disc].filter(Boolean).join(" · "))}</span>
          <span class="role-row__cta">View role →</span>
        </a>`;
      })
      .join("");
  } catch {
    loading?.setAttribute("hidden", "");
    empty?.removeAttribute("hidden");
    if (empty) {
      empty.textContent =
        "Live roles load from our jobs board when available. Browse vacancies or join the talent pool below.";
    }
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

initLiveRoles();
initSimpleSubmitForm("candidate-form", {
  sourcePage: "candidates",
  ctaId: "candidate_register",
  formType: "candidate_registration",
  successEl: document.querySelector("[data-form-success]"),
  errorEl: document.querySelector("[data-form-error]"),
});
