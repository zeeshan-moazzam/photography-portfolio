import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { about, albums } from "../data.js";

/* Boot screen. A cursive "hello" writes itself over the boot wallpaper — the
   macOS first-run animation — then the whole panel slides up off the top of the
   screen to reveal the desktop underneath. Doubles as a preload window: the
   desktop wallpaper and the first frame of each album decode while the mark is
   being drawn, so the desktop paints finished rather than half-loaded. */

const DRAW_MS = 2800; // time for the stroke to write itself
const HOLD_MS = 1200; // beat after the last stroke lands, before the panel moves
const SLIDE_MS = 900; // panel travelling off the top
const MAX_MS = 7000; // never hold the desktop hostage to a slow image

/* Module scope, deliberately — not sessionStorage. This resets on every page
   load, so a refresh replays the boot, but it survives client-side navigation,
   so coming back from /works/:slug doesn't (that's a route change, not a
   reload, and replaying it there would read as a glitch). */
let hasBooted = false;

export const alreadyBooted = () => hasBooted;

const markBooted = () => {
  hasBooted = true;
};

/* Boot wallpaper, desktop wallpaper, portrait, and one cover per folder. Enough
   to make the first paint feel finished without waiting on every photo. */
function bootAssets() {
  return [
    "/background.png",
    "/123.png",
    about.portrait,
    ...albums.map((a) => a.cover || a.photos?.[0]?.src).filter(Boolean),
  ];
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function BootScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  const [lengths, setLengths] = useState([]);
  const pathRefs = useRef([]);

  /* Measure the strokes so the dash animation is exact regardless of viewBox
     scaling — a hard-coded dasharray drifts the moment the path is edited. */
  useLayoutEffect(() => {
    setLengths(pathRefs.current.map((p) => p.getTotalLength()));
  }, []);

  /* Leave once the mark has finished writing *and* the images have settled,
     with MAX_MS as the hard ceiling. */
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const assets = bootAssets();
    const total = assets.length || 1;
    let settled = 0;

    assets.forEach((src) => {
      const img = new Image();
      const bump = () => {
        settled += 1;
      };
      img.onload = bump;
      img.onerror = bump;
      img.src = src;
    });

    const started = Date.now();
    const written = reduced ? 400 : DRAW_MS + HOLD_MS;

    const poll = setInterval(() => {
      const elapsed = Date.now() - started;
      if (elapsed < written) return;
      if (settled < total && elapsed < MAX_MS) return;
      clearInterval(poll);
      setLeaving(true);
    }, 80);

    return () => clearInterval(poll);
  }, []);

  /* Hand the desktop over once the panel has cleared the top edge. */
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      markBooted();
      onDone();
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div className={"boot" + (leaving ? " is-leaving" : "")} aria-hidden="true">
      <Hello pathRefs={pathRefs} lengths={lengths} />
    </div>
  );
}

/* Geometry and stroke timing lifted from the AppleHelloEffect Framer component
   (framer.com/m/AppleHelloEffect-5Xzz.js), on its own 638x200 viewBox. Two
   strokes in pen order: the h's ascender, then one unbroken run through the rest
   of the word. `at`/`for` are fractions of DRAW_MS, so the component's 0.7s lead
   and 0.8s/2.8s stroke lengths keep their proportions at any total duration. */
const APPLE_TOTAL = 3.5;
const HELLO_STROKES = [
  {
    at: 0,
    for: 0.8 / APPLE_TOTAL,
    d: "M8.69214 166.553C36.2393 151.239 61.3409 131.548 89.8191 98.0295C109.203 75.1488 119.625 49.0228 120.122 31.0026C120.37 17.6036 113.836 7.43883 101.759 7.43883C88.3598 7.43883 79.9231 17.6036 74.7122 40.9363C69.005 66.5793 64.7866 96.0036 54.1166 190.356",
  },
  {
    at: 0.7 / APPLE_TOTAL,
    for: 2.8 / APPLE_TOTAL,
    d: "M55.1624 181.135C60.6251 133.114 81.4118 98.0479 107.963 98.0479C123.844 98.0479 133.937 110.703 131.071 128.817C129.457 139.487 127.587 150.405 125.408 163.06C122.869 178.941 130.128 191.348 152.122 191.348C184.197 191.348 219.189 173.523 237.097 145.915C243.198 136.509 245.68 128.073 245.928 119.884C246.176 104.996 237.739 93.8296 222.851 93.8296C203.992 93.8296 189.6 115.17 189.6 142.465C189.6 171.745 205.481 192.341 239.208 192.341C285.066 192.341 335.86 137.292 359.199 75.8585C365.788 58.513 368.26 42.4065 368.26 31.1512C368.26 17.8057 364.042 7.55823 352.131 7.55823C340.469 7.55823 332.777 16.6141 325.829 30.9129C317.688 47.4967 311.667 71.4162 309.203 98.4549C303 166.301 316.896 191.348 349.936 191.348C390 191.348 434.542 135.534 457.286 75.6686C463.803 58.513 466.275 42.4065 466.275 31.1512C466.275 17.8057 462.057 7.55823 450.146 7.55823C438.484 7.55823 430.792 16.6141 423.844 30.9129C415.703 47.4967 409.682 71.4162 407.218 98.4549C401.015 166.301 414.911 191.348 444.416 191.348C473.874 191.348 489.877 165.67 499.471 138.402C508.955 111.447 520.618 94.8221 544.935 94.8221C565.035 94.8221 580.916 109.71 580.916 137.75C580.916 168.768 560.792 192.093 535.362 192.341C512.984 192.589 498.285 174.475 499.774 147.179C501.511 116.907 519.873 94.8221 543.943 94.8221C557.839 94.8221 569.51 100.999 578.682 107.725C603.549 125.866 622.709 114.656 630.047 96.7186",
  },
];

/* Each stroke is drawn with a dash offset that unwinds to zero, which reads as a
   pen moving across the wallpaper. */
function Hello({ pathRefs, lengths }) {
  return (
    <svg
      className="boot__hello"
      viewBox="0 0 638 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {HELLO_STROKES.map((stroke, i) => {
        const length = lengths[i];
        const style = length
          ? {
              strokeDasharray: length,
              strokeDashoffset: length,
              animation: `boot-write ${stroke.for * DRAW_MS}ms ease-in-out ${
                stroke.at * DRAW_MS
              }ms forwards`,
            }
          : { opacity: 0 };

        return (
          <path
            key={i}
            ref={(el) => (pathRefs.current[i] = el)}
            style={style}
            stroke="currentColor"
            strokeWidth="14.8883"
            strokeLinecap="round"
            strokeLinejoin="round"
            d={stroke.d}
          />
        );
      })}
    </svg>
  );
}
