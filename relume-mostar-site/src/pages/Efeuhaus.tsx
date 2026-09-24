import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { asset } from "@/lib/asset";
import "./efeuhaus.css";

// Hero composition taken directly from the Figma "Efeuhaus Parallax-Szene"
// file (frame 1:2, 1303x978 design space). Positions/sizes below are that
// frame's exact layer geometry converted to percentages of the design
// frame, so the composition reproduces Figma 1:1 while scaling responsively
// to any viewport. Blur, the soft alpha mask on Splitframe Rechts, the
// -10deg rotation on Close-up, and the soft-light color-grade overlay are
// all reproduced as given in the design.
//
// Scroll/mouse parallax motion (lerp-smoothed inertia + cursor drift) is
// layered on top, applied to each layer back -> front with increasing
// magnitude, matching the source ParallaxHero.jsx component 1:1.
const DESIGN_W = 1303;
const DESIGN_H = 978;
const pctX = (px: number) => (px / DESIGN_W) * 100;
const pctY = (px: number) => (px / DESIGN_H) * 100;

const MOTION = [
  { tyFactor: 0.08, scaleGrow: 0.06, mouseFactor: 6 }, // 07 D
  { tyFactor: 0.08, scaleGrow: 0.06, mouseFactor: 6 }, // 06 Sky Background
  { tyFactor: 0.14, scaleGrow: 0.1, mouseFactor: 10 }, // 05 base photo
  { tyFactor: 0.2, scaleGrow: 0.14, mouseFactor: 14 }, // 03 Mid-Back
  { tyFactor: 0.28, scaleGrow: 0.18, mouseFactor: 18 }, // 04 Splitframe Rechts
  { tyFactor: 0.36, scaleGrow: 0.22, mouseFactor: 22 }, // 02 Close-up
  { tyFactor: 0.5, scaleGrow: 0.3, mouseFactor: 28 }, // 01 Vordergrund
];

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, v: number) => {
  const x = clamp((v - e0) / (e1 - e0));
  return x * x * (3 - 2 * x);
};

export default function Efeuhaus() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let targetProgress = 0;
    let smoothProgress = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let rafId = 0;

    const getTargetProgress = () => {
      const section = sectionRef.current;
      if (!section) return 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = section.offsetHeight - vh;
      return total > 0 ? clamp(-rect.top / total) : 0;
    };

    const tick = () => {
      targetProgress = getTargetProgress();
      const rm = reduceMotion.matches;

      if (rm) {
        smoothProgress = targetProgress;
        mouseX = 0;
        mouseY = 0;
      } else {
        smoothProgress = lerp(smoothProgress, targetProgress, 0.09);
        mouseX = lerp(mouseX, targetMouseX, 0.06);
        mouseY = lerp(mouseY, targetMouseY, 0.06);
      }

      const p = smoothProgress;
      const vh = window.innerHeight;
      const mobile = window.innerWidth < 768;
      const m = mobile ? 0.55 : 1;
      const eased = p * p * (3 - 2 * p);

      MOTION.forEach((l, i) => {
        const el = layerRefs.current[i];
        if (!el) return;
        const ty = -eased * l.tyFactor * vh * m;
        const s = 1 + eased * l.scaleGrow * m;
        const mx = mouseX * l.mouseFactor;
        const my = mouseY * l.mouseFactor * 0.5;
        el.style.transform = `translate3d(${mx.toFixed(2)}px, ${(ty + my).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
      });

      if (overlayRef.current) {
        const introExit = smoothstep(0, 0.35, p);
        overlayRef.current.style.opacity = (1 - introExit).toFixed(3);
        overlayRef.current.style.transform = `translate3d(0, ${(-introExit * 0.22 * vh).toFixed(2)}px, 0) scale(${(1 - introExit * 0.06).toFixed(4)})`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = Math.max(0, 1 - p * 5).toFixed(3);
      }

      rafId = requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      targetMouseX = e.clientX / window.innerWidth - 0.5;
      targetMouseY = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    layerRefs.current[i] = el;
  };

  return (
    <section
      ref={sectionRef}
      className="efeuhaus-canvas relative"
      style={{ height: "320vh" }}
      aria-label="Cinematic parallax of a woodland house"
    >
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ position: "sticky", top: 0, background: "#0A0C0B" }}
      >
        <Link to="/" className="efeuhaus-back" aria-label="Back to home">
          ← Home
        </Link>

        {/* 07 D */}
        <div
          ref={setRef(0)}
          className="absolute"
          style={{
            left: `${pctX(53)}%`,
            top: `${pctY(-29)}%`,
            width: `${pctX(1280)}%`,
            height: `${pctY(925)}%`,
            zIndex: 10,
            willChange: "transform",
          }}
        >
          <img
            src={asset("/images/figma-hero/07D.png")}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-full w-full select-none object-cover"
            style={{ filter: "blur(1px)" }}
          />
        </div>

        {/* 06 Sky Background (flat color, no image) */}
        <div
          ref={setRef(1)}
          className="absolute"
          style={{
            left: `${pctX(53)}%`,
            top: `${pctY(-29)}%`,
            width: `${pctX(1280)}%`,
            height: `${pctY(925)}%`,
            background: "#87c2ed",
            zIndex: 9,
            willChange: "transform",
          }}
        />

        {/* 05 base photo */}
        <div
          ref={setRef(2)}
          className="absolute"
          style={{
            left: `${pctX(-183)}%`,
            top: `${pctY(7)}%`,
            width: `${pctX(1838)}%`,
            height: `${pctY(1034)}%`,
            zIndex: 20,
            willChange: "transform",
          }}
        >
          <img
            src={asset("/images/figma-hero/05_base.png")}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-full w-full select-none object-cover"
          />
        </div>

        {/* 03 Mid-Back */}
        <div
          ref={setRef(3)}
          className="absolute"
          style={{
            left: `${pctX(-10)}%`,
            top: `${pctY(0)}%`,
            width: `${pctX(1492)}%`,
            height: `${pctY(1041)}%`,
            zIndex: 30,
            willChange: "transform",
          }}
        >
          <img
            src={asset("/images/figma-hero/03_MidBack.png")}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-full w-full select-none object-cover"
            style={{ filter: "blur(0.4px)" }}
          />
        </div>

        {/* 04 Splitframe Rechts - soft alpha mask (fließende Transparenz) */}
        <div
          ref={setRef(4)}
          className="absolute"
          style={{
            left: `${pctX(37.33)}%`,
            top: `${pctY(-10)}%`,
            width: `${pctX(1306.667)}%`,
            height: `${pctY(1051)}%`,
            opacity: 0.56,
            zIndex: 40,
            willChange: "transform",
            maskImage: `url("${asset("/images/figma-hero/04_SplitframeRechts_mask.svg")}")`,
            WebkitMaskImage: `url("${asset("/images/figma-hero/04_SplitframeRechts_mask.svg")}")`,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "45% 100%",
            WebkitMaskSize: "45% 100%",
            maskPosition: "55% 0%",
            WebkitMaskPosition: "55% 0%",
          }}
        >
          <img
            src={asset("/images/figma-hero/04_SplitframeRechts.png")}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-full w-full select-none object-cover"
          />
        </div>

        {/* 02 Close-up (rotated -10deg, centered in its own box) */}
        <div
          ref={setRef(5)}
          className="absolute flex items-center justify-center"
          style={{
            left: `${pctX(58.79)}%`,
            top: `${pctY(750.83)}%`,
            width: `${pctX(764.41)}%`,
            height: `${pctY(352.341)}%`,
            zIndex: 50,
            willChange: "transform",
          }}
        >
          <div
            style={{
              width: "96.28%",
              height: "64.71%",
              transform: "rotate(-10deg)",
              position: "relative",
            }}
          >
            <img
              src={asset("/images/figma-hero/02_CloseUp.png")}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="h-full w-full select-none object-cover"
            />
          </div>
        </div>

        {/* 01 Vordergrund */}
        <div
          ref={setRef(6)}
          className="absolute"
          style={{
            left: `${pctX(0)}%`,
            top: `${pctY(-21)}%`,
            width: `${pctX(1344)}%`,
            height: `${pctY(1138)}%`,
            zIndex: 60,
            willChange: "transform",
          }}
        >
          <img
            src={asset("/images/figma-hero/01_Vordergrund.png")}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-full w-full select-none object-cover"
          />
        </div>

        {/* Farbfilter - Szenenabgleich - global soft-light color grade, static */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: `${pctX(0)}%`,
            top: `${pctY(0)}%`,
            width: `${pctX(1344)}%`,
            height: `${pctY(1034)}%`,
            background: "rgba(158,173,135,0.77)",
            mixBlendMode: "soft-light",
            opacity: 0.56,
            zIndex: 61,
          }}
        />

        {/* cinematic vignette + grain */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 65,
            background: "radial-gradient(120% 90% at 50% 42%, transparent 52%, rgba(10,12,11,0.55) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 66,
            background:
              "linear-gradient(to bottom, rgba(10,12,11,0.35) 0%, transparent 22%, transparent 70%, rgba(10,12,11,0.65) 100%)",
          }}
        />

        {/* narrative overlay (rides with the scene) */}
        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          style={{ zIndex: 70, willChange: "transform, opacity" }}
        >
          <p className="efeuhaus-kicker mb-5 text-[0.7rem] uppercase tracking-[0.45em]">Architectural Vestige</p>
          <h1 className="efeuhaus-headline font-light italic leading-[1.05]">The House in the Trees</h1>
          <p className="efeuhaus-subline mt-6 max-w-xl text-sm leading-relaxed">
            Seven planes of light and shadow, excavated from a single garden. Scroll to move through the frame.
          </p>
        </div>

        {/* scroll hint */}
        <div
          ref={hintRef}
          className="efeuhaus-hint pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[0.62rem] uppercase tracking-[0.4em]">Scroll</span>
          <span className="block h-10 w-px bg-current opacity-60" />
        </div>
      </div>
    </section>
  );
}
