'use client';

import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Simplified outline of mainland Portugal, already projected into SVG units
const RAW_OUTLINE =
  'M61.4 40.3 L62.9 57.6 L67.3 76.8 L69.5 89.3 L74.7 110.4 L76.9 129.6 L70.3 159.4 L67.3 187.2 L60.7 206.4 L54.7 230.4 L49.6 244.8 L45.9 259.2 L23.7 282.2 L25.1 302.4 L20 321.6 L14.8 337.9 L20.7 345.6 L33.3 347.5 L37 351.4 L45.9 349.4 L39.9 362.9 L35.5 372.5 L48.1 364.8 L59.2 362.9 L68.1 374.4 L68.1 393.6 L61.4 417.6 L65.1 451.2 L66.6 467.5 L62.9 484.8 L52.5 506.9 L59.2 508.8 L76.2 499.2 L85.8 497.3 L107.3 501.1 L130.9 509.8 L151.6 497.3 L169.4 491.5 L165 463.7 L164.2 441.6 L171.6 422.4 L181.2 408 L201.2 396.5 L190.8 374.4 L181.2 360 L192.3 343.7 L198.2 328.3 L193.8 312 L177.5 302.4 L173.8 276.5 L161.3 254.4 L170.1 244.8 L197.5 223.7 L207.1 218.9 L211.6 196.8 L209.3 177.6 L212.3 161.3 L210.8 144 L205.6 121.9 L216 97.9 L253.7 76.8 L236.7 64.3 L233 48 L233 33.6 L210.8 33.6 L188.6 38.4 L167.9 35.5 L155.3 46.1 L133.1 33.6 L125.7 19.2 L111 14.4 L90.2 21.1 L78.4 25.9 Z';

type Point = [number, number];

const ROUGH: Point[] = (RAW_OUTLINE.match(/-?\d+(?:\.\d+)?/g) ?? [])
  .map(Number)
  .reduce<Point[]>((points, value, index, all) => {
    if (index % 2 === 0) points.push([value, all[index + 1]]);
    return points;
  }, []);

// Chaikin corner cutting: turns the angular outline into a smooth, natural-looking coastline
function smooth(points: Point[], rounds: number): Point[] {
  let current = points;
  for (let round = 0; round < rounds; round++) {
    const next: Point[] = [];
    for (let i = 0; i < current.length; i++) {
      const [px, py] = current[i];
      const [qx, qy] = current[(i + 1) % current.length];
      next.push([0.75 * px + 0.25 * qx, 0.75 * py + 0.25 * qy], [0.25 * px + 0.75 * qx, 0.25 * py + 0.75 * qy]);
    }
    current = next;
  }
  return current;
}

const OUTLINE = smooth(ROUGH, 3);
const OUTLINE_PATH = `M${OUTLINE.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;

function isInside(x: number, y: number) {
  let inside = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i];
    const [xj, yj] = OUTLINE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Covilhã, in the same SVG units
const ORIGIN = { x: 162.7, y: 193.9 };

// Grid of dots
const DOT_RADIUS = 2.1;
const SPACING_X = 8.4;
const SPACING_Y = 7.3;

// Waves: size of the biggest ring (it must be able to reach the far corners of the country from Covilhã)
const WAVE_MAX_RADIUS = 380;
const WAVE_OFFSETS = [0, 1, 2]; // three waves in the sequence, one third of a cycle apart

// Hex-like grid of dots inside the country
const DOTS: { x: number; y: number }[] = (() => {
  const dots: { x: number; y: number }[] = [];
  for (let row = 0, y = 12; y <= 514; y += SPACING_Y, row++) {
    const offset = row % 2 ? SPACING_X / 2 : 0;
    for (let x = 10 + offset; x <= 258; x += SPACING_X) {
      if (isInside(x, y)) dots.push({ x, y });
    }
  }
  return dots;
})();

/**
 * Clean dot map of Portugal with endless, overlapping waves. Rings of gold leave Covilhã one after another
 * and cross the whole country: the dots turn gold as a ring passes and go back to grey right behind it,
 * so a new wave is always coming.
 */
export function PortugalMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });

  const dotCircles = useMemo(
    () => DOTS.map((dot) => <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r={DOT_RADIUS} />),
    []
  );

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[300px]">
      {/* Soft golden glow behind the map */}
      <div
        aria-hidden="true"
        className="pt-glow pointer-events-none absolute inset-[-14%] rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.34)_0%,transparent_64%)] blur-2xl"
        style={{ animationPlayState: inView ? 'running' : 'paused' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
      <svg
        viewBox="0 0 270 526"
        className="relative h-auto w-full overflow-visible"
        role="img"
        aria-label="Mapa de Portugal com ondas contínuas a sair da Covilhã para todo o país"
      >
        <defs>
          {/* Profile of one wave, from the centre outwards: nothing inside, a soft gold ring, nothing outside */}
          <radialGradient id="pt-ring">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.76" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.86" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="pt-waves" maskUnits="userSpaceOnUse" x="-250" y="-250" width="800" height="1000">
            {/* Mounted only while the map is on screen, so the first wave leaves Covilhã the moment the section is reached */}
            {inView && WAVE_OFFSETS.map((offset) => (
              <circle
                key={offset}
                className="pt-wave"
                cx={ORIGIN.x}
                cy={ORIGIN.y}
                r={WAVE_MAX_RADIUS}
                fill="url(#pt-ring)"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  // First wave starts at once, the next ones follow at an even, calm pace
                  animationDelay: `${offset * 4.3}s`,
                }}
              />
            ))}
          </mask>
        </defs>

        <g>
          {/* Soft body of the country under the dots */}
          <path d={OUTLINE_PATH} className="fill-[#f6f6f4] dark:fill-[#262b34]" />

          {/* Dots at rest: soft grey */}
          <g className="fill-[#c9cdd4] dark:fill-[#4a5262]">{dotCircles}</g>

          {/* The same dots in gold, only visible where a wave is passing */}
          <g fill="#eab308" mask="url(#pt-waves)">
            {dotCircles}
          </g>

          {/* Covilhã */}
          <circle cx={ORIGIN.x} cy={ORIGIN.y} r="9" fill="rgba(234,179,8,0.22)">
            <animate attributeName="r" values="9;15;9" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.35;1" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle cx={ORIGIN.x} cy={ORIGIN.y} r="5.2" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
          <g>
            <line x1={ORIGIN.x + 7} y1={ORIGIN.y - 5} x2={ORIGIN.x + 26} y2={ORIGIN.y - 22} stroke="#9ca3af" strokeWidth="0.8" />
            <text x={ORIGIN.x + 30} y={ORIGIN.y - 20} fontSize="14" fontWeight="500" className="fill-[#1f2937] dark:fill-[#f3f4f6]" letterSpacing="0.3">
              Covilhã
            </text>
          </g>
        </g>
      </svg>
      </motion.div>
    </div>
  );
}
