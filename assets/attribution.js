/* First-touch + UTM attribution for form submissions
   ─────────────────────────────────────────────────────────── */

const LANDING_KEY = "st_landing";
const UTM_KEY = "st_utm";

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
  try {
    if (!sessionStorage.getItem(LANDING_KEY)) {
      sessionStorage.setItem(LANDING_KEY, location.href);
    }
    const utm = readParams();
    if (Object.values(utm).some(Boolean)) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    }
  } catch {
    /* private mode */
  }
}

export function getAttribution() {
  let landing = "";
  let utm = {};
  try {
    landing = sessionStorage.getItem(LANDING_KEY) || location.href;
    utm = JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}");
  } catch {
    landing = location.href;
  }
  const fresh = readParams();
  return {
    original_landing_page: landing,
    source_page: document.body?.dataset?.sourcePage || location.pathname.replace(/^\//, "") || "home",
    source_url: location.href,
    referrer: document.referrer || "",
    utm_source: fresh.utm_source || utm.utm_source || "",
    utm_medium: fresh.utm_medium || utm.utm_medium || "",
    utm_campaign: fresh.utm_campaign || utm.utm_campaign || "",
    utm_term: fresh.utm_term || utm.utm_term || "",
    utm_content: fresh.utm_content || utm.utm_content || "",
    gclid: fresh.gclid || utm.gclid || "",
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
