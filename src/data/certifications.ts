// Certification body logos, keyed by the exact `certificationBody` string
// used in src/content/training-categories/*.md, so hero sections can show
// the real logo instead of a plain text label. `width`/`height` are the
// files' real intrinsic pixel dimensions -- every render site sets these
// as HTML attributes (alongside a Tailwind height class that does the
// actual visual sizing) purely so the browser can reserve the right
// aspect-ratio box before the image loads, instead of shifting the layout
// once it does.
export const certificationLogos: Record<string, { src: string; alt: string; width: number; height: number }> = {
  ICAgile: { src: "/certifications/icagile.png", alt: "ICAgile", width: 860, height: 450 },
  "Flight Levels Academy": {
    src: "/certifications/flight-levels-academy.png",
    alt: "Flight Levels Academy",
    width: 648,
    height: 311,
  },
  "Kanban University": {
    src: "/certifications/kanban-university.png",
    alt: "Kanban University",
    width: 350,
    height: 325,
  },
  "Scrum Alliance": { src: "/certifications/scrum-alliance.png", alt: "Scrum Alliance", width: 1536, height: 541 },
  "Scaled Agile": { src: "/certifications/scaled-agile.svg", alt: "Scaled Agile (SAFe)", width: 446, height: 142 },
};
