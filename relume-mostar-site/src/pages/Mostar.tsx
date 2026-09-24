import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import "./mostar.css";

// Pixel-exact crops pulled straight from Figma via the Base44 "Cinematic
// Depth Studio" app (same source as the /efeuhaus route), mapped onto this
// page's scene roles by name/intent: SKY <- widest base photo, BACK_FOUR
// <- the blurred atmospheric backdrop layer, BACK_BAZAAR <- "Mid-Back",
// BRIDGE <- the rotated close-up crop, FRAME_TWO <- "Vordergrund"
// (foreground). Splitframe left/right share the one Splitframe-Rechts
// crop, same as the source design: the left/right split is produced by
// this page's own differing transform-origin, not by two source images.
const SKY = asset("/images/figma-hero/05_base.png");
const BACK_FOUR = asset("/images/figma-hero/07D.png");
const BACK_BAZAAR = asset("/images/figma-hero/03_MidBack.png");
const SPLIT_LEFT = asset("/images/figma-hero/04_SplitframeRechts.png");
const SPLIT_RIGHT = asset("/images/figma-hero/04_SplitframeRechts.png");
const BRIDGE = asset("/images/figma-hero/02_CloseUp.png");
const FRAME_TWO = asset("/images/figma-hero/01_Vordergrund.png");

const ICON1 =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png";
const ICON2 =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png";
const ICON3 =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230448_825949c9-ccdb-4857-b4a6-e349eccc9010.png";

const SIGHTS = [
  {
    aria: "Open Stari Most card",
    kicker: "Old Bridge",
    h3: "Stari Most",
    p: "The stone arch over the Neretva and Mostar's main landmark.",
    pin: ICON1,
  },
  {
    aria: "Open Kujundziluk card",
    kicker: "Bazaar Street",
    h3: "Kujundziluk",
    p: "Copper shops, souvenirs, and the old bazaar lane by the bridge.",
    pin: ICON2,
  },
  {
    aria: "Open Koski Mehmed Pasha Mosque card",
    kicker: "Viewpoint",
    h3: "Koski Mehmed Pasha Mosque",
    p: "A classic minaret view back toward Stari Most and the river.",
    pin: ICON3,
  },
  {
    aria: "Open Kajtaz House card",
    kicker: "Ottoman House",
    h3: "Kajtaz House",
    p: "A preserved residential house showing Mostar's Ottoman layers.",
    pin: ICON1,
  },
  {
    aria: "Open War Photo Exhibition card",
    kicker: "Museum",
    h3: "War Photo Exhibition",
    p: "A compact, moving stop for context on the city's recent history.",
    pin: ICON2,
  },
];

function createSightCard(data: (typeof SIGHTS)[number]) {
  const card = document.createElement("article");
  card.className = "sight-card";
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", data.aria);

  const kicker = document.createElement("span");
  kicker.className = "sight-kicker";
  kicker.textContent = data.kicker;

  const pin = document.createElement("img");
  pin.className = "sight-pin";
  pin.src = data.pin;
  pin.alt = "";

  const h3 = document.createElement("h3");
  h3.textContent = data.h3;

  const p = document.createElement("p");
  p.textContent = data.p;

  card.append(kicker, pin, h3, p);
  return card;
}

export default function Mostar() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const section = root.querySelector(".cinema-scroll") as HTMLElement;
    const docEl = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const track = root.querySelector(".sights-track") as HTMLElement;
    const sightsControls = root.querySelector(".sights-controls") as HTMLElement;
    const sightPrev = root.querySelector(".sight-prev") as HTMLElement;
    const sightNext = root.querySelector(".sight-next") as HTMLElement;

    let sightCards: HTMLElement[] = [];
    const originalSightCount = SIGHTS.length;
    let activeSight = originalSightCount;

    let targetMouseX = 0,
      targetMouseY = 0,
      mouseX = 0,
      mouseY = 0;
    let targetScroll = 0,
      smoothScroll = 0;
    let initialized = false,
      rafPending = false,
      rafId = 0;

    const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
    const smoothstep = (e0: number, e1: number, v: number) => {
      const x = clamp((v - e0) / (e1 - e0));
      return x * x * (3 - 2 * x);
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const segmentInOut = (s: number, a: number, b: number, c: number, d: number) => {
      const enter = smoothstep(a, b, s);
      const exit = smoothstep(c, d, s);
      return { enter, exit, active: enter * (1 - exit) };
    };
    const getScrollDistance = () =>
      clamp(
        -section.getBoundingClientRect().top,
        0,
        section.offsetHeight - window.innerHeight
      );

    const setVar = (name: string, value: string) => {
      docEl.style.setProperty(name, value);
    };

    function requestTick() {
      if (!rafPending) {
        rafPending = true;
        rafId = requestAnimationFrame(update);
      }
    }

    function update() {
      rafPending = false;
      targetScroll = getScrollDistance();
      if (!initialized || reduceMotion.matches) {
        smoothScroll = targetScroll;
        initialized = true;
      } else {
        smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
      }
      if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

      mouseX = lerp(mouseX, targetMouseX, 0.12);
      mouseY = lerp(mouseY, targetMouseY, 0.12);

      const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
      const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
      const progress = clamp(smoothScroll / 2700);
      const introExit = smoothstep(90, 650, smoothScroll);
      const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
      const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
      const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
      const blurActive = clamp(frame2.active + frame3.active);
      const frame2Opacity = frame2.active * (1 - frame3.enter);
      const splitDrift = Math.pow(frame2.enter, 1.5);
      const panel2Opacity = frame2.active * (1 - frame2.exit);
      const panel3Opacity = frame3.active * (1 - frame3.exit);
      const backScale =
        0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
      const sharedHeroY = progress * -74;
      const sharedHeroScale = progress * 0.23;
      const sightsScreenTop =
        Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 50;
      const sightsParentTop =
        window.innerHeight - (window.innerHeight - sightsScreenTop) / backScale;

      const rm = reduceMotion.matches;

      setVar("--mx", rm ? "0" : mouseX.toFixed(4));
      setVar("--my", rm ? "0" : mouseY.toFixed(4));

      setVar("--back-opacity", String(1 - frame2.active * 0.06));
      setVar("--back-x", `${mouseX * -12}px`);
      setVar("--back-y", `${mouseY * -4}px`);
      setVar("--back-scale", String(backScale));
      setVar("--four-y", `${10 + progress * 10}vh`);
      setVar("--four-scale", String(0.78 + progress * 0.16));
      setVar("--bazaar-y", `${20 - progress * 8}vh`);
      setVar("--blur-px", `${blurActive * 14}px`);
      setVar("--back-brightness", String(1 - blurActive * 0.255));
      setVar("--bazaar-blur-px", `${frame2.active * 14}px`);
      setVar(
        "--bazaar-brightness",
        String(1 - frame2.active * 0.255 - frame3.active * 0.06)
      );
      setVar("--bazaar-saturation", String(1 + frame3.active * 0.18));
      setVar("--shade-opacity", "1");
      setVar("--shade-z", frame2.active > 0.02 ? "2" : "0");
      setVar("--shade-top-alpha", String(blurActive * 0.465));
      setVar("--shade-mid-alpha", String(blurActive * 0.42));
      setVar("--shade-bottom-alpha", String(blurActive * 0.51));

      setVar("--title-y", `${introExit * -210}px`);
      setVar("--title-scale", String(1 - introExit * 0.08));
      setVar("--title-opacity", String(1 - introExit));

      setVar("--bridge-x", `calc(-50% + ${mouseX * 18}px)`);
      setVar("--bridge-y", `${mouseY * 8 + sharedHeroY - frame2.exit * 760}px`);
      setVar("--bridge-bottom", `${5 - frame2.enter * 13}vh`);
      setVar("--bridge-width", `${67.2 + frame2.enter * 37.8}vw`);
      setVar("--bridge-scale", String(1.02 + sharedHeroScale + frame2.exit * 0.46));

      setVar(
        "--split-left-x",
        `calc(-50% + ${-splitDrift * 46}vw + ${mouseX * 22}px)`
      );
      setVar(
        "--split-left-y",
        `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`
      );
      setVar(
        "--split-left-scale",
        String(1 + sharedHeroScale + frame2.enter * 0.74)
      );
      setVar(
        "--split-right-x",
        `calc(-50% + ${splitDrift * 46}vw + ${mouseX * 22}px)`
      );
      setVar(
        "--split-right-y",
        `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`
      );
      setVar(
        "--split-right-scale",
        String(1 + sharedHeroScale + frame2.enter * 0.74)
      );

      setVar("--frame2-opacity", String(frame2Opacity));
      setVar("--frame2-x", `calc(-50% + ${mouseX * 10}px)`);
      setVar("--frame2-y", `calc(-50% + ${mouseY * 8 - frame2.exit * 150}px)`);
      setVar(
        "--frame2-scale",
        String(1.06 + frame2.enter * 0.08 + frame2.exit * 0.08)
      );

      setVar("--intro-copy-y", `${introExit * 90}px`);
      setVar("--intro-copy-opacity", String(1 - introExit));
      setVar("--panel2-opacity", String(panel2Opacity));
      setVar(
        "--panel2-y",
        `calc(-50% + ${-frame2.exit * 86 + (1 - frame2.enter) * 58}px)`
      );
      setVar("--panel3-opacity", String(panel3Opacity));
      setVar(
        "--panel3-y",
        `calc(-50% + ${-frame3.exit * 86 + (1 - frame3.enter) * 58}px)`
      );

      setVar("--sights-opacity", String(sightsEnter));
      setVar("--sights-controls-opacity", String(sightsControlsEnter));
      sightsControls.classList.toggle("is-ready", sightsControlsEnter > 0.98);
      setVar("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
      setVar("--sights-y", "0px");
      setVar("--sights-enter-x", `${(1 - sightsEnter) * 420}vw`);
      setVar("--sights-scale", String(1 / backScale));
      setVar("--sights-top", `${sightsParentTop}px`);
      setVar("--sights-screen-top", `${sightsScreenTop}px`);

      if (
        Math.abs(smoothScroll - targetScroll) > 0.08 ||
        Math.abs(mouseX - targetMouseX) > 0.001 ||
        Math.abs(mouseY - targetMouseY) > 0.001
      ) {
        requestTick();
      }
    }

    function updateSightSlider() {
      if (!sightCards.length) return;
      const cardWidth = sightCards[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap || "0");
      setVar("--sights-shift", `${-(cardWidth + gap) * activeSight}px`);
      sightCards.forEach((card) => {
        const idx = Number(card.dataset.sightIndex);
        card.classList.toggle("is-active", idx === activeSight);
      });
    }

    function moveSightSlider(dir: number) {
      activeSight += dir;
      updateSightSlider();
    }

    function selectSightCard(card: HTMLElement) {
      const i = Number(card.dataset.sightIndex);
      if (Number.isFinite(i)) {
        activeSight = i;
        updateSightSlider();
      }
    }

    function jumpSightSlider(i: number) {
      track.classList.add("is-jumping");
      activeSight = i;
      updateSightSlider();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => track.classList.remove("is-jumping"))
      );
    }

    function normalizeSightSlider() {
      if (activeSight >= originalSightCount * 2)
        jumpSightSlider(activeSight - originalSightCount);
      else if (activeSight < originalSightCount)
        jumpSightSlider(activeSight + originalSightCount);
    }

    function setupSightSlider() {
      const originals = SIGHTS.map(createSightCard);
      track.replaceChildren();
      for (let setIndex = 0; setIndex < 3; setIndex++) {
        originals.forEach((card, cardIndex) => {
          const clone = card.cloneNode(true) as HTMLElement;
          clone.dataset.sightIndex = String(
            setIndex * originalSightCount + cardIndex
          );
          clone.addEventListener("click", () => selectSightCard(clone));
          clone.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              selectSightCard(clone);
            }
          });
          track.appendChild(clone);
        });
      }
      sightCards = Array.from(track.querySelectorAll(".sight-card"));
      activeSight = originalSightCount;
      updateSightSlider();
    }

    const onScroll = () => requestTick();
    const onResize = () => {
      updateSightSlider();
      requestTick();
    };
    const onPointerMove = (e: PointerEvent) => {
      targetMouseX = e.clientX / window.innerWidth - 0.5;
      targetMouseY = e.clientY / window.innerHeight - 0.5;
      requestTick();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    sightPrev.addEventListener("click", () => moveSightSlider(-1));
    sightNext.addEventListener("click", () => moveSightSlider(1));
    track.addEventListener("transitionend", normalizeSightSlider);

    setupSightSlider();
    requestTick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("transitionend", normalizeSightSlider);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="site-shell mostar-story" ref={rootRef}>
      <section
        className="cinema-scroll"
        id="cinema"
        aria-label="Mostar cinematic scroll story"
      >
        <div className="stage">
          <div className="world">
            <img className="scene-img sky-img" src={SKY} alt="" />
            <header className="site-header" aria-label="Primary navigation">
              <a className="site-logo" href="#cinema">
                Bosnia and Herzegovina
              </a>
              <nav className="site-nav" aria-label="Main menu">
                <a href="#cinema">Intro</a>
                <a href="#bridge">Bridge</a>
                <a href="#bazaar">Bazaar</a>
                <a href="#routes">Routes</a>
              </nav>
              <button className="language-switcher" aria-label="Change language">
                <span>EN</span>
                <span aria-hidden="true">⌄</span>
              </button>
            </header>
            <div className="back-stack">
              <img className="scene-img back-img back-four" src={BACK_FOUR} alt="" />
              <section className="sights-slider" aria-label="Mostar sights slider">
                <div className="sights-track"></div>
              </section>
              <img
                className="scene-img back-img back-bazaar"
                src={BACK_BAZAAR}
                alt=""
              />
            </div>
            <div className="sights-controls" aria-label="Slider controls">
              <button className="sight-nav sight-prev" aria-label="Previous sight">
                ←
              </button>
              <button className="sight-nav sight-next" aria-label="Next sight">
                →
              </button>
            </div>
            <h1 className="hero-title">MOSTAR</h1>
            <img
              className="scene-img splitframe-img splitframe-left"
              src={SPLIT_LEFT}
              alt=""
            />
            <img
              className="scene-img splitframe-img splitframe-right"
              src={SPLIT_RIGHT}
              alt=""
            />
            <img className="scene-img bridge-img" src={BRIDGE} alt="" />
            <img className="scene-img frame-two-img" src={FRAME_TWO} alt="" />
            <div className="shade"></div>
          </div>

          <section className="intro-copy" aria-label="Mostar overview">
            <p>
              A stone arch, emerald water, and a compact old city made for slow
              mornings, late light, and one unforgettable crossing.
            </p>
            <div className="hero-tags" aria-label="Mostar highlights">
              <span>Old Bridge</span>
              <span>Neretva River</span>
              <span>UNESCO old city</span>
            </div>
          </section>

          <section
            className="story-panel story-panel-bridge"
            aria-label="Old Bridge details"
          >
            <h2>The bridge is the city's compass.</h2>
            <p>
              Stari Most links the banks of the Neretva and anchors a historic
              quarter shaped by Ottoman, Mediterranean, and European layers.
            </p>
            <dl className="facts">
              <div>
                <dt>1566</dt>
                <dd>Original bridge completed</dd>
              </div>
              <div>
                <dt>2005</dt>
                <dd>Old Bridge Area inscribed by UNESCO</dd>
              </div>
            </dl>
          </section>

          <section
            className="story-panel story-panel-bazaar"
            aria-label="Old town details"
          >
            <h2>The bazaar keeps Mostar close.</h2>
            <p>
              Stone lanes, mosque courtyards, copper stalls, and riverside
              coffee stay within a short walk of Stari Most.
            </p>
            <button className="note-button">
              <span aria-hidden="true">↗</span>
              <span>Open old town notes</span>
            </button>
          </section>
        </div>
      </section>
    </div>
  );
}
