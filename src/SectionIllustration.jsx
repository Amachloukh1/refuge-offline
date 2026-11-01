import "./section-illustrations.css";

// Decorative context only: the accompanying text carries the instructions.
export default function SectionIllustration({ image, children, className = "" }) {
  return (
    <div className={`section-illustration ${children ? "with-content" : ""} ${className}`}>
      {children && <div className="section-illustration-content">{children}</div>}
      <img src={image} alt="" width="960" height="480" decoding="async" />
    </div>
  );
}

export function guideIllustration(guide) {
  if (guide.image) return guide.image;
  const images = {
    power: "powerbank", water: "page-readiness", pantry: "food",
    family: "documents", health: "pharmacy-header", radio: "alarms",
    "food-without-stock": "food", "water-in-nature": "page-readiness",
    "hygiene-toilets": "hygiene", cash: "documents", documents: "documents",
    "cooking-without-power": "food", "evacuation-plan": "navigation",
    "people-pets": "warmth",
  };
  const fallback = { water: "page-readiness", food: "food", health: "firstaid", equipment: "tools" };
  return `/illustrations/${images[guide.id] || fallback[guide.category] || "documents"}.webp`;
}

export function hazardIllustration(id) {
  const images = {
    tsunami: "navigation", heat: "page-readiness", cold: "warmth",
    flood: "page-readiness", earthquake: "tools", storm: "warmth",
    homefire: "alarms", wildfire: "navigation", blackout: "powerbank",
    chemical: "medicine-gloves", radiation: "documents",
  };
  return `/illustrations/${images[id] || "page-hazards"}.webp`;
}
