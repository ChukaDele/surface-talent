/* Surface Talent — shared marketing interactions
   Progressive enhancement: critical UI never depends on GSAP.
   Core: nav, mobile menu, booking, dark-nav IO, reveal fallback
   Motion (optional): GSAP cursor / magnetic / ScrollTrigger reveals
   ─────────────────────────────────────────────────────────── */

import { BOOKING_URL } from "./taxonomy.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

export { BOOKING_URL, reduce, coarse, canHover };

/* ── Booking links ─────────────────────────────────────────── */
export function initBookingLinks() {
  document.querySelectorAll("[data-booking]").forEach((a) => {
    a.setAttribute("href", BOOKING_URL);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    const label = (a.getAttribute("aria-label") || a.textContent || "Book a call").trim();
    if (!/opens in a new tab/i.test(label)) {
      a.setAttribute("aria-label", `${label} (opens in a new tab)`);
    }
    if (!a.querySelector(".btn__ext")) {
      const hint = document.createElement("span");
      hint.className = "visually-hidden btn__ext";
      hint.textContent = " (opens in a new tab)";
      a.appendChild(hint);
    }
  });
}

/* ── Nav + mobile menu (no GSAP) ───────────────────────────── */
export function initNav() {
  const nav = document.querySelector("[data-nav]");
  const menu = document.querySelector("[data-menu]");
  const links = document.querySelector(".nav__links");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("is-solid", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Dark nav over bath sections — IntersectionObserver (works without GSAP)
  const darkSections = document.querySelectorAll("[data-nav-dark]");
  if (darkSections.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        const active = entries.some((e) => e.isIntersecting);
        // Re-check all — keep dark if any section intersects the nav band
        let any = false;
        darkSections.forEach((section) => {
          const r = section.getBoundingClientRect();
          if (r.top < 56 && r.bottom > 48) any = true;
        });
        nav.classList.toggle("is-dark", any || active);
      },
      { rootMargin: "-48px 0px -70% 0px", threshold: [0, 0.01, 0.1] }
    );
    darkSections.forEach((s) => io.observe(s));
    window.addEventListener(
      "scroll",
      () => {
        let any = false;
        darkSections.forEach((section) => {
          const r = section.getBoundingClientRect();
          if (r.top < 56 && r.bottom > 48) any = true;
        });
        nav.classList.toggle("is-dark", any);
      },
      { passive: true }
    );
  }

  const setMenuOpen = (open) => {
    if (!links || !menu) return;
    links.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  menu?.setAttribute("aria-expanded", "false");
  menu?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !links?.classList.contains("open");
    setMenuOpen(open);
  });

  links?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links?.classList.contains("open")) {
      setMenuOpen(false);
      menu?.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!links?.classList.contains("open")) return;
    const t = e.target;
    if (nav.contains(t)) {
      if (t === menu || menu?.contains(t) || links.contains(t)) return;
    }
    setMenuOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && links?.classList.contains("open")) {
      setMenuOpen(false);
    }
  });
}

/* ── Reveal: visible by default; motion enhances ───────────── */
function revealInView(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.92 && r.bottom > 0;
}

export function initRevealFallback() {
  // Without motion module, everything stays visible (no .motion-ready)
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (revealInView(el)) el.classList.add("is-in");
  });
}

async function initMotionEnhancements() {
  if (reduce) {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    return;
  }

  let gsap;
  let ScrollTrigger;
  try {
    ({ gsap } = await import("https://cdn.jsdelivr.net/npm/gsap@3.12.7/+esm"));
    ({ ScrollTrigger } = await import("https://cdn.jsdelivr.net/npm/gsap@3.12.7/ScrollTrigger/+esm"));
    gsap.registerPlugin(ScrollTrigger);
  } catch (err) {
    console.warn("[Surface Talent] Motion unavailable — core UI unaffected.", err);
    return;
  }

  document.documentElement.classList.add("motion-ready");

  // Mark already-in-view before hiding others via CSS
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (revealInView(el)) el.classList.add("is-in");
  });

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => el.classList.add("is-in"),
      // If already past on create / after restore
      onRefresh: (self) => {
        if (self.isActive || self.progress > 0) el.classList.add("is-in");
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9) el.classList.add("is-in");
      },
    });
  });

  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh);
  if (document.fonts?.ready) document.fonts.ready.then(refresh);
  window.addEventListener("resize", () => {
    clearTimeout(window.__stRefreshT);
    window.__stRefreshT = setTimeout(refresh, 150);
  });
  // Mid-page restore / back-forward cache
  window.addEventListener("pageshow", refresh);
  requestAnimationFrame(refresh);

  // Cursor + magnetic only on true hover desktops
  if (!coarse && canHover && finePointer) {
    initCursor(gsap);
    initMagnetic(gsap);
  }
}

function initCursor(gsap) {
  const el = document.createElement("div");
  el.className = "st-cursor";
  el.innerHTML = `<span class="st-cursor__dot"></span><span class="st-cursor__ring"></span>`;
  document.body.appendChild(el);
  document.body.classList.add("has-st-cursor");

  const dot = el.querySelector(".st-cursor__dot");
  const ring = el.querySelector(".st-cursor__ring");
  const pos = { x: 0, y: 0 };
  const ringPos = { x: 0, y: 0 };

  window.addEventListener(
    "pointermove",
    (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      gsap.set(dot, { x: pos.x, y: pos.y });
    },
    { passive: true }
  );

  gsap.ticker.add(() => {
    ringPos.x += (pos.x - ringPos.x) * 0.16;
    ringPos.y += (pos.y - ringPos.y) * 0.16;
    gsap.set(ring, { x: ringPos.x, y: ringPos.y });
  });

  document.querySelectorAll("a, button, .btn, [data-magnetic]").forEach((node) => {
    node.addEventListener("pointerenter", () => el.classList.add("is-hot"));
    node.addEventListener("pointerleave", () => el.classList.remove("is-hot"));
  });
}

function initMagnetic(gsap) {
  document.querySelectorAll("[data-magnetic]").forEach((btn) => {
    const s = Number(btn.getAttribute("data-magnetic") || 14);
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, { x: x / s, y: y / s, duration: 0.35, ease: "power3.out" });
    });
    btn.addEventListener("pointerleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ── Boot ──────────────────────────────────────────────────── */
export function initSiteShell() {
  initNav();
  initBookingLinks();
  initRevealFallback();
  initMotionEnhancements();
}

initSiteShell();
