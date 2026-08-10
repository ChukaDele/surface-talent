/* Surface Talent — canonical discipline / function taxonomy
   Website atlas, Jobs filters, candidate registration and Airtable
   Discipline field should map through these names.
   ─────────────────────────────────────────────────────────── */

/** Broader Airtable / Jobs filter categories */
export const JOB_DISCIPLINES = [
  "Electroplating",
  "Anodising",
  "Powder coating",
  "Heat treatment",
  "Thermal spray",
  "PVD / CVD",
];

/** Full atlas (Disciplines page) with Airtable mapping */
export const DISCIPLINES = [
  { id: "electroplating", label: "Electroplating", airtable: "Electroplating" },
  { id: "anodising", label: "Anodising and conversion coatings", airtable: "Anodising" },
  { id: "powder-coating", label: "Powder coating and industrial coatings", airtable: "Powder coating" },
  { id: "heat-treatment", label: "Heat treatment", airtable: "Heat treatment" },
  { id: "thermal-spray", label: "Thermal spray", airtable: "Thermal spray" },
  { id: "pvd-cvd", label: "PVD, CVD and advanced deposition", airtable: "PVD / CVD" },
  { id: "electroless", label: "Electroless plating", airtable: "Electroplating" },
  { id: "galvanising", label: "Galvanising", airtable: "Electroplating" },
  { id: "polishing", label: "Metal polishing and finishing", airtable: "Powder coating" },
  { id: "pre-treatment", label: "Industrial cleaning and pre-treatment", airtable: "Electroplating" },
  { id: "blasting", label: "Blasting and shot peening", airtable: "Thermal spray" },
  { id: "pcb", label: "PCB and electronics finishing", airtable: "Electroplating" },
  { id: "cladding", label: "Weld overlay and surface cladding", airtable: "Thermal spray" },
  { id: "plastics", label: "Plating on plastics", airtable: "Electroplating" },
];

/** Candidate registration interest areas (process + function) */
export const CANDIDATE_INTERESTS = [
  ...JOB_DISCIPLINES,
  "Blasting / pre-treatment",
  "Maintenance / controls",
  "Quality / compliance",
  "Commercial / sales",
  "Leadership / director",
  "Other",
];

export const FUNCTIONS = [
  "Leadership / directors",
  "Operations / production",
  "Process / technical",
  "Maintenance / controls",
  "Quality / compliance",
  "Commercial / growth",
];

export const SENIORITY = [
  "Technician / operator",
  "Engineer",
  "Manager",
  "Head of / director",
  "MD / GM",
];

/** Exact Google booking URL — do not alter */
export const BOOKING_URL = "https://calendar.app.google/Wdm9xHVcBNwS2VuS7";

/** Unified customer response SLA */
export const RESPONSE_SLA = "24 hours";
