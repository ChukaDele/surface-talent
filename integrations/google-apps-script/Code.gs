/**
 * Surface Talent — Website submissions webhook
 * Spreadsheet: Surface Talent — Website Submissions
 * ID: 1r3jM0vzVdJUD4t89yTabVvGx9HJ0DkXKm0ztaSdMWkM
 *
 * Write pattern (every successful submission):
 *   1. _Raw   — full normalized source of truth
 *   2. Inbox  — concise triage (Status = New)
 *   3. ONE operational/page tab
 *   4. _Audit — technical result log
 *
 * Rows are built by HEADER NAME (not column index).
 * Existing header rows are read and cached; never recreate the old
 * 38-column universal schema on page tabs.
 *
 * Script Properties (required):
 *   WEBHOOK_SECRET
 *
 * Deploy as Web App: Execute as Me, Anyone (auth via shared secret).
 */

var SPREADSHEET_ID = "1r3jM0vzVdJUD4t89yTabVvGx9HJ0DkXKm0ztaSdMWkM";
var CV_FOLDER_ID = "1sgZaaBpPlFwkpeVumf9Qu7vSyvgE2yJm";
var NOTIFICATION_EMAIL = "hello@surfacetalent.co.uk";
var TIMEZONE = "Europe/London";
var MAX_CV_MB = 10;
var DEFAULT_STATUS = "New";

/** Fallback headers if a sheet is empty. Prefer existing sheet headers. */
var RAW_HEADERS = [
  "Timestamp Local",
  "Timestamp UTC",
  "Submission ID",
  "Form Type",
  "Intent",
  "Status",
  "Name",
  "Email",
  "Phone E.164",
  "Phone Country",
  "Company",
  "Current Role",
  "Current Employer",
  "Role / Role Family",
  "Job ID",
  "Job Title",
  "Disciplines",
  "Functions",
  "Locations",
  "Employment Types",
  "Seniority",
  "Salary / Budget",
  "Hiring Timeline / Notice",
  "Message / Summary",
  "CV Drive URL",
  "Privacy Consent",
  "Source Page",
  "Source URL",
  "Original Landing Page",
  "Referrer",
  "CTA ID",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "UTM Term",
  "UTM Content",
  "GCLID",
  "Notes",
];

var INBOX_HEADERS = [
  "Received",
  "Submission ID",
  "Type",
  "Name",
  "Company / Current Role",
  "Email",
  "Phone",
  "Source",
  "Role / Job",
  "Status",
  "Owner",
  "Next Follow-up",
  "CV / Record Link",
  "Notes",
];

var AUDIT_HEADERS = [
  "Timestamp Local",
  "Timestamp UTC",
  "Submission ID",
  "Event",
  "Form Type",
  "Target Sheet",
  "Sheet Write",
  "Drive Upload",
  "Email Notification",
  "HTTP Status",
  "Error Code",
  "Error Summary",
  "Source Page",
  "Retry Count",
];

/**
 * Page-tab field maps: header name → value key from normalized record.
 * Only headers that exist on the sheet are written.
 * These are fallbacks / documentation — live mapping uses sheet row 1.
 */
var PAGE_COLUMNS = {
  Candidates: [
    "Received",
    "Submission ID",
    "Name",
    "Email",
    "Phone",
    "Current Role",
    "Current Employer",
    "Current Location",
    "Discipline(s)",
    "Target Function(s)",
    "Preferred Location(s)",
    "Employment Type(s)",
    "Salary Expectation",
    "CV",
    "Privacy Consent",
    "CTA Source",
    "Status",
    "Owner",
    "Next Follow-up",
    "Notes",
  ],
  Applications: [
    "Received",
    "Submission ID",
    "Job ID",
    "Job Title",
    "Name",
    "Email",
    "Phone",
    "Current Location",
    "Current Role",
    "Current Employer",
    "Notice Period",
    "CV",
    "Summary",
    "Privacy Consent",
    "Source URL",
    "Status",
    "Owner",
    "Next Step",
    "Notes",
  ],
  Contact: [
    "Received",
    "Submission ID",
    "Enquiry Type",
    "Name",
    "Email",
    "Phone",
    "Company",
    "Current Role",
    "Current Employer",
    "Role / Role Family",
    "Discipline(s)",
    "Location(s)",
    "Employment Type(s)",
    "Seniority",
    "Salary / Budget",
    "Timeline / Notice",
    "Message",
    "CV",
    "Status",
    "Owner",
    "Next Follow-up",
    "Notes",
  ],
  Clients: [
    "Received",
    "Submission ID",
    "Contact Name",
    "Work Email",
    "Phone",
    "Company",
    "Role Hiring For",
    "Discipline(s)",
    "Location",
    "Employment Type(s)",
    "Seniority",
    "Salary / Budget",
    "Hiring Timeline",
    "Brief",
    "CTA Source",
    "Status",
    "Owner",
    "Next Follow-up",
    "Notes",
  ],
  Home: [
    "Received",
    "Submission ID",
    "Intent",
    "Name",
    "Email",
    "Phone",
    "Company",
    "Role / Role Family",
    "Message",
    "Status",
    "Source Page",
    "CTA ID",
    "Notes",
  ],
  Disciplines: [
    "Received",
    "Submission ID",
    "Intent",
    "Name",
    "Email",
    "Phone",
    "Company",
    "Role / Role Family",
    "Disciplines",
    "Message",
    "Status",
    "Source Page",
    "CTA ID",
    "Notes",
  ],
  Jobs: [
    "Received",
    "Submission ID",
    "Intent",
    "Name",
    "Email",
    "Phone",
    "Job ID",
    "Job Title",
    "Message",
    "CV Drive URL",
    "Status",
    "Source Page",
    "CTA ID",
    "Notes",
  ],
  About: [
    "Received",
    "Submission ID",
    "Intent",
    "Name",
    "Email",
    "Phone",
    "Company",
    "Message",
    "Status",
    "Source Page",
    "CTA ID",
    "Notes",
  ],
};

/** Cache: sheetName → { headers: string[], indexByName: object } */
var HEADER_CACHE_ = {};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return jsonOut_({ ok: false, error: "busy" }, 429);
  }

  try {
    var secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
    var provided = extractSecret_(e);
    if (!secret || String(provided) !== String(secret)) {
      return jsonOut_({ ok: false, error: "unauthorized" }, 401);
    }

    var body = parseBody_(e);
    if (!body || !body.form_type) {
      return jsonOut_({ ok: false, error: "invalid_payload" }, 400);
    }

    var pageSheet = resolvePageSheet_(body);
    if (!pageSheet) {
      return jsonOut_({ ok: false, error: "invalid_form_type" }, 400);
    }

    loadConfig_();

    var submissionId =
      "ST-" +
      Utilities.formatDate(new Date(), "UTC", "yyyyMMdd") +
      "-" +
      Utilities.getUuid().slice(0, 8);

    var cvUrl = "";
    var cvOk = true;
    var cvError = "";
    var rawOk = false;
    var inboxOk = false;
    var pageOk = false;
    var emailOk = true;
    var emailError = "";
    var writeError = "";

    if (body.cv && body.cv.base64) {
      try {
        cvUrl = uploadCv_(body, submissionId);
      } catch (cvErr) {
        cvOk = false;
        cvError = String(cvErr);
        if (body.form_type === "job_application") {
          audit_(
            submissionId,
            body.form_type,
            pageSheet,
            false,
            false,
            false,
            false,
            false,
            "cv_failed: " + cvError,
            body.source_page
          );
          return jsonOut_({ ok: false, error: "cv_upload_failed" }, 502);
        }
      }
    }

    var record = buildRecord_(body, submissionId, cvUrl);

    try {
      appendByHeaders_("_Raw", RAW_HEADERS, rawValues_(record));
      rawOk = true;
    } catch (rawErr) {
      writeError = "raw_failed: " + String(rawErr);
      audit_(submissionId, body.form_type, pageSheet, false, false, false, cvOk, false, writeError, body.source_page);
      return jsonOut_({ ok: false, error: "sheet_write_failed", detail: writeError }, 502);
    }

    try {
      appendByHeaders_("Inbox", INBOX_HEADERS, inboxValues_(record));
      inboxOk = true;
    } catch (inboxErr) {
      writeError = "inbox_failed: " + String(inboxErr);
      audit_(submissionId, body.form_type, pageSheet, rawOk, false, false, cvOk, false, writeError, body.source_page);
      return jsonOut_({ ok: false, error: "sheet_write_failed", detail: writeError }, 502);
    }

    try {
      appendByHeaders_(pageSheet, PAGE_COLUMNS[pageSheet] || RAW_HEADERS, pageValues_(pageSheet, record));
      pageOk = true;
    } catch (pageErr) {
      writeError = "page_failed: " + String(pageErr);
      audit_(submissionId, body.form_type, pageSheet, rawOk, inboxOk, false, cvOk, false, writeError, body.source_page);
      return jsonOut_({ ok: false, error: "sheet_write_failed", detail: writeError }, 502);
    }

    try {
      sendNotification_(body, submissionId, cvUrl, pageSheet);
    } catch (mailErr) {
      emailOk = false;
      emailError = String(mailErr);
    }

    audit_(
      submissionId,
      body.form_type,
      pageSheet,
      rawOk,
      inboxOk,
      pageOk,
      cvOk,
      emailOk,
      [cvError, emailError].filter(Boolean).join(" | "),
      body.source_page
    );

    return jsonOut_({
      ok: true,
      submission_id: submissionId,
      sheet: pageSheet,
      sheets: ["_Raw", "Inbox", pageSheet],
      email_ok: emailOk,
      cv_ok: cvOk,
      cv_url: cvUrl,
    });
  } catch (err) {
    return jsonOut_({ ok: false, error: "server_error", detail: String(err) }, 500);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: "Surface Talent submissions", architecture: "raw+inbox+page+audit" })
  ).setMimeType(ContentService.MimeType.JSON);
}

/** Allowlisted routing — never trust a client-supplied sheet name. */
function resolvePageSheet_(body) {
  var type = String(body.form_type || "");
  var page = normalizeSourcePage_(body.source_page);

  if (type === "candidate_registration") return "Candidates";
  if (type === "job_application") return "Applications";

  if (type === "contact_hiring") {
    if (page === "clients") return "Clients";
    if (page === "home") return "Home";
    if (page === "disciplines") return "Disciplines";
    if (page === "jobs") return "Jobs";
    if (page === "about") return "About";
    return "Contact";
  }

  if (type === "contact_career_move" || type === "contact_general") {
    return "Contact";
  }

  return "";
}

function normalizeSourcePage_(value) {
  var p = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\.html$/, "")
    .replace(/^\//, "");
  if (p === "index" || p === "") return "home";
  return p;
}

function extractSecret_(e) {
  if (!e) return "";
  if (e.parameter && e.parameter.secret) return e.parameter.secret;
  try {
    if (e.headers) {
      return e.headers["X-ST-Secret"] || e.headers["x-st-secret"] || e.headers["X-St-Secret"] || "";
    }
  } catch (ignore) {}
  return "";
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;
  var type = (e.postData.type || "").toLowerCase();
  if (type.indexOf("application/json") !== -1 || e.postData.contents.charAt(0) === "{") {
    return JSON.parse(e.postData.contents);
  }
  return null;
}

function loadConfig_() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var cfg = ss.getSheetByName("_Config");
    if (!cfg) return;
    var values = cfg.getDataRange().getValues();
    var map = {};
    for (var i = 0; i < values.length; i++) {
      var k = String(values[i][0] || "").trim();
      var v = values[i][1];
      if (k) map[k] = v;
    }
    if (map.notification_email) NOTIFICATION_EMAIL = String(map.notification_email);
    if (map.spreadsheet_id) SPREADSHEET_ID = String(map.spreadsheet_id);
    if (map.cv_folder_id) CV_FOLDER_ID = String(map.cv_folder_id);
    if (map.timezone) TIMEZONE = String(map.timezone);
    if (map.max_cv_mb) MAX_CV_MB = Number(map.max_cv_mb) || 10;
    if (map.default_status) DEFAULT_STATUS = String(map.default_status);
  } catch (err) {
    // keep defaults
  }
}

function joinList_(arr) {
  if (arr == null || arr === "") return "";
  if (Object.prototype.toString.call(arr) !== "[object Array]") {
    var s = String(arr).trim();
    // Avoid dumping JSON arrays onto visible tabs
    if (s.charAt(0) === "[") {
      try {
        var parsed = JSON.parse(s);
        if (Object.prototype.toString.call(parsed) === "[object Array]") {
          return parsed
            .map(function (x) {
              return String(x).trim();
            })
            .filter(Boolean)
            .join(" | ");
        }
      } catch (ignore) {}
    }
    return s;
  }
  return arr
    .map(function (x) {
      if (x && typeof x === "object") return "";
      return String(x).trim();
    })
    .filter(Boolean)
    .join(" | ");
}

function buildRecord_(body, submissionId, cvUrl) {
  var now = new Date();
  return {
    timestamp_local: Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd HH:mm:ss"),
    timestamp_utc: Utilities.formatDate(now, "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    submission_id: submissionId,
    form_type: body.form_type || "",
    intent: body.intent || "",
    status: DEFAULT_STATUS,
    name: body.name || "",
    email: body.email || "",
    phone_e164: body.phone_e164 || "",
    phone_country: body.phone_country || "",
    phone_display: body.phone_display || "",
    company: body.company || "",
    current_role: body.current_role || "",
    current_employer: body.current_employer || "",
    current_location: body.current_location || "",
    role: body.role || "",
    job_id: body.job_id || "",
    job_title: body.job_title || "",
    disciplines: joinList_(body.disciplines),
    functions: joinList_(body.functions || body.target_functions),
    locations: joinList_(body.locations || body.preferred_locations),
    employment_types: joinList_(body.employment_types),
    seniority: body.seniority || "",
    salary: body.salary || "",
    timeline: body.timeline || "",
    subject: body.subject || "",
    message: body.message || "",
    cv_url: cvUrl || "",
    privacy_consent: body.privacy_consent ? "Yes" : "No",
    source_page: body.source_page || "",
    source_url: body.source_url || "",
    original_landing_page: body.original_landing_page || "",
    referrer: body.referrer || "",
    cta_id: body.cta_id || "",
    utm_source: body.utm_source || "",
    utm_medium: body.utm_medium || "",
    utm_campaign: body.utm_campaign || "",
    utm_term: body.utm_term || "",
    utm_content: body.utm_content || "",
    gclid: body.gclid || "",
    notes: "",
  };
}

function phoneText_(value) {
  var v = String(value || "").trim();
  if (!v) return "";
  if (v.charAt(0) !== "+" && /^\d{8,15}$/.test(v)) v = "+" + v;
  return v;
}

function companyOrCurrentRole_(r) {
  if (r.company) return r.company;
  if (r.current_role) return r.current_role;
  return "";
}

function roleOrJob_(r) {
  return r.job_title || r.role || "";
}

function typeLabel_(r) {
  var map = {
    candidate_registration: "Candidate registration",
    job_application: "Job application",
    contact_hiring: "Hiring enquiry",
    contact_career_move: "Career move",
    contact_general: "General enquiry",
  };
  return map[r.form_type] || r.form_type || r.intent || "";
}

function rawValues_(r) {
  return {
    "Timestamp Local": r.timestamp_local,
    "Timestamp UTC": r.timestamp_utc,
    "Submission ID": r.submission_id,
    "Form Type": r.form_type,
    Intent: r.intent,
    Status: r.status,
    Name: r.name,
    Email: r.email,
    "Phone E.164": phoneText_(r.phone_e164),
    "Phone Country": r.phone_country,
    Company: r.company,
    "Current Role": r.current_role,
    "Current Employer": r.current_employer,
    "Role / Role Family": r.role,
    "Job ID": r.job_id,
    "Job Title": r.job_title,
    Disciplines: r.disciplines,
    Functions: r.functions,
    Locations: r.locations,
    "Employment Types": r.employment_types,
    Seniority: r.seniority,
    "Salary / Budget": r.salary,
    "Hiring Timeline / Notice": r.timeline,
    "Message / Summary": r.message || r.subject,
    "CV Drive URL": r.cv_url,
    "Privacy Consent": r.privacy_consent,
    "Source Page": r.source_page,
    "Source URL": r.source_url,
    "Original Landing Page": r.original_landing_page,
    Referrer: r.referrer,
    "CTA ID": r.cta_id,
    "UTM Source": r.utm_source,
    "UTM Medium": r.utm_medium,
    "UTM Campaign": r.utm_campaign,
    "UTM Term": r.utm_term,
    "UTM Content": r.utm_content,
    GCLID: r.gclid,
    Notes: r.notes,
  };
}

function inboxValues_(r) {
  return {
    Received: r.timestamp_local,
    "Submission ID": r.submission_id,
    Type: typeLabel_(r),
    Name: r.name,
    "Company / Current Role": companyOrCurrentRole_(r),
    Email: r.email,
    Phone: phoneText_(r.phone_e164 || r.phone_display),
    Source: r.source_page,
    "Role / Job": roleOrJob_(r),
    Status: r.status,
    Owner: "",
    "Next Follow-up": "",
    "CV / Record Link": r.cv_url,
    Notes: "",
  };
}

/** Page-specific values keyed by possible header names (aliases included). */
function pageValues_(sheetName, r) {
  var phone = phoneText_(r.phone_e164 || r.phone_display);
  var enquiry =
    r.intent ||
    ({
      contact_hiring: "I'm hiring",
      contact_career_move: "I'm considering a move",
      contact_general: "General enquiry",
      candidate_registration: "Candidate registration",
      job_application: "Job application",
    }[r.form_type] ||
      typeLabel_(r));

  var base = {
    Received: r.timestamp_local,
    "Timestamp Local": r.timestamp_local,
    "Submission ID": r.submission_id,
    Type: typeLabel_(r),
    Intent: enquiry,
    "Enquiry Type": enquiry,
    "Form Type": r.form_type,
    Name: r.name,
    "Contact Name": r.name,
    Email: r.email,
    "Work Email": r.email,
    Phone: phone,
    "Phone E.164": phone,
    Company: r.company,
    "Current Role": r.current_role,
    "Current Employer": r.current_employer,
    "Current Location": r.current_location || "",
    "Role / Role Family": r.role,
    "Role Hiring For": r.role,
    "Role / Job": roleOrJob_(r),
    "Job ID": r.job_id,
    "Job Title": r.job_title,
    Disciplines: r.disciplines,
    "Discipline(s)": r.disciplines,
    Functions: r.functions,
    "Target Functions": r.functions,
    "Target Function(s)": r.functions,
    Location: r.current_location || r.locations,
    Locations: r.locations,
    "Location(s)": r.locations || r.current_location,
    "Preferred Locations": r.locations,
    "Preferred Location(s)": r.locations,
    "Employment Types": r.employment_types,
    "Employment Type(s)": r.employment_types,
    Seniority: r.seniority,
    "Salary / Budget": r.salary,
    "Salary Expectation": r.salary,
    Timeline: r.timeline,
    "Hiring Timeline": r.timeline,
    "Notice Period": r.timeline,
    "Timeline / Notice": r.timeline,
    "Hiring Timeline / Notice": r.timeline,
    Subject: r.subject,
    Message: r.message,
    Brief: r.message,
    Summary: r.message,
    "Message / Summary": r.message || r.subject,
    CV: r.cv_url,
    "CV Drive URL": r.cv_url,
    "CV / Record Link": r.cv_url,
    "Privacy Consent": r.privacy_consent,
    Status: r.status,
    "Source Page": r.source_page,
    "Source URL": r.source_url,
    "CTA ID": r.cta_id,
    "CTA Source": r.cta_id || r.source_page,
    Owner: "",
    "Next Follow-up": "",
    "Next Step": "",
    Notes: "",
  };

  if (sheetName === "Candidates") {
    base["Current Location"] = r.current_location || "";
    base["Preferred Location(s)"] = r.locations;
    base["Target Function(s)"] = r.functions;
    base["Discipline(s)"] = r.disciplines;
    base["Employment Type(s)"] = r.employment_types;
    base.CV = r.cv_url;
    base["Salary Expectation"] = r.salary;
    base["Privacy Consent"] = r.privacy_consent;
    base["CTA Source"] = r.cta_id || r.source_page;
  }
  if (sheetName === "Applications") {
    base.Summary = r.message;
    base["Notice Period"] = r.timeline;
    base["Current Location"] = r.current_location || r.locations;
    base.CV = r.cv_url;
    base["Source URL"] = r.source_url;
    base["Privacy Consent"] = r.privacy_consent;
  }
  if (sheetName === "Contact") {
    base["Enquiry Type"] = enquiry;
    base["Discipline(s)"] = r.disciplines;
    base["Location(s)"] = r.locations || r.current_location;
    base["Employment Type(s)"] = r.employment_types;
    base["Timeline / Notice"] = r.timeline;
    base.CV = r.cv_url;
  }
  if (sheetName === "Clients") {
    base["Contact Name"] = r.name;
    base["Work Email"] = r.email;
    base["Role Hiring For"] = r.role;
    base["Discipline(s)"] = r.disciplines;
    base["Employment Type(s)"] = r.employment_types;
    base["Hiring Timeline"] = r.timeline;
    base.Brief = r.message;
    base["CTA Source"] = r.cta_id || r.source_page;
  }

  return base;
}

function getSheetMeta_(sheetName, fallbackHeaders) {
  if (HEADER_CACHE_[sheetName]) return HEADER_CACHE_[sheetName];

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Missing sheet: " + sheetName);

  var lastCol = Math.max(sheet.getLastColumn(), fallbackHeaders.length);
  var headers = [];
  if (sheet.getLastRow() === 0 || !sheet.getRange(1, 1).getValue()) {
    sheet.getRange(1, 1, 1, fallbackHeaders.length).setValues([fallbackHeaders]);
    headers = fallbackHeaders.slice();
  } else {
    var raw = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    headers = [];
    for (var i = 0; i < raw.length; i++) {
      var h = String(raw[i] || "").trim();
      if (h) headers.push(h);
    }
    if (!headers.length) {
      sheet.getRange(1, 1, 1, fallbackHeaders.length).setValues([fallbackHeaders]);
      headers = fallbackHeaders.slice();
    }
  }

  var indexByName = {};
  for (var j = 0; j < headers.length; j++) {
    indexByName[headers[j]] = j;
    // Case-insensitive alias
    indexByName[headers[j].toLowerCase()] = j;
  }

  HEADER_CACHE_[sheetName] = { sheet: sheet, headers: headers, indexByName: indexByName };
  return HEADER_CACHE_[sheetName];
}

function appendByHeaders_(sheetName, fallbackHeaders, valuesByHeader) {
  var meta = getSheetMeta_(sheetName, fallbackHeaders);
  var row = [];
  var phoneCols = [];
  for (var i = 0; i < meta.headers.length; i++) {
    var key = meta.headers[i];
    var val = valuesByHeader[key];
    if (val == null) val = valuesByHeader[key.toLowerCase()];
    if (val == null) val = "";
    // Never write objects/arrays as JSON
    if (Object.prototype.toString.call(val) === "[object Array]") {
      val = joinList_(val);
    } else if (val && typeof val === "object") {
      val = "";
    }
    if (/phone/i.test(key) && val) {
      val = phoneText_(val);
      phoneCols.push(i + 1);
    }
    row.push(val);
  }
  meta.sheet.appendRow(row);
  // Force phone columns to plain text so leading "+" is preserved.
  if (phoneCols.length) {
    var lastRow = meta.sheet.getLastRow();
    for (var p = 0; p < phoneCols.length; p++) {
      var cell = meta.sheet.getRange(lastRow, phoneCols[p]);
      cell.setNumberFormat("@");
      cell.setValue(String(row[phoneCols[p] - 1] || ""));
    }
  }
}

function uploadCv_(body, submissionId) {
  var cv = body.cv;
  var bytes = Utilities.base64Decode(cv.base64);
  if (bytes.length > MAX_CV_MB * 1024 * 1024) {
    throw new Error("CV too large");
  }
  var blob = Utilities.newBlob(bytes, cv.mime || "application/pdf", cv.filename || "cv.pdf");
  var folder = DriveApp.getFolderById(CV_FOLDER_ID);
  var safeName = buildCvName_(body, submissionId, cv.ext || "pdf");
  var file = folder.createFile(blob).setName(safeName);
  // Keep private — do not set public sharing
  return file.getUrl();
}

function buildCvName_(body, submissionId, ext) {
  var date = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd");
  var person = String(body.name || "candidate")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  var role = String(body.job_title || body.role || "role")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  var shortId = String(submissionId).slice(-8);
  return date + "__" + person + "__" + role + "__" + shortId + "." + ext;
}

function sendNotification_(body, submissionId, cvUrl, sheetName) {
  var subject = buildSubject_(body);
  var lines = [
    "New Surface Talent website submission",
    "",
    "Submission ID: " + submissionId,
    "Form: " + body.form_type,
    "Intent: " + (body.intent || ""),
    "Written to: _Raw + Inbox + " + sheetName,
    "",
    "Name: " + body.name,
    "Email: " + body.email,
    "Phone: " + (body.phone_e164 || body.phone_display || ""),
    "Company: " + (body.company || ""),
    "Role: " + (body.role || body.job_title || ""),
    "Job ID: " + (body.job_id || ""),
    "Disciplines: " + joinList_(body.disciplines),
    "Functions: " + joinList_(body.functions),
    "Employment types: " + joinList_(body.employment_types),
    "Locations: " + (body.locations || ""),
    "Seniority: " + (body.seniority || ""),
    "Salary/budget: " + (body.salary || ""),
    "Timeline/notice: " + (body.timeline || ""),
    "",
    "Message:",
    body.message || body.subject || "(none)",
    "",
    "CV: " + (cvUrl || "(none)"),
    "Source page: " + (body.source_page || ""),
    "Source URL: " + (body.source_url || ""),
    "Landing: " + (body.original_landing_page || ""),
    "Referrer: " + (body.referrer || ""),
    "CTA: " + (body.cta_id || ""),
    "UTM: " +
      [body.utm_source, body.utm_medium, body.utm_campaign, body.utm_term, body.utm_content]
        .filter(Boolean)
        .join(" / "),
    "GCLID: " + (body.gclid || ""),
    "",
    "Inbox: https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + "/edit#gid=0",
  ];

  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: subject,
    body: lines.join("\n"),
    replyTo: body.email,
    name: "Surface Talent Website",
  });
}

function buildSubject_(body) {
  var name = body.name || "Unknown";
  if (body.form_type === "contact_hiring") {
    return "[Surface Talent] New hiring enquiry — " + (body.company || name) + " — " + (body.role || "Role");
  }
  if (body.form_type === "candidate_registration") {
    return "[Surface Talent] New candidate registration — " + name;
  }
  if (body.form_type === "job_application") {
    return "[Surface Talent] Job application — " + name + " — " + (body.job_title || body.role || "Role");
  }
  return "[Surface Talent] General enquiry — " + name;
}

function audit_(submissionId, formType, sheetName, rawOk, inboxOk, pageOk, cvOk, emailOk, err, sourcePage) {
  try {
    var now = new Date();
    var sheetWrite = rawOk && inboxOk && pageOk ? "ok" : "failed";
    var overallOk = rawOk && inboxOk && pageOk;
    appendByHeaders_("_Audit", AUDIT_HEADERS, {
      "Timestamp Local": Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd HH:mm:ss"),
      "Timestamp UTC": Utilities.formatDate(now, "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      "Submission ID": submissionId,
      Event: overallOk ? (emailOk && cvOk ? "submission_ok" : "submission_partial") : "submission_failed",
      "Form Type": formType,
      "Target Sheet": sheetName,
      "Sheet Write": sheetWrite,
      "Drive Upload": cvOk ? "ok" : "failed",
      "Email Notification": emailOk ? "ok" : "failed",
      "HTTP Status": overallOk ? 200 : 502,
      "Error Code": err ? "error" : "",
      "Error Summary": err || "",
      "Source Page": sourcePage || "",
      "Retry Count": 0,
    });
  } catch (ignore) {}
}

function jsonOut_(obj, status) {
  obj.http_status = status || 200;
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
