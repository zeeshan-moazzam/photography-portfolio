import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { about, albums } from "../data.js";

/* Boot screen. A cursive "hello" writes itself over the boot wallpaper — the
   macOS first-run animation — then the whole panel slides up off the top of the
   screen to reveal the desktop underneath. Doubles as a preload window: the
   desktop wallpaper and the first frame of each album decode while the mark is
   being drawn, so the desktop paints finished rather than half-loaded. */

const DRAW_MS = 2400; // time for the stroke to write itself
const HOLD_MS = 1520; // beat after the last stroke lands, before the panel moves
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
  const [length, setLength] = useState(0);
  const pathRef = useRef(null);

  /* Measure the stroke so the dash animation is exact regardless of viewBox
     scaling — a hard-coded dasharray drifts the moment the path is edited. */
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (path) setLength(path.getTotalLength());
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
      <Hello pathRef={pathRef} length={length} />
    </div>
  );
}

/* The mark itself: one unbroken cursive stroke, written in pen order — h's
   ascender loop, e, the two l's, then the o and its exit flourish. Laid out on a
   200 baseline / 118 x-height / 42 ascender grid and sheared 4° right, so the
   viewBox below frames the ink with an even margin on all four sides. Kept as
   waypoint-smooth cubics rather than a font glyph because the write-on animation
   needs a centreline to trace, not a filled outline. */
const HELLO_D = [
  /* h */
  "M 50 196 C 53 190 62 172 69 158 C 76 144 85 125 92 110 C 100 95 108 78 113 68",
  "C 119 58 125 55 127 50 C 128 45 126 39 124 36 C 121 33 114 31 110 32",
  "C 105 33 101 35 97 40 C 93 45 87 54 86 62 C 84 70 86 79 88 86 C 90 93 96 99 99 106",
  "C 101 113 103 119 105 128 C 107 137 109 149 111 158 C 113 167 113 174 115 180",
  "C 118 186 121 191 124 194 C 128 197 134 201 138 200 C 142 199 147 194 151 190",
  "C 154 186 156 182 159 175 C 161 168 162 156 165 148 C 167 140 170 133 173 128",
  "C 176 123 180 120 184 118 C 188 117 193 117 197 119 C 200 121 202 126 204 132",
  "C 205 138 205 148 205 156 C 205 164 205 171 205 178 C 204 185 198 196 204 196",
  /* e */
  "C 211 196 233 184 242 176 C 251 168 254 158 260 150 C 265 142 271 135 275 130",
  "C 279 125 281 123 282 120 C 282 117 280 112 277 110 C 274 108 269 107 264 108",
  "C 260 109 256 111 252 115 C 248 119 242 125 239 130 C 236 135 233 142 233 147",
  "C 232 152 233 156 235 162 C 236 168 238 176 241 182 C 245 188 250 193 256 196",
  "C 262 199 270 200 277 199 C 284 198 291 195 297 192 C 302 189 306 188 311 180",
  /* l */
  "C 317 172 322 159 328 146 C 334 133 342 114 349 100 C 356 86 363 72 368 64",
  "C 372 56 376 55 377 50 C 378 45 376 39 374 36 C 371 33 364 31 360 32",
  "C 355 33 351 35 347 40 C 343 45 337 54 336 62 C 334 70 336 79 338 86",
  "C 340 93 346 99 349 106 C 351 113 353 119 355 128 C 357 137 359 149 361 158",
  "C 363 167 363 174 365 180 C 368 186 371 191 374 194 C 378 197 384 201 388 200",
  "C 392 199 397 194 401 190 C 405 186 408 183 412 176",
  /* l */
  "C 416 169 418 159 424 146 C 429 133 438 114 445 100 C 452 86 459 72 464 64",
  "C 468 56 472 55 473 50 C 474 45 472 39 470 36 C 467 33 460 31 456 32",
  "C 451 33 447 35 443 40 C 439 45 433 54 432 62 C 430 70 432 79 434 86",
  "C 436 93 442 99 445 106 C 447 113 449 119 451 128 C 453 137 455 149 457 158",
  "C 459 167 459 174 461 180 C 464 186 467 191 470 194 C 474 197 480 201 484 200",
  "C 488 199 493 194 497 190 C 501 186 503 181 508 176",
  /* o, then the tail */
  "C 512 171 517 165 523 158 C 529 151 536 142 543 136 C 549 130 555 126 560 122",
  "C 564 118 568 117 568 114 C 568 111 565 107 561 106 C 557 105 550 105 545 107",
  "C 539 109 532 113 528 118 C 523 123 519 131 516 138 C 514 145 513 151 513 158",
  "C 513 165 513 174 515 180 C 518 186 524 193 530 196 C 536 199 545 199 552 198",
  "C 559 197 567 193 573 189 C 579 185 584 180 588 174 C 592 168 595 160 595 153",
  "C 596 146 593 138 591 133 C 588 128 580 124 579 124 C 579 124 582 132 586 135",
  "C 590 138 597 143 603 144 C 609 145 618 143 624 139 C 631 135 640 123 644 120",
].join(" ");

/* One continuous script stroke. Drawn with a dash offset that unwinds to zero,
   which reads as a pen moving across the wallpaper. */
function Hello({ pathRef, length }) {
  const style = length
    ? {
        strokeDasharray: length,
        strokeDashoffset: length,
        animation: `boot-write ${DRAW_MS}ms cubic-bezier(0.55, 0.02, 0.36, 1) forwards`,
      }
    : { opacity: 0 };

  return (
    <svg
      className="boot__hello"
      viewBox="33 15 628 202"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        ref={pathRef}
        style={style}
        stroke="currentColor"
        strokeWidth="23"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={HELLO_D}
      />
    </svg>
  );
}
