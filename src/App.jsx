
import { useEffect, useRef, useState } from "react";
import Scene from "./three/Scene";
import BubbleMenu from "./components/BubbleMenu";
import BlobCursor from "./components/BlobCursor";
import NavigationExperience from "./components/NavigationExperience";
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
  const [activePage, setActivePage] = useState(null);

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

      const introFullyExited = introContentRect && introContentRect.bottom <= 0;
      const skillsReveal = introFullyExited
        ? smoothstep(-introContentRect.bottom / vh, 0, 0.16)
        : 0;

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

  useEffect(() => {
    const restorePageFromHistory = () => {
      const matchingItem = navigationItems.find(
        (item) => item.href === window.location.hash
      );
      const page = matchingItem?.label;
      setActivePage(page && page !== "home" ? page : null);
      if (!page || page === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    window.addEventListener("popstate", restorePageFromHistory);
    return () => window.removeEventListener("popstate", restorePageFromHistory);
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

  const navigateTo = (item) => {
    if (item.label === "home") {
      setActivePage(null);
      window.history.pushState(null, "", item.href);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setActivePage(item.label);
    window.history.pushState(null, "", item.href);
  };

  return (
    <main className="website">
      <BubbleMenu
        items={navigationItems}
        onNavigate={navigateTo}
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
          paused={Boolean(activePage)}
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

      {!activePage && (
        <BlobCursor
          className="home-blob-cursor"
          material="chrome"
          color="#16395d"
          blend="normal"
          size={48}
          morph={0}
          morphSpeed={0.95}
          depth={1}
          trail={16}
          lag={0.55}
          goo={1}
          stretch={0.6}
          wobble={1}
          drip={0}
          shine={1}
          splash
          splashCount={5}
          splashSpeed={0.9}
          splashSize={0.85}
          splashGravity={0.25}
          regrow={0.8}
          shadow={false}
          hideCursor
        />
      )}

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

        {/* WHAT I DO INTRO — the menu list was removed; keep this heading. */}
        <section
          className="page-section skills-section"
          aria-label="What I do"
        >
          <div
            className="skills-content"
            style={{
              opacity: scroll.skillsReveal,
              visibility: scroll.skillsReveal <= 0 ? "hidden" : "visible",
              transform: `translate3d(0, ${(1 - scroll.skillsReveal) * 24}px, 0)`,
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
      {activePage && <NavigationExperience page={activePage} />}
    </main>
  );
}
