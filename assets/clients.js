/* Clients page — specialist brief / shortlist signature
   ─────────────────────────────────────────────────────────── */

import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.7/+esm";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.7/ScrollTrigger/+esm";

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initBriefLab() {
  const lab = document.querySelector("[data-brief-lab]");
  if (!lab) return;

  const stages = [...lab.querySelectorAll("[data-brief-stage]")];
  const panels = [...lab.querySelectorAll("[data-brief-panel]")];
  const layers = [...lab.querySelectorAll("[data-brief-layer]")];
  const chips = [...lab.querySelectorAll("[data-market-chip]")];
  const shortlist = lab.querySelector("[data-shortlist]");
  let current = -1;

  function setStage(i) {
    if (i === current) return;
    current = i;
    lab.dataset.stage = String(i + 1);
    stages.forEach((el, n) => el.classList.toggle("is-on", n === i));
    panels.forEach((el, n) => {
      const active = n === i;
      el.classList.toggle("is-on", active);
      el.setAttribute("aria-hidden", String(!active));
    });

    layers.forEach((el, n) => {
      if (i === 0) el.classList.remove("is-on");
      else if (i === 1) el.classList.toggle("is-on", n < 4);
      else el.classList.add("is-on");
    });

    if (i < 2) {
      chips.forEach((c) => {
        c.classList.remove("is-out", "is-keep");
      });
      shortlist?.classList.remove("is-on");
    } else if (i === 2) {
      chips.forEach((c) => {
        const keep = c.hasAttribute("data-keep");
        c.classList.toggle("is-keep", keep);
        c.classList.toggle("is-out", !keep);
      });
      shortlist?.classList.remove("is-on");
    } else {
      chips.forEach((c) => {
        const keep = c.hasAttribute("data-keep");
        c.classList.toggle("is-keep", keep);
        c.classList.toggle("is-out", !keep);
      });
      shortlist?.classList.add("is-on");
    }
  }

  setStage(0);

  if (reduce) {
    setStage(3);
    layers.forEach((el) => el.classList.add("is-on"));
    chips.forEach((c) => {
      const keep = c.hasAttribute("data-keep");
      c.classList.toggle("is-keep", keep);
      c.classList.toggle("is-out", !keep);
    });
    shortlist?.classList.add("is-on");
    return;
  }

  function stageFromProgress(p) {
    if (p < 0.22) return 0;
    if (p < 0.48) return 1;
    if (p < 0.77) return 2;
    return 3;
  }

  ScrollTrigger.matchMedia({
    "(max-width: 900px)": function () {
      current = -1;
      setStage(3);
    },
    "(min-width: 901px)": function () {
      current = -1;
      setStage(0);
      const trigger = ScrollTrigger.create({
        trigger: lab,
        start: "top top+=12%",
        end: () => `+=${Math.max(window.innerHeight * 2.8, 2000)}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          setStage(stageFromProgress(self.progress));
        },
        onRefresh(self) {
          setStage(stageFromProgress(self.progress));
        },
        onLeave() {
          setStage(3);
        },
        onLeaveBack() {
          setStage(0);
        },
      });

      setStage(stageFromProgress(trigger.progress));
    },
  });
}

function initProofStagger() {
  if (reduce) return;
  const cards = [...document.querySelectorAll(".clients-proof .proof-card")];
  if (!cards.length) return;
  gsap.set(cards, { opacity: 0, y: 28 });
  ScrollTrigger.create({
    trigger: ".clients-proof .proof-rail",
    start: "top 82%",
    once: true,
    onEnter() {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.18,
        ease: "power3.out",
        clearProps: "transform",
      });
    },
  });
}

initBriefLab();
initProofStagger();
