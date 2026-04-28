export type Project = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: "Concept" | "Series" | "Race" | "Film";
  year: string;
  client: string;
  role: string;
  description: string;
  accent: string;
  palette: string[];
  sketchLabel: string;
  renderLabel: string;
  sketchUrl?: string | null;
  renderUrl?: string | null;
  thumbnailUrl?: string | null;
  wipePosition: number;
  gallery: { ratio: string; label: string; url?: string | null }[];
  credits: [string, string][];
};

export const PROJECTS: Project[] = [
  {
    id: "halcyon-mk-iv",
    code: "01",
    title: "Halcyon Mk·IV",
    subtitle: "Hyper-GT concept, twin-axis vectoring, 2026",
    category: "Concept",
    year: "2026",
    client: "In-house Studio",
    role: "Lead Exterior Designer",
    description:
      "A grand tourer reimagined for the post-combustion era. The Halcyon Mk·IV explores a continuous fuselage volume broken only by negative-pressure intakes, with a low-deck cabin pulled rearward to expose the front axle as a structural element. Sketched over four months, modelled in Alias and Blender, presented as a 1:4 milled clay supported by a full digital design package.",
    accent: "75",
    palette: ["#0a0a0a", "#f0eee8", "#5a5a5a"],
    sketchLabel: "Halcyon Mk·IV / Side Elevation 03",
    wipePosition: 0,
    renderLabel: "Halcyon Mk·IV / Hero Render — Studio 02",
    gallery: [
      { ratio: "16/9", label: "Three-quarter front" },
      { ratio: "4/5", label: "Cabin section" },
      { ratio: "4/5", label: "Wheel architecture" },
      { ratio: "21/9", label: "Side elevation, full bleed" },
      { ratio: "1/1", label: "Detail — air gate" },
      { ratio: "1/1", label: "Detail — light blade" },
    ],
    credits: [
      ["Creative Direction", "K. Khalil"],
      ["Exterior Design", "K. Khalil"],
      ["Surface Modelling", "M. Carrera, S. Otis"],
      ["Interior Concept", "L. Vasquez"],
      ["Clay Supervision", "P. Bohrmann"],
      ["Photography", "Studio Mire"],
    ],
  },
  {
    id: "veritas-r1",
    code: "02",
    title: "Veritas R1",
    subtitle: "LMP-class endurance prototype, 2025",
    category: "Race",
    year: "2025",
    client: "Veritas Motorsport",
    role: "Senior Exterior / Aero Liaison",
    description:
      "A privateer LMP entry developed in eleven months from clean sheet. Worked alongside aerodynamics to negotiate every visual surface against CFD targets — the floor, the louvres, the rear-deck transition. The result is a car whose form feels inevitable: nothing decorative, every line earning its keep on a stopwatch.",
    accent: "30",
    palette: ["#0a0a0a", "#d92020", "#f0eee8"],
    sketchLabel: "Veritas R1 / Aero Study 12",
    wipePosition: 0,
    renderLabel: "Veritas R1 / Pit Lane — Sebring",
    gallery: [
      { ratio: "21/9", label: "Pit straight, dawn" },
      { ratio: "4/5", label: "Front splitter" },
      { ratio: "4/5", label: "Air-jack detail" },
      { ratio: "16/9", label: "Rear deck" },
    ],
    credits: [
      ["Creative Direction", "K. Khalil"],
      ["Aerodynamics", "T. Halberg, R. Iyer"],
      ["Composite Engineering", "Veritas Motorsport"],
      ["Livery", "K. Khalil w/ Studio Mire"],
    ],
  },
  {
    id: "atelier-nimbus",
    code: "03",
    title: "Atelier Nimbus",
    subtitle: "Production crossover, segment-C, 2024",
    category: "Series",
    year: "2024",
    client: "Confidential OEM",
    role: "Exterior Designer",
    description:
      "A volume crossover whose brief was, frankly, hostile to elegance. The work was finding rhythm in constraint — a single character line that does the work of three, a DLO held high enough to read as planted, lighting signatures that survive cost-down without losing their identity. Drawing for production is sculpture under handcuffs; this car is the proof we made them count.",
    accent: "230",
    palette: ["#0a0a0a", "#3b6fa3", "#f0eee8"],
    sketchLabel: "Nimbus / Package Tape Drawing",
    wipePosition: 0,
    renderLabel: "Nimbus / Press Photography Pose",
    gallery: [
      { ratio: "16/9", label: "Three-quarter front" },
      { ratio: "16/9", label: "Three-quarter rear" },
      { ratio: "4/5", label: "Lamp module" },
      { ratio: "4/5", label: "Wheel option B" },
    ],
    credits: [
      ["Creative Direction", "Studio (NDA)"],
      ["Exterior Design", "K. Khalil"],
      ["Colour & Trim", "A. Mori"],
    ],
  },
  {
    id: "vector-protocol",
    code: "04",
    title: "Vector Protocol",
    subtitle: "Vehicle hero — feature film, 2025",
    category: "Film",
    year: "2025",
    client: "Three-Sigma Pictures",
    role: "Vehicle Designer",
    description:
      "Hero vehicle for an unannounced sci-fi feature. Designed under a strict silhouette brief from production design, with three escalating builds — sketch lock, CG model for previs, and a full-scale buck for principal photography. The car had to read as a single beat in three frames; we built it so it does.",
    accent: "190",
    palette: ["#0a0a0a", "#1a8c8c", "#f0eee8"],
    sketchLabel: "Vector / Silhouette Lock",
    wipePosition: 0,
    renderLabel: "Vector / Beauty Pass — Stage 11",
    gallery: [
      { ratio: "21/9", label: "Hero pose, plate" },
      { ratio: "4/5", label: "Cockpit graphics" },
      { ratio: "4/5", label: "Drive unit" },
      { ratio: "16/9", label: "Buck reference" },
    ],
    credits: [
      ["Production Designer", "C. Vellinga"],
      ["Vehicle Designer", "K. Khalil"],
      ["VFX Reference", "Atomic Orange"],
      ["Practical Build", "Hyperion Fabrication"],
    ],
  },
  {
    id: "kestrel-roadster",
    code: "05",
    title: "Kestrel Roadster",
    subtitle: "Limited series open-top, 2024",
    category: "Concept",
    year: "2024",
    client: "Private Commission",
    role: "Designer / Sculptor",
    description:
      "Twelve cars, no roof, no compromise. The Kestrel is a design exercise about what an open-top car can be when freed from a folding mechanism — the deck behind the cabin becomes a continuous form, the windscreen a single carved blade, the door cuts an editorial choice rather than an engineering one.",
    accent: "60",
    palette: ["#0a0a0a", "#c9b46a", "#f0eee8"],
    sketchLabel: "Kestrel / Quarter Sketch 04",
    wipePosition: 0,
    renderLabel: "Kestrel / Hero, Coastal Plate",
    gallery: [
      { ratio: "16/9", label: "Coastal hero" },
      { ratio: "4/5", label: "Windscreen blade" },
      { ratio: "21/9", label: "Side elevation" },
    ],
    credits: [
      ["Design", "K. Khalil"],
      ["Engineering Liaison", "S. Otis"],
      ["Coachbuild", "Private Atelier"],
    ],
  },
  {
    id: "circuit-iso",
    code: "06",
    title: "Circuit ISO",
    subtitle: "Single-seater spec series, 2023",
    category: "Race",
    year: "2023",
    client: "Iso Racing League",
    role: "Series Designer",
    description:
      "A spec chassis designed to be photogenic at any angle — series organisers demanded a car that broadcast well. Sidepods are sculpted to register on a single overhead camera; the rollhoop is a graphic element first, structure second; the livery system tolerates twenty-four sponsor permutations without ever feeling crowded.",
    accent: "15",
    palette: ["#0a0a0a", "#e25822", "#f0eee8"],
    sketchLabel: "ISO / Camera-Angle Study",
    wipePosition: 0,
    renderLabel: "ISO / Grid Pose — Round 04",
    gallery: [
      { ratio: "16/9", label: "Grid pose" },
      { ratio: "4/5", label: "Sidepod" },
      { ratio: "4/5", label: "Cockpit" },
      { ratio: "21/9", label: "Pack shot" },
    ],
    credits: [
      ["Series Designer", "K. Khalil"],
      ["Chassis Engineering", "Iso Engineering"],
      ["Livery System", "K. Khalil w/ Field Office"],
    ],
  },
];

export const TIMELINE: [string, string, string][] = [
  ["2026", "Lead Exterior Designer", "Independent — Halcyon Studio"],
  ["2024 – 2025", "Senior Exterior Designer", "Veritas Motorsport"],
  ["2022 – 2024", "Exterior Designer", "OEM — Studio EU (NDA)"],
  ["2021 – 2022", "Vehicle Designer (Film)", "Three-Sigma Pictures"],
  ["2019 – 2021", "Junior Designer", "Atelier Carrosserie Nord"],
  ["2015 – 2019", "MA Vehicle Design", "RCA, London"],
  ["2013 – 2015", "BA Industrial Design", "ENSCI, Paris"],
];

export const BIO: string[] = [
  "Khalil is an automotive designer working between concept, production and screen. His practice is built on the conviction that a car is, before anything else, a single sculptural argument — a thesis the eye reads in one glance and the body completes when it sits inside.",
  "Trained at ENSCI Paris and the Royal College of Art, he has worked across in-house OEM studios, motorsport teams and film production design. His drawings have been exhibited at the Mondial de l'Auto and the Petersen; his cars have raced at Sebring and starred in unannounced features.",
  "He lives between Paris and Turin and is currently accepting commissions from studios, OEMs, film production designers and private collectors.",
];
