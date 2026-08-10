/* Surface engineering atlas — index + detail + illustration
   ─────────────────────────────────────────────────────────── */

const DISCIPLINES = [
  {
    id: "electroplating",
    n: "01",
    eyebrow: "01 · Electroplating and aqueous electrolytic processes",
    title: "Electroplating",
    airtable: "Electroplating",
    body: "Zinc, nickel, chrome, copper, silver, gold and alloy plating. Rack and barrel processes. Hard chrome on hydraulic rods, rollers and precision components. We recruit process engineers, chemists, line supervisors, quality managers and operations leaders across general industrial, aerospace, defence and automotive platers.",
    svg: `<rect x="40" y="70" width="70" height="90" fill="#1C2229" stroke="#5A6570"/><rect x="130" y="70" width="70" height="90" fill="#3A4550" stroke="#5A6570"/><rect x="220" y="70" width="70" height="90" fill="#B87333"/><path d="M75 160 V180 M165 160 V180 M255 160 V180" stroke="#8F5A28" stroke-width="1.5"/><path d="M50 180 H290" stroke="#8F5A28" stroke-width="1.5"/><text x="40" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">WET PROCESS · CELLS</text>`,
  },
  {
    id: "anodising",
    n: "02",
    eyebrow: "02 · Anodising and chemical conversion",
    title: "Anodising and conversion coatings",
    airtable: "Anodising",
    body: "Sulphuric, chromic, hard and architectural anodising. Chromate and trivalent conversion coatings, phosphating, passivation. We recruit across architectural anodisers, aerospace finishers, specialist hard anodisers and general industrial converters.",
    svg: `<rect x="60" y="56" width="260" height="140" fill="#8F5A28"/><rect x="60" y="56" width="260" height="36" fill="#E8C9A0"/><rect x="60" y="160" width="260" height="36" fill="#5A3A1C"/><circle cx="190" cy="126" r="18" stroke="#1C2229" stroke-width="2" fill="none"/><text x="60" y="42" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">OXIDE BUILD</text>`,
  },
  {
    id: "powder-coating",
    n: "03",
    eyebrow: "03 · Powder coating, wet paint and industrial coatings",
    title: "Powder coating and industrial coatings",
    airtable: "Powder coating",
    body: "Architectural powder coating to Qualicoat and BS EN standards, high-performance industrial coatings, contract finishing and wet paint systems. We recruit production managers, quality leads, applicators, BDMs and directors across architectural, industrial and coating equipment manufacturers.",
    svg: `<path d="M50 170 H330" stroke="#3A4550" stroke-width="2"/><rect x="80" y="90" width="50" height="80" fill="#8F5A28"/><rect x="150" y="70" width="50" height="100" fill="#B87333"/><rect x="220" y="100" width="50" height="70" fill="#1C2229"/><circle cx="105" cy="72" r="10" fill="#C0C5C9" opacity=".55"/><circle cx="175" cy="52" r="12" fill="#C0C5C9" opacity=".4"/><text x="50" y="42" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">ORGANIC COAT</text>`,
  },
  {
    id: "heat-treatment",
    n: "04",
    eyebrow: "04 · Heat treatment and thermochemical diffusion",
    title: "Heat treatment",
    airtable: "Heat treatment",
    body: "Case hardening, carburising, nitriding, vacuum, atmosphere and induction processes. We recruit metallurgists, process engineers, furnace managers and quality professionals across commercial heat treaters and captive in-house facilities.",
    svg: `<rect x="110" y="70" width="160" height="100" fill="#2A3038"/><rect x="128" y="90" width="124" height="60" fill="#8F5A28"/><rect x="168" y="108" width="44" height="24" fill="#D4A574"/><path d="M140 52 q6 -10 12 0 q6 10 12 0 M176 48 q6 -10 12 0 q6 10 12 0 M212 52 q6 -10 12 0 q6 10 12 0" stroke="#B87333" stroke-width="1.5"/><text x="110" y="42" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">FURNACE</text>`,
  },
  {
    id: "thermal-spray",
    n: "05",
    eyebrow: "05 · Thermal spray and hardfacing",
    title: "Thermal spray",
    airtable: "Thermal spray",
    body: "HVOF, plasma, arc and flame spray. Wear, corrosion and dimensional restoration for aerospace, energy, oil and gas. We recruit coating engineers, operators, development chemists and commercial leaders across specialist sprayers.",
    svg: `<rect x="70" y="150" width="240" height="24" fill="#1C2229"/><path d="M100 150 L190 70 L280 150" stroke="#B87333" stroke-width="2" fill="none"/><path d="M120 150 L190 90 L260 150" stroke="#D4A574" stroke-width="1.5" fill="none" opacity=".7"/><circle cx="190" cy="70" r="6" fill="#B87333"/><text x="70" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">SPRAY PATH</text>`,
  },
  {
    id: "pvd-cvd",
    n: "06",
    eyebrow: "06 · PVD, CVD and advanced surface technologies",
    title: "PVD, CVD and advanced deposition",
    airtable: "PVD / CVD",
    body: "Thin-film deposition, DLC, tool coatings and next-generation surface engineering. We recruit R&D scientists, process engineers, coating chamber specialists and commercial leaders across vacuum and plasma-based surface technology businesses.",
    svg: `<ellipse cx="190" cy="120" rx="110" ry="55" fill="none" stroke="#5A6570" stroke-width="1.5"/><ellipse cx="190" cy="120" rx="70" ry="34" fill="none" stroke="#B87333"/><circle cx="190" cy="120" r="10" fill="#D4A574"/><text x="80" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">VACUUM CHAMBER</text>`,
  },
  {
    id: "electroless",
    n: "07",
    eyebrow: "07 · Electroless plating and autocatalytic processes",
    title: "Electroless plating",
    airtable: "Electroplating",
    body: "Electroless nickel (EN), electroless copper and autocatalytic deposition for uniform thickness on complex geometries. Used heavily in oil and gas, electronics, automotive and precision engineering. We recruit process chemists, line technicians, quality leads and operations managers across specialist EN platers and contract finishers.",
    svg: `<path d="M90 80 H160 V160 H90 Z M160 100 H250 V180 H160 Z" fill="none" stroke="#5A6570" stroke-width="1.5"/><path d="M95 85 H155 V155 H95 Z M165 105 H245 V175 H165 Z" fill="#8F5A28" opacity=".55"/><text x="90" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">UNIFORM BUILD</text>`,
  },
  {
    id: "galvanising",
    n: "08",
    eyebrow: "08 · Galvanising and hot-dip processes",
    title: "Galvanising",
    airtable: "Electroplating",
    body: "Hot-dip galvanising, spin galvanising and zinc flake coatings for structural steel, fasteners and fabrications. We recruit plant operators, production managers, quality engineers and commercial leaders across general galvanisers and specialist fastener coaters.",
    svg: `<rect x="70" y="110" width="240" height="70" fill="#3A4550"/><rect x="100" y="70" width="40" height="40" fill="#C0C5C9"/><rect x="170" y="60" width="40" height="50" fill="#A8ADB3"/><rect x="240" y="75" width="40" height="35" fill="#C0C5C9"/><path d="M70 110 H310" stroke="#B87333" stroke-width="2"/><text x="70" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">HOT-DIP BATH</text>`,
  },
  {
    id: "metal-polishing",
    n: "09",
    eyebrow: "09 · Metal polishing, finishing and deburring",
    title: "Metal polishing and finishing",
    airtable: "Powder coating",
    body: "Mechanical polishing, vibratory finishing, barrel tumbling, electropolishing and deburring. Used across medical devices, food processing, architectural metalwork and precision components. We recruit skilled polishers, finishing supervisors, production managers and technical leads.",
    svg: `<ellipse cx="190" cy="120" rx="90" ry="50" fill="#2A3038" stroke="#5A6570"/><path d="M120 120 Q190 70 260 120 Q190 150 120 120" fill="#D4A574" opacity=".35"/><path d="M140 100 Q190 80 240 100" stroke="#B87333" stroke-width="1.5" fill="none"/><text x="100" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">FINISH PASS</text>`,
  },
  {
    id: "cleaning",
    n: "10",
    eyebrow: "10 · Industrial cleaning and pre-treatment",
    title: "Industrial cleaning and pre-treatment",
    airtable: "Electroplating",
    body: "Aqueous cleaning, ultrasonic cleaning, vapour degreasing, pickling and chemical pre-treatment lines. The upstream processes that sit in front of every coating and plating operation. We recruit process engineers, line supervisors, EHS specialists and plant managers.",
    svg: `<rect x="80" y="80" width="220" height="90" fill="#3A4550"/><path d="M100 100 H140 M155 120 H200 M120 140 H250" stroke="#C0C5C9" stroke-width="2" stroke-linecap="round"/><path d="M110 180 C150 200 230 200 270 180" stroke="#B87333" stroke-width="1.5" fill="none"/><text x="80" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">PRE-TREAT LINE</text>`,
  },
  {
    id: "shot-peening",
    n: "11",
    eyebrow: "11 · Blasting, shot peening and surface preparation",
    title: "Blasting and shot peening",
    airtable: "Thermal spray",
    body: "Shot, grit and bead blasting, automated shot peening and controlled surface profiling for fatigue life improvement. Aerospace, automotive and energy applications. We recruit operators, Almen technicians, process engineers and quality professionals.",
    svg: `<rect x="40" y="100" width="40" height="24" fill="#8F5A28"/><path d="M80 100 L130 112 L80 124 Z" fill="#B87333"/><g fill="#D4A574"><circle cx="145" cy="104" r="2.2"/><circle cx="158" cy="116" r="2"/><circle cx="170" cy="108" r="2.2"/><circle cx="166" cy="124" r="1.8"/><circle cx="182" cy="114" r="2"/></g><rect x="210" y="70" width="110" height="90" fill="#3A4550"/><rect x="210" y="70" width="34" height="90" fill="#C0C5C9"/><text x="40" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">BLAST MEDIA</text>`,
  },
  {
    id: "pcb-etching",
    n: "12",
    eyebrow: "12 · PCB finishing, etching and electronics plating",
    title: "PCB and electronics finishing",
    airtable: "Electroplating",
    body: "Copper plating, ENIG, HASL, immersion tin and gold for printed circuit boards. Chemical etching and photochemical machining for precision metal parts. We recruit process engineers, chemists, production managers and quality leads across PCB manufacturers and contract etchers.",
    svg: `<rect x="70" y="70" width="240" height="120" fill="#1C2229" stroke="#5A6570"/><path d="M90 95 H140 V145 H90 Z M160 85 H210 V130 H160 Z M230 100 H290 V150 H230 Z" stroke="#B87333" stroke-width="1.5" fill="none"/><circle cx="115" cy="120" r="4" fill="#D4A574"/><circle cx="185" cy="108" r="4" fill="#D4A574"/><circle cx="260" cy="125" r="4" fill="#D4A574"/><text x="70" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">TRACE / PAD</text>`,
  },
  {
    id: "weld-overlay",
    n: "13",
    eyebrow: "13 · Weld overlay, cladding and laser surface treatment",
    title: "Weld overlay and surface cladding",
    airtable: "Thermal spray",
    body: "MIG, TIG and submerged arc weld overlay. Laser cladding, laser hardening and directed energy deposition for wear and corrosion protection. We recruit welding engineers, laser process specialists, metallurgists and project managers across energy, nuclear and heavy industry contractors.",
    svg: `<rect x="70" y="140" width="240" height="30" fill="#2A3038"/><path d="M90 140 Q130 80 170 140 Q210 80 250 140 Q290 95 310 140" stroke="#B87333" stroke-width="3" fill="none"/><path d="M190 60 V100" stroke="#D4A574" stroke-width="2"/><circle cx="190" cy="56" r="5" fill="#D4A574"/><text x="70" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">OVERLAY BEAD</text>`,
  },
  {
    id: "plating-on-plastics",
    n: "14",
    eyebrow: "14 · Plating on plastics and composite finishing",
    title: "Plating on plastics",
    airtable: "Electroplating",
    body: "Decorative and functional plating on ABS, PC/ABS and composite substrates for automotive, consumer electronics and bathroom fittings. We recruit process engineers, chemists, tooling specialists and production managers across PoP specialists and automotive Tier 1 finishers.",
    svg: `<rect x="100" y="70" width="180" height="110" rx="18" fill="#3A4550"/><rect x="112" y="82" width="156" height="86" rx="12" fill="#B87333" opacity=".85"/><rect x="130" y="100" width="120" height="50" rx="8" fill="#1C2229"/><text x="100" y="48" fill="#B87333" font-size="12" font-family="IBM Plex Mono, monospace">SUBSTRATE → METAL</text>`,
  },
];

function setDiscipline(id) {
  const d = DISCIPLINES.find((x) => x.id === id) || DISCIPLINES[0];
  document.querySelectorAll("[data-atlas-link]").forEach((a) => {
    a.classList.toggle("is-on", a.getAttribute("href") === `#${d.id}`);
  });

  const eyebrow = document.querySelector("[data-atlas-eyebrow]");
  const title = document.querySelector("[data-atlas-title]");
  const body = document.querySelector("[data-atlas-body]");
  const viz = document.querySelector("[data-atlas-svg]");
  const jobs = document.querySelector("[data-atlas-jobs]");
  const hire = document.querySelector("[data-atlas-hire]");

  if (eyebrow) eyebrow.textContent = d.eyebrow;
  if (title) title.textContent = d.title;
  if (body) body.textContent = d.body;
  if (viz) {
    viz.innerHTML = d.svg;
  }
  if (jobs) {
    jobs.href = `jobs.html?discipline=${encodeURIComponent(d.airtable)}`;
  }
  if (hire) {
    hire.href = `contact.html?type=hiring&role=${encodeURIComponent(d.title)}`;
  }

  if (location.hash !== `#${d.id}`) {
    history.replaceState(null, "", `#${d.id}`);
  }
}

function initAtlas() {
  const links = [...document.querySelectorAll("[data-atlas-link]")];
  if (!links.length) return;

  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = a.getAttribute("href").slice(1);
      setDiscipline(id);
      document.querySelector("[data-atlas-detail]")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  const fromHash = location.hash.replace("#", "");
  setDiscipline(fromHash && DISCIPLINES.some((d) => d.id === fromHash) ? fromHash : DISCIPLINES[0].id);

  window.addEventListener("hashchange", () => {
    const id = location.hash.replace("#", "");
    if (DISCIPLINES.some((d) => d.id === id)) setDiscipline(id);
  });
}

initAtlas();
