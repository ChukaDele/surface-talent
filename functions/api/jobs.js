/**
 * GET /api/jobs — Live Airtable roles (server-side only).
 * Env: AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE (default Jobs)
 */

const PUBLIC_FIELDS = [
  "Title",
  "Subtitle",
  "Status",
  "Discipline",
  "Function",
  "Seniority",
  "Type",
  "Location",
  "Salary",
  "Hook",
  "TheBusiness",
  "TheRole",
  "ThePerson",
];

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      ...cors(),
      ...extra,
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors() });
}

export async function onRequestGet(context) {
  const { env } = context;
  const token = env.AIRTABLE_TOKEN;
  const baseId = env.AIRTABLE_BASE_ID;
  const table = env.AIRTABLE_TABLE || "Jobs";

  if (!token || !baseId) {
    return json(
      { error: "jobs_unavailable", message: "Jobs API is not configured." },
      503
    );
  }

  try {
    const params = new URLSearchParams();
    params.set("pageSize", "100");
    params.set("filterByFormula", "{Status}='Live'");
    PUBLIC_FIELDS.forEach((f, i) => params.append("fields[]", f));

    const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}?${params}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Airtable list error", res.status, text.slice(0, 200));
      return json({ error: "upstream_error", message: "Could not load jobs." }, 502);
    }

    const data = await res.json();
    const records = (data.records || []).map((r) => ({
      id: r.id,
      fields: pickFields(r.fields || {}),
    }));

    return json({ records });
  } catch (err) {
    console.error("Jobs list failure", err);
    return json({ error: "server_error", message: "Could not load jobs." }, 500);
  }
}

function pickFields(fields) {
  const out = {};
  for (const key of PUBLIC_FIELDS) {
    if (fields[key] !== undefined) out[key] = fields[key];
  }
  return out;
}
