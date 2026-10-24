
import { useEffect, useState } from "react";
import Scene from "./three/Scene";
import "./App.css";

export default function App() {
  const [scrollProgress, setScrollProgress] =
    useState(0);

  useEffect(() => {
    const update = () => {
      const progress =
        window.scrollY /
        Math.max(window.innerHeight, 1);

      setScrollProgress(
        Math.min(Math.max(progress, 0), 1)
      );
    };

    window.addEventListener("scroll", update, {
      passive: true,
    });

    update();

    return () =>
      window.removeEventListener("scroll", update);
  }, []);

  const atmosphere = Math.min(
    1,
    Math.max(0, (scrollProgress - 0.38) / 0.48)
  );

  return (
    <main className="website">
      <div className="fixed-canvas">
        <Scene scrollProgress={scrollProgress} />
      </div>

      <div
        className="underwater-atmosphere"
        style={{ opacity: atmosphere }}
      />

      <div className="website-content">
        <section className="page-section hero-section">
          <div
            className="scroll-hint"
            style={{
              opacity: Math.max(
                0, 1 - scrollProgress * 4
              ),
            }}
          >
            SCROLL TO DIVE ↓
          </div>
        </section>

        <section className="page-section underwater-section">
          <div className="section-copy">
            <span>01 / THE EXPERIENCE</span>

            <h1>
              Beyond
              <br />
              the Surface.
            </h1>

            <p>
              Dive deeper into a world of energy,
              creativity and limitless possibilities.
              
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
