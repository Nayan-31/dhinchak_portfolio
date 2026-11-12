import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./BubbleMenu.css";

const DEFAULT_ITEMS = [
  { label: "home", href: "#home", ariaLabel: "Home", rotation: -8 },
  { label: "about", href: "#about", ariaLabel: "About", rotation: 8 },
  { label: "projects", href: "#projects", ariaLabel: "Projects", rotation: 8 },
  { label: "blog", href: "#blog", ariaLabel: "Blog", rotation: 8 },
  { label: "contact", href: "#contact", ariaLabel: "Contact", rotation: -8 },
];

export default function BubbleMenu({
  items = DEFAULT_ITEMS,
  menuAriaLabel = "Toggle navigation",
  menuBg = "#ffffff",
  menuContentColor = "#111111",
  itemBg = "#344858",
  itemContentColor = "#edf8ff",
  itemHoverBg = "#17658b",
  animationEase = "power3.out",
  animationDuration = 0.62,
  staggerDelay = 0.055,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const toggleRef = useRef(null);
  const overlayRef = useRef(null);
  const bubblesRef = useRef([]);
  const labelRefs = useRef([]);
  const animationRef = useRef(null);
  const pendingNavigationRef = useRef(null);

  const toggleMenu = (nextState = !isMenuOpen) => {
    if (nextState) {
      pendingNavigationRef.current = null;
      setShowOverlay(true);
    }
    setIsMenuOpen(nextState);
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (!overlay || !bubbles.length) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const duration = reduceMotion ? 0.16 : animationDuration;
    const stagger = reduceMotion ? 0 : staggerDelay;

    gsap.set(overlay, { display: "flex", autoAlpha: 0 });
    gsap.set(bubbles, {
      autoAlpha: 0,
      scale: reduceMotion ? 1 : 0.94,
      y: reduceMotion ? 0 : 22,
      transformOrigin: "50% 50%",
    });
    gsap.set(labels, { autoAlpha: 0, y: reduceMotion ? 0 : 10 });

    const timeline = gsap.timeline({
      paused: true,
      onReverseComplete: () => {
        setShowOverlay(false);
        pendingNavigationRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        pendingNavigationRef.current = null;
      },
    });
    timeline.to(overlay, {
      autoAlpha: 1,
      duration: reduceMotion ? 0.1 : 0.32,
      ease: "power2.out",
    });
    timeline.to(
      bubbles,
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration,
        stagger,
        ease: animationEase,
      },
      reduceMotion ? 0 : 0.06
    );
    timeline.to(
      labels,
      {
        autoAlpha: 1,
        y: 0,
        duration: reduceMotion ? 0.1 : 0.34,
        stagger,
        ease: "power2.out",
      },
      reduceMotion ? 0 : 0.14
    );

    animationRef.current = timeline;

    return () => {
      timeline.kill();
      if (animationRef.current === timeline) animationRef.current = null;
    };
  }, [showOverlay, animationEase, animationDuration, staggerDelay]);

  useEffect(() => {
    const timeline = animationRef.current;
    if (!showOverlay || !timeline) return;

    if (isMenuOpen) timeline.play();
    else timeline.reverse();
  }, [isMenuOpen, showOverlay]);

  useEffect(() => {
    if (!showOverlay) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showOverlay]);

  const handleItemClick = (event, item) => {
    setIsMenuOpen(false);
    toggleRef.current?.focus();
    const target = document.querySelector(item.href);
    if (target) {
      event.preventDefault();
      pendingNavigationRef.current = target;
    }
  };

  return (
    <>
      <nav className="bubble-menu" aria-label="Main navigation">
        <button
          ref={toggleRef}
          type="button"
          className={`bubble toggle-bubble menu-btn ${isMenuOpen ? "open" : ""}`}
          onClick={() => toggleMenu()}
          aria-label={menuAriaLabel}
          aria-expanded={isMenuOpen}
          aria-controls="bubble-menu-links"
          style={{ background: menuBg }}
        >
          <span className="menu-line" style={{ background: menuContentColor }} />
          <span className="menu-line short" style={{ background: menuContentColor }} />
        </button>
      </nav>

      {showOverlay && (
        <div
          id="bubble-menu-links"
          ref={overlayRef}
          className="bubble-menu-items"
          aria-hidden={!isMenuOpen}
          inert={!isMenuOpen}
          onClick={(event) => {
            if (event.target === event.currentTarget) toggleMenu(false);
          }}
        >
          <ul className="pill-list" role="menu" aria-label="Portfolio sections">
            {items.map((item, index) => (
              <li key={item.label} role="none" className="pill-col">
                <a
                  role="menuitem"
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  className="pill-link"
                  onClick={(event) => handleItemClick(event, item)}
                  style={{
                    "--item-rot": `${item.rotation ?? 0}deg`,
                    "--pill-bg": itemBg,
                    "--pill-color": itemContentColor,
                    "--hover-bg": item.hoverStyles?.bgColor || itemHoverBg,
                    "--hover-color": item.hoverStyles?.textColor || "#ffffff",
                  }}
                  ref={(element) => {
                    bubblesRef.current[index] = element;
                  }}
                >
                  <span
                    className="pill-label"
                    ref={(element) => {
                      labelRefs.current[index] = element;
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
