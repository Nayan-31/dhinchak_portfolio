import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Topography from "./Topography";
import Balatro from "./Balatro";
import Ballpit from "./Ballpit";
import LiquidChrome from "./LiquidChrome";
import "./FlowingMenu.css";

export default function FlowingMenu({
  items = [],
  speed = 18,
  direction = "left",
  textColor = "#f4faff",
  bgColor = "transparent",
  marqueeBgColor = "rgba(5, 27, 49, 0.84)",
  marqueeTextColor = "#d9f3ff",
  borderColor = "rgba(135, 197, 226, 0.2)",
  dividers = true,
  ariaLabel = "Portfolio sections",
  className = "",
  onItemClick,
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openedItem, setOpenedItem] = useState(null);
  const [openedLayout, setOpenedLayout] = useState(null);
  const navRef = useRef(null);
  const hoverExitTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(hoverExitTimerRef.current), []);

  useEffect(() => {
    if (!openedItem) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpenedItem(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [openedItem]);

  const activate = (index) => {
    window.clearTimeout(hoverExitTimerRef.current);
    setActiveIndex(index);
  };

  const deactivate = () => {
    window.clearTimeout(hoverExitTimerRef.current);
    hoverExitTimerRef.current = window.setTimeout(() => setActiveIndex(-1), 220);
  };

  const openItem = (item) => {
    const rowElements = navRef.current?.querySelectorAll(".flowing-menu__item");
    const firstRow = rowElements?.[0]?.getBoundingClientRect();
    const lastRow = rowElements?.[rowElements.length - 1]?.getBoundingClientRect();
    const contentRect = navRef.current
      ?.closest(".skills-content")
      ?.getBoundingClientRect();

    if (firstRow && lastRow && contentRect) {
      setOpenedLayout({
        menu: {
          left: firstRow.left,
          top: firstRow.top,
          width: firstRow.width,
          height: lastRow.bottom - firstRow.top,
        },
        heading: {
          left: contentRect.left,
          top: contentRect.top,
          width: contentRect.width,
        },
      });
    }
    setOpenedItem(item);
  };

  return (
    <nav
      ref={navRef}
      className={`flowing-menu ${className}`.trim()}
      aria-label={ariaLabel}
      data-direction={direction === "right" ? "right" : "left"}
      style={{
        "--flowing-text": textColor,
        "--flowing-bg": bgColor,
        "--flowing-band-bg": marqueeBgColor,
        "--flowing-band-text": marqueeTextColor,
        "--flowing-divider": borderColor,
        "--flowing-speed": `${Math.max(8, speed)}s`,
      }}
      onPointerLeave={deactivate}
    >
      <ul className="flowing-menu__list">
        {items.map((item, index) => {
          const selected = activeIndex === index;

          return (
            <li
              className="flowing-menu__item"
              key={`${item.text}-${index}`}
              data-current={selected ? "" : undefined}
              onPointerEnter={() => activate(index)}
            >
              {dividers && index > 0 && (
                <span className="flowing-menu__divider" aria-hidden="true" />
              )}
              {item.link ? (
                <a
                  className="flowing-menu__link"
                  href={item.link}
                  aria-label={item.ariaLabel || item.text}
                  onFocus={() => activate(index)}
                  onBlur={() => deactivate()}
                  onClick={(event) => {
                    onItemClick?.(item, index, event);
                    if (item.image) openItem(item);
                  }}
                >
                  {item.index && <span className="flowing-menu__index">{item.index}</span>}
                  <span className="flowing-menu__label">{item.text}</span>
                  {item.showArrow && <span className="flowing-menu__arrow">↗</span>}
                </a>
              ) : (
                <button
                  type="button"
                  className="flowing-menu__link"
                  aria-label={item.ariaLabel || item.text}
                  onFocus={() => activate(index)}
                  onBlur={() => deactivate()}
                  onClick={(event) => {
                    onItemClick?.(item, index, event);
                    if (item.image) openItem(item);
                  }}
                >
                  {item.index && <span className="flowing-menu__index">{item.index}</span>}
                  <span className="flowing-menu__label">{item.text}</span>
                  {item.showArrow && <span className="flowing-menu__arrow">↗</span>}
                </button>
              )}

              <div
                className="flowing-menu__band"
                aria-hidden="true"
              >
                {item.image && (
                  <img
                    className="flowing-menu__preview-image"
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    style={{
                      objectPosition: item.imagePosition || "center center",
                    }}
                  />
                )}
                <div className="flowing-menu__track">
                  {[0, 1, 2].map((copy) => (
                    <span className="flowing-menu__marquee-part" key={copy}>
                      <span>{item.marquee || item.text}</span>
                      {item.image && (
                        <span
                          className="flowing-menu__image"
                          style={{
                            backgroundImage: `url(${item.image})`,
                            backgroundPosition: item.imagePosition || "center center",
                          }}
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {openedItem && createPortal((
        <div
          className="flowing-menu__topography-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${openedItem.text} experience`}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpenedItem(null);
          }}
        >
          <div key={openedItem.text} className="flowing-menu__scene">
          {openedItem.text === "Motion & Animation" ? (
            <LiquidChrome
              className="flowing-menu__liquid-chrome"
              style={{ position: "absolute", inset: 0 }}
              color="#39598c"
              speed={0.4}
              amplitude={0.37}
              detail={8}
              thickness={1}
              interactive
              frequencyX={3}
              frequencyY={3}
              depth={1.2}
              roughness={0.3}
              exposure={1}
              rippleStrength={2.2}
              rippleSize={1}
              tilt={1}
              intro
              lightMode={false}
            />
          ) : openedItem.text === "Interactive Design" ? (
            <Ballpit
              className="flowing-menu__ballpit"
              style={{ position: "absolute", inset: 0 }}
              count={200}
              colors={["#ffffff"]}
              material="satin"
              gravity={0}
              drift={0.4}
              followCursor
              grab
              clickEffect="burst"
              minSize={0.5}
              maxSize={1}
              friction={0.9975}
              wallBounce={0.95}
              bounce={0.85}
              depth={2}
              cursorSize={1}
              lightColor="#ffffff"
              lightIntensity={1}
              exposure={1}
              shadows={0.6}
              intro
            />
          ) : openedItem.text === "3D Web Experiences" ? (
            <Balatro
              className="flowing-menu__balatro"
              color1="#DE443B"
              color2="#006BB4"
              color3="#162325"
              swirl={0.25}
              pixelSize={1.5}
              mouseInteraction
              contrast={3.5}
              lighting={0.4}
              speed={1}
              rotationSpeed={0}
              scale={1}
              detail={5}
              crt={0}
              mouseStrength={1}
              clickSwirl
              intro
              lightMode={false}
            />
          ) : (
            <Topography
              className="flowing-menu__topography"
              color="#4f7cff"
              lineCount={22}
              lineWidth={1.2}
              elevation={1}
              foreground={0.2}
              tilt={32}
              speed={0.25}
              direction="forward"
              glow={0.6}
              depthOfField={0.4}
              fog={0.35}
              hoverEffect="lift"
              clickEffect="pulse"
              majorLines
              scale={1}
              detail={0.35}
              morph={0.2}
              brightness={1}
              markers="none"
              glitch={0}
              opacity={1}
              mouseInteraction
              mouseRadius={1}
              mouseStrength={0.6}
              trail={0.3}
              parallax={0.5}
              intro
              lightMode={false}
            />
          )}
          </div>
          <button
            type="button"
            className="flowing-menu__player-close"
            onClick={() => setOpenedItem(null)}
            aria-label="Close experience"
          >
            ×
          </button>
          <div
            className="flowing-menu__overlay-rows"
            style={openedLayout ? {
              left: openedLayout.menu.left,
              top: openedLayout.menu.top,
              width: openedLayout.menu.width,
              height: openedLayout.menu.height,
            } : undefined}
          >
            {items.map((item, index) => {
              let distance = index - items.findIndex((entry) => entry.text === openedItem.text);
              if (distance > items.length / 2) distance -= items.length;
              if (distance < -items.length / 2) distance += items.length;
              const selected = distance === 0;
              const step = typeof window !== "undefined" && window.innerWidth <= 700 ? 54 : 68;
              return <button
                type="button"
                className="flowing-menu__overlay-row"
                key={`topography-${item.text}-${index}`}
                aria-label={`Open ${item.text}`}
                aria-current={selected ? "true" : undefined}
                style={{
                  "--carousel-offset": `${distance * step}px`,
                  "--carousel-scale": selected ? 1 : 0.94,
                  "--carousel-opacity": selected ? 1 : Math.max(0.16, 0.56 - Math.abs(distance) * 0.16),
                  "--carousel-blur": `${selected ? 0 : Math.min(3.2, Math.abs(distance) * 1.15)}px`,
                }}
                onClick={() => setOpenedItem(item)}
              >
                <span className="flowing-menu__carousel-arrow" aria-hidden="true">{selected ? "→" : ""}</span>
                <span className="flowing-menu__overlay-label">{item.text}</span>
                <span className="flowing-menu__carousel-arrow" aria-hidden="true" />
              </button>;
            })}
          </div>
        </div>
      ), document.body)}
    </nav>
  );
}
