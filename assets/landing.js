/* Surface Talent — Pass 2 motion architecture
   GSAP · ScrollTrigger · Lenis
   Signature: hero layers · system pin · stack · pipeline · close
   ─────────────────────────────────────────────────────────── */

import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.7/+esm";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.7/ScrollTrigger/+esm";
import Lenis from "https://cdn.jsdelivr.net/npm/lenis@1.1.18/+esm";

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ── Smooth scroll ─────────────────────────────────────────── */
function initLenis() {
  if (reduce) return null;
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
  return lenis;
}

/* ── Nav ───────────────────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector("[data-nav]");
  const menu = document.querySelector("[data-menu]");
  const links = document.querySelector(".nav__links");
  if (!nav) return;

  ScrollTrigger.create({
    start: 40,
    onUpdate(self) {
      nav.classList.toggle("is-solid", self.scroll() > 40);
    },
  });

  // Dark nav over bath sections
  document.querySelectorAll(".system, .operator, .pipeline, .close, .consequence").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top top+=48",
      end: "bottom top+=48",
      onEnter: () => nav.classList.add("is-dark"),
      onEnterBack: () => nav.classList.add("is-dark"),
      onLeave: () => nav.classList.remove("is-dark"),
      onLeaveBack: () => nav.classList.remove("is-dark"),
    });
  });

  const setMenuOpen = (open) => {
    if (!links || !menu) return;
    links.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  menu?.setAttribute("aria-expanded", "false");
  menu?.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenuOpen(!links?.classList.contains("open"));
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
    if (nav.contains(e.target) && (menu?.contains(e.target) || links.contains(e.target))) return;
    setMenuOpen(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setMenuOpen(false);
  });
}

/* ── Cursor + magnetic ─────────────────────────────────────── */
function initCursor() {
  if (reduce || coarse || !canHover || !finePointer) return;

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

function initMagnetic() {
  if (reduce || coarse) return;
  document.querySelectorAll("[data-magnetic]").forEach((btn) => {
    const s = Number(btn.getAttribute("data-magnetic") || 14);
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: ((e.clientX - (r.left + r.width / 2)) / r.width) * s,
        y: ((e.clientY - (r.top + r.height / 2)) / r.height) * s,
        duration: 0.3,
        ease: "power3.out",
      });
    });
    btn.addEventListener("pointerleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.45)" });
    });
  });
}

/* ── HERO: looping specimen (GIF-like) + type entrance ─────── */
function initHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const lines = [...hero.querySelectorAll("[data-hero-line] .hero__line-inner")];
  const layers = [...hero.querySelectorAll(".specimen-layer")];
  const coats = layers.slice(1);
  const marks = hero.querySelector(".specimen-marks");
  const ghost = hero.querySelector(".specimen-ghost");
  const specimen = hero.querySelector("[data-specimen]");
  const scrollHint = hero.querySelector(".hero__scroll span");

  if (scrollHint) scrollHint.textContent = "Scroll to continue";

  if (!reduce && lines.length) {
    gsap.from(lines, {
      yPercent: 115,
      duration: 1.15,
      stagger: 0.08,
      ease: "power4.out",
      delay: 0.15,
    });
  }

  // Substrate always present
  gsap.set(layers[0], { y: 0, opacity: 1 });

  if (reduce) {
    gsap.set(layers, { y: 0, opacity: 1 });
    if (marks) gsap.set(marks, { opacity: 0.7 });
    if (ghost) gsap.set(ghost, { opacity: 0 });
    return;
  }

  gsap.set(coats, { y: (i) => -56 - i * 28, opacity: 0 });
  if (marks) gsap.set(marks, { opacity: 0 });
  if (ghost) gsap.set(ghost, { opacity: 0.3 });

  // Ambient float on the whole specimen
  if (specimen) {
    gsap.to(specimen, {
      y: -10,
      duration: 2.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  // Loop: assemble → hold → dissolve → repeat
  const loop = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.35,
    defaults: { ease: "power2.out" },
  });

  coats.forEach((layer, i) => {
    loop.to(
      layer,
      { y: 0, opacity: 1, duration: 0.55 },
      0.15 + i * 0.22
    );
  });
  if (ghost) loop.to(ghost, { opacity: 0, duration: 0.4 }, 0.2);
  if (marks) loop.to(marks, { opacity: 0.75, duration: 0.4 }, 0.85);

  loop.to({}, { duration: 1.4 }); // hold finished state

  loop.addLabel("dissolve");
  if (marks) loop.to(marks, { opacity: 0, duration: 0.35 }, "dissolve");
  coats
    .slice()
    .reverse()
    .forEach((layer, i) => {
      loop.to(
        layer,
        {
          y: -56 - (coats.length - 1 - i) * 28,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        },
        `dissolve+=${0.08 + i * 0.12}`
      );
    });
  if (ghost) loop.to(ghost, { opacity: 0.3, duration: 0.4 }, "dissolve+=0.15");

  loop.to({}, { duration: 0.5 }); // brief raw pause

  initHeroSystemMorph(hero);
}

/* Hero freezes, washes into bath — system pin opens with the one “job title” line */
function initHeroSystemMorph(hero) {
  if (!hero || reduce) return;
  const fadeEls = [
    ...hero.querySelectorAll(".hero__rail, .hero__stage, .hero__foot, .hero__scroll"),
  ];
  if (!fadeEls.length) return;

  gsap.set(fadeEls, { opacity: 1, y: 0 });
  hero.style.setProperty("--hero-morph", 0);

  ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "+=95%",
    pin: true,
    scrub: 0.7,
    anticipatePin: 1,
    onUpdate(self) {
      const p = self.progress;
      // Hold, then wash dark and clear hero UI into the system section
      const wash = gsap.utils.clamp(0, 1, (p - 0.18) / 0.55);
      const fade = gsap.utils.clamp(0, 1, (p - 0.22) / 0.5);
      hero.style.setProperty("--hero-morph", String(wash));
      gsap.set(fadeEls, {
        opacity: 1 - fade,
        y: -32 * fade,
      });
    },
  });
}

/* ── SYSTEM: pinned generalist → depth ─────────────────────── */
function initSystem() {
  const section = document.querySelector("[data-system]");
  const pin = document.querySelector("[data-system-pin]");
  if (!section || !pin) return;

  const phase = pin.querySelector("[data-system-phase]");
  const title = pin.querySelector("[data-system-title]");
  const body = pin.querySelector("[data-system-body]");
  const copyEl = pin.querySelector(".system__copy");
  const viz = pin.querySelector(".system__viz");
  const job = pin.querySelector("[data-job-card]");
  const shards = job ? [...job.querySelectorAll(".job-card__shards li")] : [];
  const layers = [...pin.querySelectorAll("[data-depth='layer']")];
  const depthSvg = pin.querySelector("[data-system-svg]");

  const copy = [
    {
      phase: "01 — Surface read",
      title: "Generalist recruitment<br>sees a job title.",
      body: "A CV. A LinkedIn headline. A role brief written from outside the plant.",
    },
    {
      phase: "02 — Cross-section",
      title: "Zoom into the<br>system underneath.",
      body: "Coating process. Chemistry. Substrate. Equipment. Compliance. Sector. Production context.",
    },
    {
      phase: "03 — Specialist read",
      title: "We see the system<br>behind it.",
      body: "That is why briefs are sharper, shortlists smaller, and hires that last.",
    },
  ];

  function setCopy(i) {
    const c = copy[Math.min(i, copy.length - 1)];
    if (phase) phase.textContent = c.phase;
    if (title) title.innerHTML = c.title;
    if (body) body.textContent = c.body;
  }

  function vizOffsetFromCenter() {
    if (!viz) return { x: 0, y: 0 };
    const pinRect = pin.getBoundingClientRect();
    const vizRect = viz.getBoundingClientRect();
    return {
      x: vizRect.left + vizRect.width / 2 - (pinRect.left + pinRect.width / 2),
      y: vizRect.top + vizRect.height / 2 - (pinRect.top + pinRect.height / 2),
    };
  }

  if (reduce) {
    layers.forEach((l) => {
      l.style.opacity = "1";
      l.style.transform = "none";
    });
    setCopy(2);
    if (job) job.style.display = "none";
    return;
  }

  function render(p) {
    // A deliberate final hold ensures the role card is fully resolved before
    // the pin releases and the next section can enter.
    if (p < 0.24) setCopy(0);
    else if (p < 0.76) setCopy(1);
    else setCopy(2);

    const split = gsap.utils.clamp(0, 1, (p - 0.18) / 0.34);
    const target = vizOffsetFromCenter();

    if (copyEl) {
      gsap.set(copyEl, { opacity: p < 0.18 ? 0.72 : 1 });
    }

    if (job) {
      const fading = gsap.utils.clamp(0, 1, (split - 0.42) / 0.48);
      job.classList.toggle("is-splitting", split > 0.08 && fading < 0.98);
      gsap.set(job, {
        // Keep the brief inside the visual column at every desktop width.
        // It no longer crosses the copy column on short laptops.
        x: target.x,
        y: target.y,
        scale: 1 - split * 0.42,
        opacity: p >= 0.9 ? 0 : 1 - fading,
      });

      shards.forEach((shard, i) => {
        const local = gsap.utils.clamp(0, 1, (split - 0.05 - i * 0.05) / 0.15);
        gsap.set(shard, {
          opacity: local * (1 - fading),
          y: (1 - local) * 12,
        });
      });
    }

    const zoom = gsap.utils.clamp(0, 1, (p - 0.5) / 0.32);
    if (depthSvg) {
      gsap.set(depthSvg, {
        scale: 1 + zoom * 0.22,
        transformOrigin: "50% 42%",
      });
    }

    const mid = (layers.length - 1) / 2;
    layers.forEach((layer, i) => {
      const start = 0.24 + i * 0.045;
      const local = gsap.utils.clamp(0, 1, (p - start) / 0.13);
      gsap.set(layer, {
        opacity: local,
        x: 0,
        y: (1 - local) * (16 + i * 3) + (i - mid) * zoom * 9,
        scale: 0.96 + local * 0.04,
        transformOrigin: "50% 50%",
      });
    });
  }

  ScrollTrigger.matchMedia({
    "(max-width: 900px)": function () {
      // Mobile is a content-first composition, not a compressed desktop pin:
      // copy → compact role brief → full-width system cross-section.
      setCopy(2);
      if (copyEl) gsap.set(copyEl, { opacity: 1 });
      if (job) {
        job.classList.remove("is-splitting");
        gsap.set(job, { clearProps: "all", opacity: 1, scale: 1 });
      }
      gsap.set(shards, { clearProps: "all" });
      gsap.set(layers, { opacity: 1, x: 0, y: 0, scale: 1 });
      if (depthSvg) gsap.set(depthSvg, { scale: 1 });
    },
    "(min-width: 901px)": function () {
      setCopy(0);
      if (job) {
        gsap.set(job, {
          left: "50%",
          top: "50%",
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          opacity: 1,
        });
      }
      gsap.set(layers, { opacity: 0, x: 0, y: 28, scale: 0.94 });
      gsap.set(shards, { opacity: 0, y: 8 });

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${Math.max(window.innerHeight * 2.8, 1900)}`,
        pin,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          render(self.progress);
        },
        onRefresh(self) {
          render(self.progress);
        },
        onLeave() {
          render(1);
          job?.classList.remove("is-splitting");
        },
        onLeaveBack() {
          render(0);
        },
      });

      render(trigger.progress);
      return () => job?.classList.remove("is-splitting");
    },
  });
}

/* ── STACK: measure intro + scale previous cards as next pins ─ */
function measureStackChrome() {
  const section = document.querySelector(".stack-section");
  const intro = document.querySelector(".stack-section__intro");
  const nav = document.querySelector(".nav");
  if (!section) return { navH: 52, introH: 0 };

  const navH = nav ? Math.ceil(nav.getBoundingClientRect().height) : 52;
  const introH = intro ? Math.ceil(intro.getBoundingClientRect().height) : 0;
  section.style.setProperty("--stack-nav-h", `${navH}px`);
  section.style.setProperty("--stack-intro-h", `${introH}px`);
  return { navH, introH };
}

function getStackStickyTopPx(index) {
  const { navH, introH } = measureStackChrome();
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return navH + introH + index * 0.55 * rem;
}

function initStack() {
  const section = document.querySelector(".stack-section");
  const cards = [...document.querySelectorAll("[data-stack-card]")];
  if (!section || !cards.length) return;

  // Illustrations run at every width; only the sticky-stack scrub is desktop-only.
  initStackIllos();
  if (reduce) return;

  // ScrollTrigger.matchMedia re-runs this setup (and auto-reverts its tweens/
  // triggers) whenever the viewport crosses 700px, so a resize/rotate after
  // load can't leave the scrub stuck in whichever mode the page booted into.
  ScrollTrigger.matchMedia({
    "(min-width: 701px)": function () {
      measureStackChrome();

      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;

        gsap.fromTo(
          card,
          { scale: 1, filter: "brightness(1)" },
          {
            scale: 0.975 - i * 0.008,
            filter: "brightness(0.94)",
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: () => `top ${getStackStickyTopPx(i + 1) + Math.max(24, window.innerHeight * 0.35)}px`,
              end: () => `top ${getStackStickyTopPx(i)}px`,
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      const onResize = () => {
        measureStackChrome();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize, { passive: true });

      let ro;
      if (typeof ResizeObserver !== "undefined") {
        const intro = document.querySelector(".stack-section__intro");
        ro = new ResizeObserver(() => onResize());
        if (intro) ro.observe(intro);
        const nav = document.querySelector(".nav");
        if (nav) ro.observe(nav);
      }

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          measureStackChrome();
          ScrollTrigger.refresh();
        });
      }

      requestAnimationFrame(() => {
        measureStackChrome();
        ScrollTrigger.refresh();
      });

      return () => {
        window.removeEventListener("resize", onResize);
        ro?.disconnect();
      };
    },
  });
}

/* ── STACK illustrations: GIF-like loops ───────────────────── */
function initStackIllos() {
  if (reduce) return;

  // 01 Process — layers assemble then reset (label rides with each bar)
  const process = document.querySelector('[data-illo="process"]');
  if (process) {
    const bars = [...process.querySelectorAll(".illo-bar")];
    const marks = process.querySelector(".illo-marks");
    const origins = ["210px 300px", "210px 230px", "210px 160px", "210px 100px"];
    gsap.set(bars, (i) => ({ scaleY: 0, transformOrigin: origins[i] }));
    gsap.set(marks, { opacity: 0 });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.45 });
    bars.forEach((bar, i) => {
      tl.to(bar, { scaleY: 1, duration: 0.45, ease: "power2.out" }, i * 0.18);
    });
    tl.to(marks, { opacity: 1, duration: 0.35 }, "-=0.1");
    tl.to({}, { duration: 1.2 });
    tl.to(marks, { opacity: 0, duration: 0.25 });
    tl.to(bars, { scaleY: 0, duration: 0.35, stagger: 0.06, ease: "power2.in" });
  }

  // 02 Network — ST hub; talent/plant nodes jitter inside the ring; spokes stay attached
  const network = document.querySelector('[data-illo="network"]');
  if (network) {
    const hub = network.querySelector(".illo-hub");
    const core = network.querySelector(".illo-core");
    const ring = network.querySelector(".illo-ring");
    const nodeGroups = [...network.querySelectorAll(".illo-node")];
    const links = [...network.querySelectorAll(".illo-link")];
    const hubHome = { x: 210, y: 168 };
    const ringR = Number(ring?.getAttribute("r") || 102);

    const nodeHomes = nodeGroups.map((g) => {
      const c = g.querySelector("circle");
      return {
        el: g,
        x: Number(c.getAttribute("cx")),
        y: Number(c.getAttribute("cy")),
        r: Number(c.getAttribute("r")) || 17,
        xOff: 0,
        yOff: 0,
        sway: 0,
      };
    });
    const hubState = { x: 0, y: 0 };

    function clampInRing(nx, ny, nodeR) {
      const dx = nx - hubHome.x;
      const dy = ny - hubHome.y;
      const max = ringR - nodeR - 6;
      const d = Math.hypot(dx, dy) || 1;
      if (d <= max) return { x: nx, y: ny };
      const s = max / d;
      return { x: hubHome.x + dx * s, y: hubHome.y + dy * s };
    }

    function updateLinks() {
      const hx = hubHome.x + hubState.x;
      const hy = hubHome.y + hubState.y;
      const coreR = Number(core?.getAttribute("r")) || 24;
      links.forEach((wire, i) => {
        const home = nodeHomes[i];
        if (!home) return;
        const pos = clampInRing(home.x + home.xOff, home.y + home.yOff, home.r);
        const dx = pos.x - hx;
        const dy = pos.y - hy;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;
        // wire is pinned to the outside edge of the ST core and the node edge
        const sx = hx + ux * (coreR + 1);
        const sy = hy + uy * (coreR + 1);
        const ex = pos.x - ux * (home.r + 1);
        const ey = pos.y - uy * (home.r + 1);
        // flexible wire: bow the midpoint perpendicular to the run
        const mx = (sx + ex) / 2 - uy * home.sway;
        const my = (sy + ey) / 2 + ux * home.sway;
        wire.setAttribute("d", `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
      });
    }

    function applyNodePose(home) {
      const pos = clampInRing(home.x + home.xOff, home.y + home.yOff, home.r);
      gsap.set(home.el, { x: pos.x - home.x, y: pos.y - home.y });
    }

    gsap.set([hub, ...nodeGroups], { x: 0, y: 0 });
    updateLinks();

    gsap.to(core, {
      attr: { r: 27 },
      duration: 0.7,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      onUpdate: updateLinks,
    });
    gsap.to(ring, {
      attr: { r: 106 },
      opacity: 0.65,
      duration: 0.85,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    // ST hub drifts gently but always stays inside the outer ring
    const hubRoam = () => {
      const ang = Math.random() * Math.PI * 2;
      const dist = 6 + Math.random() * 16; // max 22 « ring 102 − core 27
      gsap.to(hubState, {
        x: Math.cos(ang) * dist,
        y: Math.sin(ang) * dist,
        duration: 1.5 + Math.random() * 1.3,
        ease: "sine.inOut",
        onUpdate() {
          gsap.set(hub, { x: hubState.x, y: hubState.y });
          updateLinks();
        },
        onComplete: hubRoam,
      });
    };
    hubRoam();

    nodeHomes.forEach((home, i) => {
      const state = { xOff: 0, yOff: 0 };
      // each node gets its own heading so they never move as a group
      const baseAng = (i / nodeHomes.length) * Math.PI * 2;
      const roam = () => {
        const amp = 10 + (i * 5) % 14;
        const ang = baseAng + (Math.random() - 0.5) * 1.2;
        const dist = amp * (0.35 + Math.random() * 0.65);
        gsap.to(state, {
          xOff: Math.cos(ang) * dist,
          yOff: Math.sin(ang) * dist,
          duration: 0.45 + Math.random() * 0.55,
          ease: "sine.inOut",
          onUpdate() {
            home.xOff = state.xOff;
            home.yOff = state.yOff;
            applyNodePose(home);
            updateLinks();
          },
          onComplete: roam,
        });
      };
      gsap.delayedCall(i * 0.07, roam);

      // wire flex — slow bow that reverses direction each cycle
      const swayLoop = () => {
        gsap.to(home, {
          sway: (Math.random() * 2 - 1) * 9,
          duration: 0.9 + Math.random() * 0.9,
          ease: "sine.inOut",
          onUpdate: updateLinks,
          onComplete: swayLoop,
        });
      };
      gsap.delayedCall(i * 0.11, swayLoop);
    });
  }

  // 03 Context — SPEC → FIT → GO rise loop (highlighted bars)
  const context = document.querySelector('[data-illo="context"]');
  if (context) {
    const cols = [...context.querySelectorAll(".illo-col")];
    const guides = context.querySelector(".illo-guides");
    gsap.set(cols, { scaleY: 0.15, transformOrigin: "50% 100%", opacity: 0.35 });
    gsap.set(guides, { opacity: 0 });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
    cols.forEach((col, i) => {
      tl.to(
        col,
        { scaleY: 1, opacity: 1, duration: 0.55, ease: "power2.out" },
        i * 0.28
      );
    });
    tl.to(guides, { opacity: 0.7, duration: 0.3 }, "-=0.2");
    tl.to({}, { duration: 1.15 });
    tl.to(guides, { opacity: 0, duration: 0.25 });
    tl.to(cols, {
      scaleY: 0.15,
      opacity: 0.35,
      duration: 0.4,
      stagger: 0.08,
      ease: "power2.in",
    });
  }

  // 04 Match — brief → shortlist → placed (calm, readable)
  const match = document.querySelector('[data-illo="match"]');
  if (match) {
    const path = match.querySelector(".illo-path");
    const start = match.querySelector(".illo-start");
    const mid = match.querySelector(".illo-mid");
    const end = match.querySelector(".illo-end");
    const placed = match.querySelector(".illo-placed");
    if (path) {
      const len = path.getTotalLength?.() || 600;
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(start, { opacity: 1 });
      gsap.set([mid, end], { opacity: 0 });
      gsap.set(placed, { scale: 1, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
      tl.to(path, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" });
      tl.to(mid, { opacity: 1, duration: 0.25 }, "-=0.85");
      tl.to(end, { opacity: 1, duration: 0.35 }, "-=0.15");
      tl.to(placed, {
        scale: 1.08,
        duration: 0.7,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
      });
      tl.to({}, { duration: 1.1 });
      tl.to([mid, end], { opacity: 0, duration: 0.35 });
      tl.to(path, { strokeDashoffset: len, duration: 0.55, ease: "power2.in" });
    }
  }
}

/* ── Plant hotspots (legacy removed) ───────────────────────── */
function initPlant() {}

/* ── Defects reveal ────────────────────────────────────────── */
function initDefects() {
  if (reduce) return;
  const rows = [...document.querySelectorAll("[data-defect]")];
  rows.forEach((row, i) => {
    gsap.from(row, {
      opacity: 0,
      y: 24,
      duration: 0.7,
      delay: i * 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 88%" },
    });
  });
}

/* ── Proof — full-bleed rail; cards enter one by one ───────── */
function initProof() {
  if (reduce) return;
  const cards = [...document.querySelectorAll(".proof-card")];
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 34 });
  ScrollTrigger.create({
    trigger: ".proof__rail",
    start: "top 80%",
    once: true,
    onEnter() {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.22,
        ease: "power3.out",
        clearProps: "transform",
      });
    },
  });
}

/* ── Pipeline — left copy / right meaningful diagrams ──────── */
function initPipeline() {
  const section = document.querySelector("[data-pipeline]");
  if (!section) return;

  const title = section.querySelector("[data-pipe-title]");
  const copy = section.querySelector("[data-pipe-copy]");
  const index = section.querySelector("[data-pipe-index]");
  const steps = [...section.querySelectorAll("[data-pipe-steps] li")];
  const diagrams = [...section.querySelectorAll("[data-pipe-diagram]")];

  const stages = [
    {
      title: "Discover",
      copy: "A proper technical brief. On-site where it helps. We learn what good looks like for this hire.",
    },
    {
      title: "Understand",
      copy: "Process, chemistry, kit, standards and commercial context — mapped before we search.",
    },
    {
      title: "Search",
      copy: "Market mapped. Shortlist approached personally. No job-board spray. No shared databases.",
    },
    {
      title: "Assess",
      copy: "Two to three you'd hire. Screened technically and commercially.",
    },
    {
      title: "Place",
      copy: "Structured aftercare through onboarding and beyond. We stay accountable after the start date.",
    },
  ];

  let current = -1;

  function setStage(i) {
    if (i === current) return;
    current = i;
    const s = stages[i];
    if (title) title.textContent = s.title;
    if (copy) copy.textContent = s.copy;
    if (index) {
      index.textContent = `${String(i + 1).padStart(2, "0")} / ${String(stages.length).padStart(2, "0")}`;
    }
    steps.forEach((el, idx) => el.classList.toggle("is-on", idx === i));
    diagrams.forEach((el, idx) => el.classList.toggle("is-on", idx === i));
  }

  setStage(0);
  const panels = [...section.querySelectorAll("[data-pipe-panel]")];
  steps.forEach((el, idx) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      const target = panels[idx];
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 8;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      setStage(idx);
    });
  });

  if (reduce) {
    setStage(stages.length - 1);
    return;
  }

  // matchMedia re-creates (and auto-reverts) this trigger on breakpoint
  // crossing, so a resize/rotate after load can't leave the scrub dead.
  ScrollTrigger.matchMedia({
    "(min-width: 861px)": function () {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.45,
        onUpdate(self) {
          const i = Math.min(
            stages.length - 1,
            Math.floor(self.progress * stages.length)
          );
          setStage(i);
        },
      });
    },
  });
}

/* ── Material library ──────────────────────────────────────── */
function initMaterials() {
  const items = [...document.querySelectorAll("[data-material]")];
  const detail = document.querySelector("[data-material-detail]");
  if (!items.length || !detail) return;

  const copy = [
    {
      tag: "01 · Wet process",
      title: "Electroplating",
      body: "Rack, barrel, decorative and functional plating. Aerospace, defence, automotive, precision engineering.",
    },
    {
      tag: "02 · Aluminium and multi-metal",
      title: "Anodising",
      body: "Sulphuric, chromic, hard and architectural. Chromate, phosphate and passivation for aluminium and multi-metal.",
    },
    {
      tag: "03 · Organic finishing",
      title: "Powder and paint",
      body: "Architectural, industrial and high-performance coatings. Qualicoat, GSB and specialist contract finishers.",
    },
    {
      tag: "04 · Thermal processing",
      title: "Heat treatment",
      body: "Case hardening, carburising, nitriding, vacuum and induction. Commercial and captive in-house facilities.",
    },
    {
      tag: "05 · Advanced coating",
      title: "Thermal spray and deposition",
      body: "HVOF, plasma, arc, flame spray, PVD and CVD. Wear, corrosion and dimensional work for aerospace, energy and oil and gas.",
    },
    {
      tag: "06 · Preparation",
      title: "Blasting and pre-treatment",
      body: "Shot, grit and bead blasting, shot peening, and the chemical pre-treatment lines behind every coating process.",
    },
  ];

  const tag = detail.querySelector("[data-md-tag]");
  const title = detail.querySelector("[data-md-title]");
  const body = detail.querySelector("[data-md-body]");

  function select(i) {
    items.forEach((el, idx) => el.classList.toggle("is-on", idx === i));
    const c = copy[i];
    if (tag) tag.textContent = c.tag;
    if (title) title.textContent = c.title;
    if (body) body.textContent = c.body;
  }

  items.forEach((el) => {
    el.addEventListener("click", () => select(Number(el.dataset.material)));
    el.addEventListener("pointerenter", () => {
      if (!coarse) select(Number(el.dataset.material));
    });
  });
}

/* ── Close specimen float ──────────────────────────────────── */
function initClose() {
  if (reduce) return;
  const specimen = document.querySelector("[data-close-specimen]");
  if (!specimen) return;

  gsap.to(specimen, {
    y: -18,
    duration: 3.2,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });

  gsap.from(specimen, {
    scale: 0.85,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: { trigger: "[data-close]", start: "top 70%" },
  });
}

/* ── Live roles tag ────────────────────────────────────────── */
function initLiveTag() {
  const tag = document.getElementById("live-tag");
  if (!tag) return;
  fetch("/api/jobs")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const n = Array.isArray(data?.records)
        ? data.records.length
        : Array.isArray(data)
          ? data.length
          : 0;
      if (n > 0) tag.textContent = `${n} live ${n === 1 ? "role" : "roles"}`;
    })
    .catch(() => {});
}

/* ── Years count-up (EMC since 2004) ───────────────────────── */
function initCountUp() {
  const nodes = [...document.querySelectorAll("[data-count-up]")];
  if (!nodes.length) return;

  nodes.forEach((el) => {
    const fromYear = Number(el.getAttribute("data-count-from") || 2004);
    const target = Math.max(0, new Date().getFullYear() - fromYear);
    const valueEl = el.querySelector("[data-count-value]");
    if (!valueEl) return;

    if (reduce) {
      valueEl.textContent = String(target);
      return;
    }

    const state = { n: 0 };
    const runCount = () => {
      gsap.to(state, {
        n: target,
        duration: 1.6,
        ease: "power2.out",
        onUpdate() {
          valueEl.textContent = String(Math.round(state.n));
        },
      });
    };

    // This stat sits above the fold, so "top 90%" is already behind the
    // viewport on load — onEnter needs an entering transition to fire, and
    // one never happens if the trigger is active from the very first paint.
    let fired = false;
    const fireOnce = () => {
      if (fired) return;
      fired = true;
      runCount();
    };
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      onEnter: fireOnce,
      onEnterBack: fireOnce,
    });
    requestAnimationFrame(() => {
      if (trigger.isActive) fireOnce();
    });
  });
}

/* ── Boot ──────────────────────────────────────────────────── */
document.documentElement.classList.add("js-ready");
initLenis();
initNav();
initCursor();
initMagnetic();
initHero();
initSystem();
initStack();
initPlant();
initDefects();
initProof();
initPipeline();
initMaterials();
initClose();
initLiveTag();
initCountUp();
