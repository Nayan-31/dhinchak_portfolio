
import { useEffect, useRef, useState } from "react";
import Scene from "./three/Scene";
import BubbleMenu from "./components/BubbleMenu";
import FlowingMenu from "./components/FlowingMenu";
import "./App.css";

const clamp = (v) => Math.min(1, Math.max(0, v));

const smoothstep = (value, start, end) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

const navigationItems = [
  {
    label: "home",
    href: "#home",
    ariaLabel: "Home",
    rotation: -8,
    hoverStyles: { bgColor: "#3b82f6", textColor: "#ffffff" },
  },
  {
    label: "about",
    href: "#about",
    ariaLabel: "About",
    rotation: 8,
    hoverStyles: { bgColor: "#10b981", textColor: "#ffffff" },
  },
  {
    label: "projects",
    href: "#projects",
    ariaLabel: "Projects",
    rotation: 8,
    hoverStyles: { bgColor: "#f59e0b", textColor: "#ffffff" },
  },
  {
    label: "blog",
    href: "#blog",
    ariaLabel: "Blog",
    rotation: 8,
    hoverStyles: { bgColor: "#ef4444", textColor: "#ffffff" },
  },
  {
    label: "contact",
    href: "#contact",
    ariaLabel: "Contact",
    rotation: -8,
    hoverStyles: { bgColor: "#8b5cf6", textColor: "#ffffff" },
  },
];

export default function App() {
  const introSectionRef = useRef(null);
  const introContentRef = useRef(null);

  const [scroll, setScroll] = useState({
    dive: 0,
    intro: 0,
    introReveal: 0,
    skillsReveal: 0,
    buildup: 0,
    explosion: 0,
  });

  useEffect(() => {
    let frame = null;

    const update = () => {
      const vh = Math.max(window.innerHeight, 1);
      const page = clamp(
        window.scrollY /
          Math.max(document.documentElement.scrollHeight - vh, 1)
      );

      const introSectionRect =
        introSectionRef.current?.getBoundingClientRect();

      const introContentRect =
        introContentRef.current?.getBoundingClientRect();

      // =====================================
      // Full-page progress drives the ocean, dive and final blast.
      // =====================================

      const dive = page;

      // =====================================
      // 04: CREATIVE INTRODUCTION
      // =====================================

      const intro = introSectionRect
        ? clamp((vh - introSectionRect.top) / vh)
        : 0;

      const introReveal = smoothstep(
        intro,
        0.28,
        0.78
      );

      // =====================================
      // 05: SKILLS
      //
      // Skills appear ONLY after the entire
      // introduction content leaves viewport.
      // =====================================

      const introFullyExited =
        introContentRect &&
        introContentRect.bottom <= 0;

      const skillsReveal = introFullyExited
        ? smoothstep(
            -introContentRect.bottom / vh,
            0,
            0.16
          )
        : 0;

      // =====================================
      const buildup = smoothstep(page, 0.66, 0.9);

      const explosion = smoothstep(page, 0.91, 0.99);

      setScroll({
        dive,
        intro,
        introReveal,
        skillsReveal,
        buildup,
        explosion,
      });

      frame = null;
    };

    const onScroll = () => {
      if (frame === null) {
        frame = requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    window.addEventListener("resize", onScroll);

    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  const atmosphere = smoothstep(scroll.dive, 0.02, 0.5);

  const chargeReveal = smoothstep(
    scroll.buildup,
    0.05,
    0.3
  );

  const explosionReveal = smoothstep(
    scroll.explosion,
    0.05,
    0.35
  );

  return (
    <main className="website">
      <BubbleMenu
        items={navigationItems}
        menuAriaLabel="Toggle portfolio navigation"
        menuBg="#ffffff"
        menuContentColor="#101820"
        itemBg="#344858"
        itemContentColor="#edf8ff"
        itemHoverBg="#17658b"
      />

      {/* EXISTING THREE.JS SCENE */}
      <div className="fixed-canvas">
        <Scene
          scrollProgress={scroll.dive}
          buildupProgress={scroll.buildup}
          explosionProgress={scroll.explosion}
        />
      </div>

      {/* EXISTING UNDERWATER ATMOSPHERE */}
      <div
        className="underwater-atmosphere"
        style={{ opacity: atmosphere }}
      />

      <div className="website-content">
        {/* ==================================
            PHASE 01 — HERO
           ================================== */}

        <section id="home" className="page-section hero-section">
          <div
            className="scroll-hint"
            style={{
              opacity: Math.max(
                0,
                1 - scroll.dive * 4
              ),
            }}
          >
            SCROLL TO DIVE ↓
          </div>
        </section>

        {/* ==================================
            PHASE 02–03 — UNDERWATER
           ================================== */}

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

        {/* ==================================
            PHASE 04 — CREATIVE INTRO
           ================================== */}

        <section
          ref={introSectionRef}
          id="about"
          className="page-section next-section"
          aria-label="Creative introduction"
        >
          <div className="intro-sticky">
            <div
              ref={introContentRef}
              className="creative-intro"
              style={{
                opacity: scroll.introReveal,

                transform: `translate3d(
                  0,
                  ${(1 - scroll.introReveal) * 120}px,
                  0
                )`,
              }}
            >
              <div className="intro-eyebrow">
                <span className="intro-line" />
                <span>02 / THE CREATOR</span>
              </div>

              <h2 className="intro-title">
                I turn
                <br />
                <span>ideas</span> into
                <br />
                experiences.
              </h2>

              <p className="intro-description">
                I blend code, creativity and
                interaction to build digital
                experiences that go beyond the ordinary.
              </p>

              <div className="intro-footer">
                <span>CODE</span>
                <span className="intro-dot" />
                <span>DESIGN</span>
                <span className="intro-dot" />
                <span>IMAGINATION</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================
            PHASE 05 — SKILLS
           ================================== */}

        <section
          className="page-section skills-section"
          aria-label="Skills and expertise"
        >
          <div
            className="skills-content"
            style={{
              opacity: scroll.skillsReveal,

              visibility:
                scroll.skillsReveal <= 0
                  ? "hidden"
                  : "visible",

              transform: `translate3d(
                0,
                ${(1 - scroll.skillsReveal) * 24}px,
                0
              )`,
            }}
          >
            <div className="skills-header">
              <span>03 / WHAT I DO</span>

              <h2>
                Built with
                <br />
                <span>curiosity.</span>
              </h2>

              <p>
                Blending development, design and
                technology to make meaningful
                digital experiences.
              </p>
            </div>

            <div className="skills-list">
              <FlowingMenu
                className="flowing-menu--skills"
                ariaLabel="Skills and expertise"
                textColor="#f5fbff"
                marqueeBgColor="rgba(4, 31, 54, 0.94)"
                marqueeTextColor="#d9f3ff"
                speed={18}
                items={[
                  { index: "01", text: "Creative Development", showArrow: true, image: "/images/image1.png", imagePosition: "center 24%" },
                  { index: "02", text: "3D Web Experiences", showArrow: true, image: "/images/image2.png", imagePosition: "center 42%" },
                  { index: "03", text: "Interactive Design", showArrow: true, image: "/images/image3.png", imagePosition: "center 48%" },
                  { index: "04", text: "Motion & Animation", showArrow: true, image: "/images/image4.png", imagePosition: "center 38%" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* ==================================
            PHASE 06 — ENERGY BUILDUP
           ================================== */}

        <section
          className="page-section buildup-section"
          aria-label="Energy buildup"
        >
          <div className="buildup-sticky">
            <div
              className="buildup-content"
              style={{
                opacity: chargeReveal,

                visibility:
                  chargeReveal <= 0
                    ? "hidden"
                    : "visible",

                transform: `translate3d(
                  0,
                  ${(1 - chargeReveal) * 28}px,
                  0
                )`,
              }}
            >
              <span className="buildup-label">
                04 / THE ENERGY
              </span>

              <h2>
                Every idea
                <br />
                starts with
                <br />
                <span>energy.</span>
              </h2>

              <p>
                Something extraordinary is
                about to unfold.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================
            PHASE 07 — EXPLOSION
           ================================== */}

        <section
          className="page-section explosion-section"
          aria-label="Energy explosion"
        >
          <div className="explosion-sticky">
            <div
              className="explosion-copy"
              style={{
                opacity: explosionReveal,

                visibility:
                  explosionReveal <= 0
                    ? "hidden"
                    : "visible",

                transform: `translate3d(
                  0,
                  ${(1 - explosionReveal) * 24}px,
                  0
                )`,
              }}
            >
              <span>05 / TRANSFORMATION</span>

              <h2>Ideas become reality.</h2>

              <p>Every fragment holds a story.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
