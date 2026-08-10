/* Surface Talent — shared form submit + phone + chips
   Progressive: works without GSAP. Posts to /api/submit.
   ─────────────────────────────────────────────────────────── */

import { applyAttributionFields } from "./attribution.js";

const SUBMIT_URL = "/api/submit";

const SUCCESS = {
  contact_hiring: "Received. We'll review the brief and come back to you.",
  contact_career_move: "Received. We'll treat this as confidential and get in touch if there's a fit.",
  contact_general: "Thanks — we've received your message.",
  candidate_registration: "You're in. We'll review your profile and get in touch when there's a strong fit.",
  job_application: "Application received.",
};

function loadIntlTelInput() {
  if (window.intlTelInput) return Promise.resolve(window.intlTelInput);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-iti]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.intlTelInput));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = "assets/vendor/intl-tel-input/build/js/intlTelInputWithUtils.min.js";
    s.async = true;
    s.dataset.iti = "1";
    s.onload = () => resolve(window.intlTelInput);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export function initPhoneInputs(root = document) {
  const nodes = [...root.querySelectorAll("[data-phone]")];
  if (!nodes.length) return Promise.resolve([]);

  return loadIntlTelInput()
    .then((intlTelInput) => {
      if (!intlTelInput) throw new Error("intlTelInput missing");
      const instances = [];
      nodes.forEach((input) => {
        const iti = intlTelInput(input, {
          initialCountry: "gb",
          strictMode: true,
          nationalMode: false,
          autoPlaceholder: "aggressive",
          formatOnDisplay: true,
          countryOrder: ["gb", "ie", "us", "de", "fr", "nl"],
        });
        instances.push({ input, iti });

        const sync = () => {
          const form = input.closest("form");
          if (!form) return;
          const valid = typeof iti.isValidNumberPrecise === "function"
            ? iti.isValidNumberPrecise()
            : iti.isValidNumber();
          setHidden(form, "phone_e164", valid ? iti.getNumber() : "");
          setHidden(form, "phone_country", (iti.getSelectedCountryData() || {}).iso2 || "");
          setHidden(form, "phone_display", input.value.trim());
        };

        input.addEventListener("blur", () => {
          sync();
          const valid = typeof iti.isValidNumberPrecise === "function"
            ? iti.isValidNumberPrecise()
            : iti.isValidNumber();
          if (input.value.trim() && !valid) {
            showFieldError(input, "Enter a valid international phone number.");
          } else {
            clearFieldError(input);
          }
        });
        input.addEventListener("countrychange", sync);
        input.addEventListener("input", () => clearFieldError(input));
      });
      return instances;
    })
    .catch((err) => {
      console.warn("Phone enhancer unavailable", err);
      return [];
    });
}

function setHidden(form, name, value) {
  let el = form.querySelector(`input[name="${name}"]`);
  if (!el) {
    el = document.createElement("input");
    el.type = "hidden";
    el.name = name;
    form.appendChild(el);
  }
  el.value = value || "";
}

function showFieldError(input, message) {
  input.classList.add("field-invalid");
  input.setAttribute("aria-invalid", "true");
  let err = input.parentElement?.querySelector(".field-error");
  if (!err) {
    err = document.createElement("p");
    err.className = "field-error";
    err.id = `${input.id || input.name}-error`;
    input.insertAdjacentElement("afterend", err);
    input.setAttribute("aria-describedby", err.id);
  }
  err.textContent = message;
  err.classList.add("is-show");
}

function clearFieldError(input) {
  input.classList.remove("field-invalid");
  input.removeAttribute("aria-invalid");
  const err = input.parentElement?.querySelector(".field-error");
  if (err) err.classList.remove("is-show");
}

export function wireIntentForm(form, options = {}) {
  if (!form) return;
  const phonesPromise = initPhoneInputs(form);
  applyAttributionFields(form);
  setHidden(form, "source_page", options.sourcePage || document.body.dataset.sourcePage || "contact");
  if (options.ctaId) setHidden(form, "cta_id", options.ctaId);
  if (options.formType) setHidden(form, "form_type", options.formType);

  const success = options.successEl || document.querySelector("[data-form-success]");
  const error = options.errorEl || document.querySelector("[data-form-error]");
  const btn = form.querySelector("[type=submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    success && (success.hidden = true);
    error && (error.hidden = true);

    applyAttributionFields(form);
    await phonesPromise;

    // Sync phone before validate
    form.querySelectorAll("[data-phone]").forEach((input) => {
      input.dispatchEvent(new Event("blur"));
    });

    if (!form.checkValidity()) {
      const first = form.querySelector(":invalid");
      first?.focus();
      first?.reportValidity?.();
      return;
    }

    // Phone optional unless marked required
    const phoneInput = form.querySelector("[data-phone]");
    if (phoneInput?.required || phoneInput?.value.trim()) {
      const e164 = form.querySelector('[name="phone_e164"]')?.value;
      if (!e164) {
        showFieldError(phoneInput, "Enter a valid international phone number.");
        phoneInput.focus();
        return;
      }
    }

    if (btn) {
      btn.disabled = true;
      btn.dataset.label = btn.innerHTML;
      btn.textContent = "Sending…";
    }

    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        body: new FormData(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw Object.assign(new Error(data.error || "fail"), { field: data.field });
      }

      const type = form.querySelector('[name="form_type"]')?.value;
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.textContent = SUCCESS[type] || "Thanks — we've received your message.";
      }
      form.dispatchEvent(new CustomEvent("st:submitted", { detail: data }));
    } catch (err) {
      if (error) {
        error.hidden = false;
        if (err.field) {
          const field = form.querySelector(`[name="${err.field}"]`);
          field?.focus();
        }
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.label || "Submit";
      }
    }
  });
}

/** Contact page: 3-way intent + conditional panels */
export function initContactPage() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const seg = document.querySelectorAll("[data-intent]");
  const panels = form.querySelectorAll("[data-intent-panel]");
  const enquiry = form.querySelector('[name="enquiry_type"]');
  const formType = form.querySelector('[name="form_type"]');

  const map = {
    hiring: { enquiry: "I'm hiring", form_type: "contact_hiring", panel: "hiring" },
    move: { enquiry: "I'm considering a move", form_type: "contact_career_move", panel: "move" },
    general: { enquiry: "General enquiry", form_type: "contact_general", panel: "general" },
  };

  function setIntent(key) {
    const cfg = map[key] || map.hiring;
    seg.forEach((b) => {
      const on = b.getAttribute("data-intent") === key;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    if (enquiry) enquiry.value = cfg.enquiry;
    if (formType) formType.value = cfg.form_type;
    const emailLabel = form.querySelector("[data-email-label]");
    if (emailLabel) {
      emailLabel.textContent = key === "hiring" ? "Work email *" : "Email *";
    }
    const cta = form.querySelector('[name="cta_id"]');
    if (cta) {
      cta.value =
        key === "move" ? "contact_career_submit" :
        key === "general" ? "contact_general_submit" :
        "contact_hiring_submit";
    }

    panels.forEach((panel) => {
      const on = panel.getAttribute("data-intent-panel") === cfg.panel;
      panel.hidden = !on;
      panel.querySelectorAll("input, select, textarea").forEach((el) => {
        if (el.name === "enquiry_type" || el.name === "form_type" || el.type === "hidden") return;
        if (on) {
          el.disabled = false;
          if (el.dataset.wasRequired === "1") el.required = true;
        } else {
          if (el.required) el.dataset.wasRequired = "1";
          el.required = false;
          el.removeAttribute("aria-required");
          el.disabled = true; // excluded from FormData
          if (el.type === "checkbox" || el.type === "radio") el.checked = false;
          else if (el.type === "file") el.value = "";
          else el.value = "";
        }
      });
    });

    // Route cards above form
    document.querySelectorAll("[data-route-panel]").forEach((p) => {
      p.hidden = p.getAttribute("data-route-panel") !== cfg.panel;
    });
  }

  seg.forEach((btn) => {
    btn.addEventListener("click", () => setIntent(btn.getAttribute("data-intent")));
  });

  const params = new URLSearchParams(location.search);
  const t = params.get("type");
  if (t === "move" || t === "candidate") setIntent("move");
  else if (t === "general") setIntent("general");
  else setIntent("hiring");

  const role = params.get("role");
  if (role) {
    const roleEl = form.querySelector('[name="role"]');
    if (roleEl) roleEl.value = decodeURIComponent(role);
  }

  wireIntentForm(form, {
    sourcePage: "contact",
    ctaId: "contact_submit",
  });
}

export function initSimpleSubmitForm(formId, opts = {}) {
  const form = document.getElementById(formId);
  if (!form) return;
  wireIntentForm(form, opts);
}
