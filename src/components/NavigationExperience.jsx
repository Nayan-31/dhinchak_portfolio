import Topography from "./Topography";
import Balatro from "./Balatro";
import Ballpit from "./Ballpit";
import LiquidChrome from "./LiquidChrome";
import GhostCursor from "./GhostCursor";
import GlowCursor from "./GlowCursor";
import AboutShowcase from "./AboutShowcase";
import "./NavigationExperience.css";

const PAGE_SCENES = {
  about: { title: "About", scene: "liquid" },
  projects: { title: "Projects", scene: "topography" },
  blog: { title: "Blog", scene: "ballpit" },
  contact: { title: "Contact", scene: "balatro" },
};

function Background({ scene }) {
  const fullSize = { position: "absolute", inset: 0 };

  if (scene === "liquid") {
    return (
      <LiquidChrome
        className="navigation-experience__canvas"
        style={fullSize}
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
    );
  }

  if (scene === "topography") {
    return (
      <Topography
        className="navigation-experience__canvas"
        style={fullSize}
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
    );
  }

  if (scene === "ballpit") {
    return (
      <Ballpit
        className="navigation-experience__canvas"
        style={fullSize}
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
    );
  }

  return (
    <Balatro
      className="navigation-experience__canvas"
      style={fullSize}
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
  );
}

export default function NavigationExperience({ page }) {
  const destination = PAGE_SCENES[page];
  if (!destination) return null;

  return (
    <section
      key={page}
      className={`navigation-experience${page === "about" ? " navigation-experience--about" : ""}`}
      aria-label={`${destination.title} page background`}
      aria-live="polite"
    >
      <Background scene={destination.scene} />
      <div className="navigation-experience__shade" aria-hidden="true" />
      {page === "blog" && (
        <GhostCursor
          className="navigation-experience__ghost-cursor"
          color="#94a3b8"
          size={86}
          trailLength={90}
          inertia={0.7}
          turbulence={0.5}
          drift={0.15}
          bloomStrength={0.3}
          grainIntensity={0.22}
          detail={1}
          brightness={2.1}
          bloomRadius={1}
          edgeIntensity={0}
          fadeDelayMs={1400}
          fadeDurationMs={1500}
          clickPuff
          intro
          mixBlendMode="normal"
          zIndex={3}
        />
      )}
      {page === "projects" && (
        <GlowCursor
          className="navigation-experience__glow-cursor"
          color="#001224"
          intensity={1.3}
          trailWidth={3}
          linger={1.4}
          glow={1.2}
          clickBurst
          theme="dark"
        />
      )}
      <div className="navigation-experience__title">
        <span>PORTFOLIO / {destination.title.toUpperCase()}</span>
        <h1>{destination.title}</h1>
      </div>
      {page === "about" ? <AboutShowcase /> : null}
      <p className="navigation-experience__hint">
        {page === "about" ? "SCROLL TO EXPLORE ↓" : "OPEN MENU TO EXPLORE"}
      </p>
    </section>
  );
}
