'use client';

import { createElement, useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

export interface RevealSegment {
  text: string;
  /** Classes for these words only (for example another colour) */
  className?: string;
  /** Start a new line after this segment */
  breakAfter?: boolean;
}

function RevealWord({
  word,
  progress,
  range,
  className,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className={`mr-[0.28em] inline-block ${className ?? ''}`}>
      {word}
    </motion.span>
  );
}

/**
 * A heading whose words light up one by one as it scrolls into view.
 */
export function ScrollRevealText({
  segments,
  as = 'h2',
  className = '',
}: {
  segments: RevealSegment[];
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 82%', 'end 62%'] });

  const words = segments.flatMap((segment, segmentIndex) =>
    segment.text
      .split(' ')
      .filter(Boolean)
      .map((word, wordIndex, all) => ({
        word,
        className: segment.className,
        key: `${segmentIndex}-${wordIndex}`,
        breakAfter: !!segment.breakAfter && wordIndex === all.length - 1,
      }))
  );

  return createElement(
    as,
    { ref, className },
    words.map((item, index) => {
      const start = index / words.length;
      return (
        <span key={item.key} className="contents">
          <RevealWord
            word={item.word}
            progress={scrollYProgress}
            range={[start * 0.85, Math.min(1, start * 0.85 + 0.3)]}
            className={item.className}
          />
          {item.breakAfter && <br />}
        </span>
      );
    })
  );
}
