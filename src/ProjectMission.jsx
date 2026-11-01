import { useId } from "react";
import { Icon, External } from "./components";
import { projectMissionText } from "./project-mission-text";
import "./project-mission.css";

export function ProjectMission({ lang = "en" }) {
  const text = projectMissionText[lang] || projectMissionText.en;
  const headingId = useId();
  return (
    <section
      className="project-mission"
      data-testid="project-mission"
      aria-labelledby={headingId}
    >
      <header className="project-mission-heading">
        <span className="project-mission-eyebrow">
          <Icon name="Leaf" size={18} />
          {text.eyebrow}
        </span>
        <h2 id={headingId}>{text.title}</h2>
        <p>{text.intro}</p>
      </header>
      <ul className="project-mission-badges">
        {text.badges.map((badge, i) => (
          <li key={badge}>
            <Icon name={["HeartPulse", "CloudOff", "Users"][i]} size={17} />
            {badge}
          </li>
        ))}
      </ul>
      <div className="project-mission-benefits">
        {text.benefits.map(([title, description], i) => (
          <article key={title}>
            <span className="project-mission-icon">
              <Icon name={["BookOpen", "RefreshCw", "Sun"][i]} size={25} />
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <details className="project-mission-prepare">
        <summary>
          {text.prepare}
          <Icon name="Plus" size={19} />
        </summary>
        <ol>
          {text.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>
      <footer className="project-mission-footer">
        <p>{text.limits}</p>
        <div className="project-mission-source">
          <External href="https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/vorsorge_node.html">
            {text.source}
          </External>
          <small>{text.network}</small>
        </div>
      </footer>
    </section>
  );
}
