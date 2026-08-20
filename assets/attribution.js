/* First-touch + UTM attribution for form submissions
   ───────────────────────────────────────────────────────────
   This module deliberately stores NOTHING on the visitor's device.

   UK storage-and-access rules (PECR) cover sessionStorage and
   localStorage as well as cookies. Campaign attribution is not
   "strictly necessary" for delivering the page a visitor asked
   for, so it cannot lawfully be written before consent — and a
   consent banner for two attribution keys is a poor trade.

   Reading the parameters already present on the current URL
   requires no consent and no storage. So attribution still works
   for the common case: a visitor arrives on a campaign link and
   enquires from that page. It is simply absent when they navigate
   away first. If cross-page attribution is wanted later, it needs
   a consent mechanism — and cookies.html must be updated first. */

function readParams() {
  const p = new URLSearchParams(location.search);
  return {
    utm_source: p.get("utm_source") || "",
    utm_medium: p.get("utm_medium") || "",
    utm_campaign: p.get("utm_campaign") || "",
    utm_term: p.get("utm_term") || "",
    utm_content: p.get("utm_content") || "",
    gclid: p.get("gclid") || "",
  };
}

export function initAttribution() {
  /* Intentionally a no-op. Kept so callers need no change, and so
     that anyone reintroducing device storage has to come here and
     read the note above first. */
}

export function getAttribution() {
  const fresh = readParams();
  return {
    original_landing_page: location.href,
    source_page: document.body?.dataset?.sourcePage || location.pathname.replace(/^\//, "") || "home",
    source_url: location.href,
    referrer: document.referrer || "",
    utm_source: fresh.utm_source,
    utm_medium: fresh.utm_medium,
    utm_campaign: fresh.utm_campaign,
    utm_term: fresh.utm_term,
    utm_content: fresh.utm_content,
    gclid: fresh.gclid,
  };
}

export function applyAttributionFields(form) {
  if (!form) return;
  const a = getAttribution();
  const ensure = (name, value) => {
    let el = form.querySelector(`[name="${name}"]`);
    if (!el) {
      el = document.createElement("input");
      el.type = "hidden";
      el.name = name;
      form.appendChild(el);
    }
    el.value = value || "";
  };
  Object.entries(a).forEach(([k, v]) => ensure(k, v));
  ensure("_form_started", String(Date.now()));
}

initAttribution();
