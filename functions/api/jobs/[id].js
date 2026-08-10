/**
 * GET /api/jobs/:id — Single live Airtable role.
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      ...cors(),
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors() });
}

export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;
  const token = env.AIRTABLE_TOKEN;
  const baseId = env.AIRTABLE_BASE_ID;
  const table = env.AIRTABLE_TABLE || "Jobs";

  if (!id || !/^rec[a-zA-Z0-9]+$/.test(id)) {
    return json({ error: "invalid_id" }, 400);
  }
  if (!token || !baseId) {
    return json({ error: "jobs_unavailable" }, 503);
  }

  try {
    const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 404) return json({ error: "not_found" }, 404);
    if (!res.ok) {
      console.error("Airtable detail error", res.status);
      return json({ error: "upstream_error" }, 502);
    }

    const record = await res.json();
    const fields = record.fields || {};
    if ((fields.Status || "") !== "Live") {
      return json({ error: "not_found" }, 404);
    }

    const publicFields = {};
    for (const key of PUBLIC_FIELDS) {
      if (fields[key] !== undefined) publicFields[key] = fields[key];
    }

    return json({ id: record.id, fields: publicFields });
  } catch (err) {
    console.error("Job detail failure", err);
    return json({ error: "server_error" }, 500);
  }
}
