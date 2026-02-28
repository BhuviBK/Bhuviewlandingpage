import { useEffect, useState, useCallback } from "react";
import { motion, useMotionValue } from "motion/react";

// ─── Color helpers ────────────────────────────────────────────────────────────
type RGB = [number, number, number];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateRGB(from: RGB, to: RGB, t: number): string {
  return `rgb(${Math.round(lerp(from[0], to[0], t))}, ${Math.round(
    lerp(from[1], to[1], t)
  )}, ${Math.round(lerp(from[2], to[2], t))})`;
}

function interpolateRGBA(from: RGB, to: RGB, fromA: number, toA: number, t: number): string {
  return `rgba(${Math.round(lerp(from[0], to[0], t))}, ${Math.round(
    lerp(from[1], to[1], t)
  )}, ${Math.round(lerp(from[2], to[2], t))}, ${lerp(fromA, toA, t).toFixed(3)})`;
}

// ─── Theme palettes ───────────────────────────────────────────────────────────
const LIGHT = {
  bg1:       [235, 238, 255] as RGB,
  bg2:       [225, 218, 255] as RGB,
  bg3:       [240, 234, 255] as RGB,
  text:      [10, 10, 26]    as RGB,
  sub:       [90, 88, 140]   as RGB,
  tagline:   [110, 105, 165] as RGB,
  orb1:      [180, 175, 255] as RGB,
  orb2:      [210, 200, 255] as RGB,
  orb3:      [195, 220, 255] as RGB,
  line:      [160, 150, 230] as RGB,
  accent:    [130, 120, 220] as RGB,
  cardAlpha: 0.58,
  cardBorder:[255, 255, 255] as RGB,
  cardBorderAlpha: 0.72,
  shadow:    "0 8px 48px rgba(80, 60, 180, 0.12), 0 2px 12px rgba(80, 60, 180, 0.08)",
};

const DARK = {
  bg1:       [5, 5, 16]      as RGB,
  bg2:       [10, 6, 28]     as RGB,
  bg3:       [14, 8, 32]     as RGB,
  text:      [238, 238, 255] as RGB,
  sub:       [155, 150, 200] as RGB,
  tagline:   [140, 135, 185] as RGB,
  orb1:      [60, 40, 140]   as RGB,
  orb2:      [80, 30, 160]   as RGB,
  orb3:      [30, 50, 130]   as RGB,
  line:      [90, 80, 160]   as RGB,
  accent:    [120, 100, 220] as RGB,
  cardAlpha: 0.07,
  cardBorder:[255, 255, 255] as RGB,
  cardBorderAlpha: 0.09,
  shadow:    "0 8px 64px rgba(0, 0, 0, 0.55), 0 2px 16px rgba(0, 0, 0, 0.4)",
};

// ─── Dot grid ─────────────────────────────────────────────────────────────────
function DotGrid({ t }: { t: number }) {
  const dotColor = interpolateRGBA([150, 140, 220], [70, 55, 140], 0.18, 0.2, t);
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        opacity: lerp(0.55, 0.3, t),
        transition: "opacity 0.3s",
      }}
    />
  );
}

// ─── Background orbs ──────────────────────────────────────────────────────────
interface OrbProps {
  t: number;
  style?: React.CSSProperties;
  fromColor: RGB;
  toColor: RGB;
  size: number;
  blur: number;
  opacity: number;
}

function Orb({ t, style, fromColor, toColor, size, blur, opacity }: OrbProps) {
  const color = interpolateRGB(fromColor, toColor, t);
  return (
    <motion.div
      aria-hidden
      animate={{ scale: [1, 1.06, 1], y: [0, -12, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "fixed",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: `blur(${blur}px)`,
        opacity,
        pointerEvents: "none",
        zIndex: 0,
        ...style,
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const motionT = useMotionValue(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const raw = maxScroll > 0 ? Math.min(scrollY / (maxScroll * 0.75), 1) : 0;
    motionT.set(raw);
    setScrollProgress(raw);
  }, [motionT]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const t = scrollProgress;
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOut

  // Dynamic colors
  const bgColor1 = interpolateRGB(LIGHT.bg1, DARK.bg1, ease);
  const bgColor2 = interpolateRGB(LIGHT.bg2, DARK.bg2, ease);
  const bgColor3 = interpolateRGB(LIGHT.bg3, DARK.bg3, ease);
  const textColor = interpolateRGB(LIGHT.text, DARK.text, ease);
  const subColor  = interpolateRGB(LIGHT.sub, DARK.sub, ease);
  const taglineColor = interpolateRGB(LIGHT.tagline, DARK.tagline, ease);
  const lineColor = interpolateRGBA(LIGHT.line, DARK.line, 0.5, 0.35, ease);
  const accentColor = interpolateRGB(LIGHT.accent, DARK.accent, ease);

  const cardBg = interpolateRGBA(
    [255, 255, 255], [255, 255, 255],
    LIGHT.cardAlpha, DARK.cardAlpha,
    ease
  );
  const cardBorder = interpolateRGBA(
    LIGHT.cardBorder, DARK.cardBorder,
    LIGHT.cardBorderAlpha, DARK.cardBorderAlpha,
    ease
  );
  const cardShadow = ease < 0.5
    ? LIGHT.shadow
    : DARK.shadow;

  return (
    <>
      {/* ── Scroll spacer so the page can actually be scrolled ── */}
      <div
        style={{ height: "280vh", position: "relative", zIndex: 0 }}
        aria-hidden
      />

      {/* ── Animated background ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 30% 40%, ${bgColor2}, transparent),
                       radial-gradient(ellipse 70% 70% at 75% 60%, ${bgColor3}, transparent),
                       ${bgColor1}`,
          zIndex: -2,
        }}
      />

      {/* ── Dot grid overlay ── */}
      <DotGrid t={ease} />

      {/* ── Background orbs ── */}
      <Orb
        t={ease}
        fromColor={LIGHT.orb1}
        toColor={DARK.orb1}
        size={420}
        blur={90}
        opacity={lerp(0.55, 0.6, ease)}
        style={{ top: "10%", left: "5%" }}
      />
      <Orb
        t={ease}
        fromColor={LIGHT.orb2}
        toColor={DARK.orb2}
        size={320}
        blur={80}
        opacity={lerp(0.45, 0.5, ease)}
        style={{ bottom: "15%", right: "8%" }}
      />
      <Orb
        t={ease}
        fromColor={LIGHT.orb3}
        toColor={DARK.orb3}
        size={260}
        blur={70}
        opacity={lerp(0.35, 0.4, ease)}
        style={{ top: "55%", left: "60%" }}
      />

      {/* ── Noise grain overlay ── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: lerp(0.025, 0.045, ease),
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* ── Fixed hero ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
          }}
        >
          {/* Entry animation */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(18px)", scale: 0.97 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── Glass card ── */}
            <div
              style={{
                background: cardBg,
                backdropFilter: "blur(28px) saturate(180%) brightness(1.04)",
                WebkitBackdropFilter: "blur(28px) saturate(180%) brightness(1.04)",
                border: `1px solid ${cardBorder}`,
                borderRadius: "28px",
                padding: "clamp(3rem, 7vw, 4.5rem) clamp(2rem, 6vw, 4rem) clamp(2.5rem, 6vw, 3.5rem)",
                textAlign: "center",
                boxShadow: cardShadow,
                transition: "box-shadow 0.6s ease, border-color 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Inner glow edge */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "28px",
                  background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${
                    interpolateRGBA([255, 255, 255], [255, 255, 255], 0.25, 0.06, ease)
                  }, transparent)`,
                  pointerEvents: "none",
                }}
              />

              {/* ── Brand title ── */}
              <motion.h1
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.35, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  color: textColor,
                  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                  fontSize: "clamp(2.8rem, 8vw, 3.8rem)",
                  fontWeight: 300,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  margin: "0 0 0.6rem",
                  transition: "color 0.3s ease",
                }}
              >
                Bhuview
              </motion.h1>

              {/* ── Subtitle ── */}
              <motion.p
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.55, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  color: subColor,
                  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                  fontSize: "clamp(0.6rem, 1.6vw, 0.72rem)",
                  fontWeight: 400,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  margin: "0 0 2.8rem",
                  transition: "color 0.3s ease",
                }}
              >
                UI / UX Portfolio
              </motion.p>

              {/* ── Divider line ── */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.75, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: "1px",
                  background: lineColor,
                  margin: "0 auto 2.8rem",
                  width: "45%",
                  transformOrigin: "center",
                  borderRadius: "1px",
                  transition: "background 0.3s ease",
                }}
              />

              {/* ── Tagline ── */}
              <motion.p
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.95, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  color: taglineColor,
                  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                  fontSize: "clamp(0.85rem, 2.2vw, 0.97rem)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  letterSpacing: "0.01em",
                  lineHeight: 1.6,
                  margin: "0 0 3rem",
                  transition: "color 0.3s ease",
                }}
              >Hello, Harishma..! ❤❤</motion.p>

              {/* ── Pulsing presence dot ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.25, duration: 0.6, ease: "backOut" }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px" }}
              >
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: accentColor,
                    boxShadow: `0 0 8px 2px ${accentColor}`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: subColor,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    transition: "color 0.3s ease",
                  }}
                >
                  Coming Soon
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Subtle scroll hint ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: t > 0.05 ? 0 : 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          pointerEvents: "none",
        }}
      >
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "1px",
            height: "28px",
            background: `linear-gradient(to bottom, transparent, ${subColor})`,
            borderRadius: "1px",
            transition: "background 0.3s ease",
          }}
        />
      </motion.div>
    </>
  );
}