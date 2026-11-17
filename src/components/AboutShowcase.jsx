import { useState } from "react";
import { capabilities, craftTools, profile, proofProjects } from "../data/aboutShowcase";
import "./AboutShowcase.css";

const projectFor = (id) => proofProjects.find((project) => project.id === id);

export default function AboutShowcase() {
  const [openCapability, setOpenCapability] = useState(null);

  return (
    <div className="about-showcase" role="region" aria-label="About and capabilities">
      <section className="about-profile" aria-labelledby="about-profile-title">
        <div className="about-profile__copy">
          <div className="about-showcase__eyebrow">A LITTLE ABOUT ME</div>
          <h2 id="about-profile-title">
            Designing with intent.
            <span> Building with curiosity.</span>
          </h2>
          <p className="about-profile__intro">{profile.introduction}</p>
          <div className="about-profile__identity">
            <span className="about-profile__name">{profile.name}</span>
            <span className="about-profile__role">{profile.role}</span>
          </div>
          <ul className="about-profile__focus" aria-label="Areas of focus">
            {profile.focus.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <figure className="about-profile__portrait">
          <img src={profile.portrait} alt={profile.portraitAlt} />
          <figcaption>
            <span>THE PERSON BEHIND THE PIXELS</span>
            <span aria-hidden="true">↗</span>
          </figcaption>
        </figure>
      </section>

      <section className="about-showcase__section" aria-labelledby="what-i-do-title">
        <div className="about-showcase__eyebrow">01 / CAPABILITIES</div>
        <div className="about-showcase__section-heading">
          <h2 id="what-i-do-title">What I Do</h2>
          <p>Ideas shaped into thoughtful digital experiences.</p>
        </div>

        <div className="capability-list">
          {capabilities.map((capability) => {
            const project = projectFor(capability.projectId);
            const isOpen = openCapability === capability.number;
            const panelId = `capability-panel-${capability.number}`;

            return (
              <article
                className={`capability${isOpen ? " is-open" : ""}`}
                key={capability.number}
                onMouseEnter={() => setOpenCapability(capability.number)}
                onMouseLeave={() => setOpenCapability(null)}
              >
                <button
                  className="capability__trigger"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onFocus={() => setOpenCapability(capability.number)}
                  onClick={() => {
                    const hoverAvailable = window.matchMedia("(hover: hover)").matches;
                    setOpenCapability((current) => {
                      if (hoverAvailable) return capability.number;
                      return current === capability.number ? null : capability.number;
                    });
                  }}
                >
                  <span className="capability__number">{capability.number}</span>
                  <span className="capability__title">{capability.title}</span>
                  <span className="capability__icon" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <div
                  className="capability__details"
                  id={panelId}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                >
                  <p>{capability.description}</p>
                  <div className="capability__meta">
                    <div>
                      <span className="about-showcase__meta-label">TOOLS</span>
                      <ul className="capability__tags">
                        {capability.technologies.map((technology) => (
                          <li key={technology}>{technology}</li>
                        ))}
                      </ul>
                    </div>
                    {project && (
                      <div className="capability__project">
                        <span className="about-showcase__meta-label">
                          {project.placeholder ? "PROJECT TO ADD" : "RELATED WORK"}
                        </span>
                        <span>{project.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="about-showcase__section" aria-labelledby="tools-title">
        <div className="about-showcase__eyebrow">02 / THE TOOLKIT</div>
        <div className="about-showcase__section-heading">
          <h2 id="tools-title">Tools of My Craft</h2>
          <p>A working set for designing and building on the web.</p>
        </div>
        <ul className="craft-tools" aria-label="Technologies">
          {craftTools.map((tool, index) => (
            <li className="craft-tool" key={tool}>
              <span className="craft-tool__index">0{index + 1}</span>
              <span>{tool}</span>
              <span className="craft-tool__arrow" aria-hidden="true">↗</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-showcase__section about-showcase__proof" aria-labelledby="proof-title">
        <div className="about-showcase__eyebrow">03 / SELECTED WORK</div>
        <div className="about-showcase__section-heading">
          <h2 id="proof-title">Proof of Skills</h2>
          <p>Capabilities connected to work and clearly marked project placeholders.</p>
        </div>
        <div className="proof-list">
          {proofProjects.map((project, index) => (
            <article
              className={`proof-project${project.placeholder ? " is-placeholder" : ""}`}
              key={project.id}
            >
              <div className="proof-project__index">0{index + 1}</div>
              <div className="proof-project__body">
                <span className="about-showcase__meta-label">{project.status}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.technologies.length > 0 && (
                  <ul className="capability__tags" aria-label="Technologies used">
                    {project.technologies.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>
                )}
              </div>
              <span className="proof-project__mark" aria-hidden="true">
                {project.placeholder ? "TBD" : "01"}
              </span>
            </article>
          ))}
        </div>
      </section>
      <footer className="about-showcase__footer">END OF ABOUT / KEEP EXPLORING</footer>
    </div>
  );
}
