// Certification body logos, keyed by the exact `certificationBody` string
// used in src/content/training-categories/*.md, so hero sections can show
// the real logo instead of a plain text label.
export const certificationLogos: Record<string, { src: string; alt: string }> = {
  ICAgile: { src: "/certifications/icagile.png", alt: "ICAgile" },
  "Flight Levels Academy": { src: "/certifications/flight-levels-academy.png", alt: "Flight Levels Academy" },
  "Kanban University": { src: "/certifications/kanban-university.png", alt: "Kanban University" },
  "Scrum Alliance": { src: "/certifications/scrum-alliance.png", alt: "Scrum Alliance" },
  "Scaled Agile": { src: "/certifications/scaled-agile.svg", alt: "Scaled Agile (SAFe)" },
};
