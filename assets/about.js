/* About — lineage rail progressive build (no GSAP required)
   ─────────────────────────────────────────────────────────── */

function initLineage() {
  const rail = document.querySelector("[data-lineage]");
  if (!rail) return;
  const steps = [...rail.querySelectorAll("[data-step]")];
  if (!steps.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    rail.classList.add("is-built");
    steps.forEach((s) => s.classList.add("is-on"));
    return;
  }

  // Progressive enhancement: only dim steps when JS can animate them in
  rail.classList.add("is-enhance");

  let built = false;
  const revealStep = (i) => {
    if (i >= steps.length) return;
    steps[i].classList.add("is-on");
    if (i === steps.length - 1) rail.classList.add("is-built");
    else window.setTimeout(() => revealStep(i + 1), 140);
  };

  if (!("IntersectionObserver" in window)) {
    steps.forEach((s) => s.classList.add("is-on"));
    rail.classList.add("is-built");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || built) return;
        built = true;
        revealStep(0);
        io.disconnect();
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
  );
  io.observe(rail);
}

initLineage();
