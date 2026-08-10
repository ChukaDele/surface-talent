/**
 * POST /api/submit — Validate + forward website submissions to Apps Script.
 * Env: APPS_SCRIPT_URL, SUBMISSION_SECRET
 */

const ALLOWED_FORMS = new Set([
  "candidate_registration",
  "job_application",
  "contact_hiring",
  "contact_career_move",
  "contact_general",
]);

const MAX_CV_BYTES = 10 * 1024 * 1024;
const ALLOWED_CV = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const scriptUrl = env.APPS_SCRIPT_URL;
  const secret = env.SUBMISSION_SECRET;

  if (!scriptUrl || !secret) {
    return json({ ok: false, error: "submit_unavailable" }, 503);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  // Honeypot
  const honey = String(form.get("_gotcha") || form.get("website") || "").trim();
  if (honey) return json({ ok: true, id: "ignored" });

  // Minimum fill duration (ms) — bots often submit instantly
  const started = Number(form.get("_form_started") || 0);
  if (started && Date.now() - started < 1200) {
    return json({ ok: true, id: "ignored" });
  }

  const formType = String(form.get("form_type") || "").trim();
  if (!ALLOWED_FORMS.has(formType)) {
    return json({ ok: false, error: "invalid_form_type" }, 400);
  }

  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const consent = String(form.get("privacy_consent") || "");

  if (!name || name.length < 2) {
    return json({ ok: false, error: "name_required", field: "name" }, 400);
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "email_invalid", field: "email" }, 400);
  }
  if (!(consent === "on" || consent === "true" || consent === "1" || consent === "yes")) {
    return json({ ok: false, error: "consent_required", field: "privacy_consent" }, 400);
  }

  if (formType === "contact_hiring") {
    if (!String(form.get("company") || "").trim()) {
      return json({ ok: false, error: "company_required", field: "company" }, 400);
    }
    if (!String(form.get("role") || form.get("role_family") || "").trim()) {
      return json({ ok: false, error: "role_required", field: "role" }, 400);
    }
  }

  if (formType === "contact_general") {
    if (!String(form.get("message") || "").trim()) {
      return json({ ok: false, error: "message_required", field: "message" }, 400);
    }
  }

  let cvPayload = null;
  const cvFile = form.get("cv");
  const cvRequired = formType === "job_application";

  if (cvFile && typeof cvFile === "object" && cvFile.size > 0) {
    if (cvFile.size > MAX_CV_BYTES) {
      return json({ ok: false, error: "cv_too_large", field: "cv" }, 400);
    }
    const mime = cvFile.type || "";
    const extFromMime = ALLOWED_CV[mime];
    const nameLower = String(cvFile.name || "").toLowerCase();
    const extFromName = nameLower.endsWith(".pdf")
      ? "pdf"
      : nameLower.endsWith(".docx")
        ? "docx"
        : nameLower.endsWith(".doc")
          ? "doc"
          : "";
    const ext = extFromMime || extFromName;
    if (!ext || !["pdf", "doc", "docx"].includes(ext)) {
      return json({ ok: false, error: "cv_type", field: "cv" }, 400);
    }
    const buf = new Uint8Array(await cvFile.arrayBuffer());
    cvPayload = {
      filename: sanitizeFilename(cvFile.name || `cv.${ext}`),
      mime: ext === "pdf" ? "application/pdf" : mime || "application/octet-stream",
      ext,
      base64: bytesToBase64(buf),
    };
  } else if (cvRequired) {
    return json({ ok: false, error: "cv_required", field: "cv" }, 400);
  }

  const payload = {
    form_type: formType,
    intent: String(form.get("enquiry_type") || form.get("intent") || ""),
    name,
    email,
    phone_e164: normalizePhoneE164(form.get("phone_e164")),
    phone_country: String(form.get("phone_country") || "").trim(),
    phone_display: String(form.get("phone_display") || "").trim(),
    company: String(form.get("company") || "").trim(),
    current_role: String(form.get("current_role") || "").trim(),
    current_employer: String(form.get("current_employer") || "").trim(),
    current_location: String(form.get("current_location") || "").trim(),
    role: String(form.get("role") || form.get("role_family") || "").trim(),
    job_id: String(form.get("job_id") || "").trim(),
    job_title: String(form.get("job_title") || "").trim(),
    disciplines: normalizeList(form.getAll("disciplines").length ? form.getAll("disciplines") : form.get("disciplines")),
    functions: normalizeList(
      form.getAll("functions").length
        ? form.getAll("functions")
        : form.getAll("target_functions").length
          ? form.getAll("target_functions")
          : form.get("functions") || form.get("target_functions")
    ),
    locations: normalizeList(
      form.getAll("preferred_locations").length
        ? form.getAll("preferred_locations")
        : form.getAll("locations").length
          ? form.getAll("locations")
          : form.get("preferred_locations") || form.get("locations") || form.get("location")
    ).join(" | "),
    employment_types: normalizeList(
      form.getAll("employment_types").length ? form.getAll("employment_types") : form.get("employment_types")
    ),
    seniority: String(form.get("seniority") || "").trim(),
    salary: String(form.get("salary") || form.get("salary_budget") || form.get("salary_expectation") || "").trim(),
    timeline: String(form.get("timeline") || form.get("hiring_timeline") || form.get("notice_period") || "").trim(),
    subject: String(form.get("subject") || "").trim(),
    message: String(form.get("message") || form.get("summary") || "").trim(),
    privacy_consent: true,
    source_page: String(form.get("source_page") || "").trim(),
    source_url: String(form.get("source_url") || "").trim(),
    original_landing_page: String(form.get("original_landing_page") || "").trim(),
    referrer: String(form.get("referrer") || "").trim(),
    cta_id: String(form.get("cta_id") || "").trim(),
    utm_source: String(form.get("utm_source") || "").trim(),
    utm_medium: String(form.get("utm_medium") || "").trim(),
    utm_campaign: String(form.get("utm_campaign") || "").trim(),
    utm_term: String(form.get("utm_term") || "").trim(),
    utm_content: String(form.get("utm_content") || "").trim(),
    gclid: String(form.get("gclid") || "").trim(),
    cv: cvPayload,
    submitted_at_iso: new Date().toISOString(),
  };

  try {
    // Apps Script web apps often drop custom headers — also pass secret in query (server-side only).
    const target = new URL(scriptUrl);
    target.searchParams.set("secret", secret);

    const upstream = await fetch(target.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ST-Secret": secret,
      },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Apps Script non-JSON", upstream.status, text.slice(0, 300));
      return json({ ok: false, error: "upstream_invalid" }, 502);
    }

    if (!upstream.ok || data.ok === false) {
      console.error("Apps Script error", data);
      return json(
        {
          ok: false,
          error: data.error || "upstream_failed",
          field: data.field,
        },
        upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502
      );
    }

    return json({
      ok: true,
      id: data.submission_id || data.id,
      sheet: data.sheet,
      email_ok: data.email_ok !== false,
      cv_ok: data.cv_ok !== false,
    });
  } catch (err) {
    console.error("Submit forward failure", err);
    return json({ ok: false, error: "server_error" }, 500);
  }
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((v) => String(v).split("|"))
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (value == null || value === "") return [];
  return String(value)
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Keep canonical E.164 with leading +. Never store UK-local primary. */
function normalizePhoneE164(value) {
  let v = String(value || "").trim().replace(/[\s()-]/g, "");
  if (!v) return "";
  if (v.startsWith("00")) v = "+" + v.slice(2);
  if (!v.startsWith("+") && /^\d{8,15}$/.test(v)) v = "+" + v;
  return v;
}

function sanitizeFilename(name) {
  return String(name)
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 120);
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
