'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TrimmedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  /** Accepted for drop-in use instead of next/image; the image always fills its container. */
  fill?: boolean;
  /** Load the image with high priority (for the main photo of a page) */
  priority?: boolean;
  /** Render a normal image that keeps its own proportions instead of filling its container */
  natural?: boolean;
}

// Pixels whiter than this count as "border" (pure white or almost white).
const WHITE_LEVEL = 245;
// A row/column is border when at least this share of its pixels is white.
const WHITE_SHARE = 0.99;
// Never cut more than this share of the image from one side.
const MAX_TRIM_PER_SIDE = 0.25;

/**
 * Shows a cover image and, when the picture itself has a white border baked in,
 * crops that border automatically so the image fills the whole frame.
 * Falls back to the normal image if the browser cannot read the pixels.
 */
export function TrimmedImage({ src, alt, className = '', sizes, priority, natural }: TrimmedImageProps) {
  const [trimmedSrc, setTrimmedSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setTrimmedSrc(null);

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const W = img.naturalWidth;
        const H = img.naturalHeight;
        if (!W || !H) return;

        // Analyse a small copy for speed
        const scale = Math.min(1, 400 / Math.max(W, H));
        const sw = Math.max(1, Math.round(W * scale));
        const sh = Math.max(1, Math.round(H * scale));
        const probe = document.createElement('canvas');
        probe.width = sw;
        probe.height = sh;
        const pctx = probe.getContext('2d', { willReadFrequently: true });
        if (!pctx) return;
        pctx.drawImage(img, 0, 0, sw, sh);
        const data = pctx.getImageData(0, 0, sw, sh).data; // throws if the image is cross-origin without CORS

        const isWhite = (x: number, y: number) => {
          const i = (y * sw + x) * 4;
          if (data[i + 3] < 10) return true;
          return data[i] > WHITE_LEVEL && data[i + 1] > WHITE_LEVEL && data[i + 2] > WHITE_LEVEL;
        };
        const rowIsWhite = (y: number) => {
          let n = 0;
          for (let x = 0; x < sw; x++) if (isWhite(x, y)) n++;
          return n / sw >= WHITE_SHARE;
        };
        const colIsWhite = (x: number, y0: number, y1: number) => {
          let n = 0;
          for (let y = y0; y <= y1; y++) if (isWhite(x, y)) n++;
          return n / (y1 - y0 + 1) >= WHITE_SHARE;
        };

        const maxY = Math.floor(sh * MAX_TRIM_PER_SIDE);
        const maxX = Math.floor(sw * MAX_TRIM_PER_SIDE);

        let top = 0;
        while (top < maxY && rowIsWhite(top)) top++;
        let bottom = sh - 1;
        while (sh - 1 - bottom < maxY && rowIsWhite(bottom)) bottom--;
        let left = 0;
        while (left < maxX && colIsWhite(left, top, bottom)) left++;
        let right = sw - 1;
        while (sw - 1 - right < maxX && colIsWhite(right, top, bottom)) right--;

        // Nothing meaningful to trim
        if (top + (sh - 1 - bottom) + left + (sw - 1 - right) < 3) return;

        // Step slightly inside to hide anti-aliased edge pixels
        if (top > 0) top += 1;
        if (bottom < sh - 1) bottom -= 1;
        if (left > 0) left += 1;
        if (right < sw - 1) right -= 1;
        if (right <= left || bottom <= top) return;

        const sx = Math.round(left / scale);
        const sy = Math.round(top / scale);
        const cw = Math.round((right - left + 1) / scale);
        const ch = Math.round((bottom - top + 1) / scale);

        const outScale = Math.min(1, 1400 / cw);
        const out = document.createElement('canvas');
        out.width = Math.max(1, Math.round(cw * outScale));
        out.height = Math.max(1, Math.round(ch * outScale));
        const octx = out.getContext('2d');
        if (!octx) return;
        octx.drawImage(img, sx, sy, cw, ch, 0, 0, out.width, out.height);

        out.toBlob(
          (blob) => {
            if (!blob || cancelled) return;
            objectUrl = URL.createObjectURL(blob);
            setTrimmedSrc(objectUrl);
          },
          'image/jpeg',
          0.9
        );
      } catch {
        // Cannot read pixels (CORS) - keep the original image
      }
    };
    img.src = src;

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (natural) {
    // Plain image with its own proportions (uses the trimmed version once it is ready)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={trimmedSrc || src} alt={alt} className={className} />;
  }

  if (trimmedSrc) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={trimmedSrc} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />;
  }

  return <Image src={src} alt={alt} fill className={className} sizes={sizes} priority={priority} />;
}
