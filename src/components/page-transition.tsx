'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const EASE = [0.76, 0, 0.24, 1] as const;
const LOGO_URL = 'https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png';
const COVER_MS = 550; // time the yellow panel needs to cover the page before navigating
const INTRO_MIN_MS = 1400; // minimum time the opening animation stays on screen
const INTRO_MAX_MS = 4500; // never keep the visitor waiting longer than this

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Yellow opening animation with the logo.
 * - On first visit it covers the page while images and scripts load, then slides away.
 * - When the visitor clicks an internal link it slides in, the page changes behind it, and it slides away.
 */
export function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  // Visible on the server render so the page never flashes before the animation
  const [show, setShow] = useState(!isAdmin);
  const firstLoad = useRef(true);
  const previousPath = useRef(pathname);
  const clickNavigation = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Opening animation: wait for the page to finish loading (with a minimum and a maximum time)
  useEffect(() => {
    if (!firstLoad.current) return;
    firstLoad.current = false;
    if (isAdmin) {
      setShow(false);
      return;
    }
    const minimum = new Promise<void>((resolve) => setTimeout(resolve, INTRO_MIN_MS));
    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', () => resolve(), { once: true });
    });
    const cap = new Promise<void>((resolve) => setTimeout(resolve, INTRO_MAX_MS));
    Promise.race([Promise.all([minimum, loaded]), cap]).then(() => setShow(false));
  }, [isAdmin]);

  // Page change: cover the new page right away, then reveal it
  useIsoLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (isAdmin) {
      clickNavigation.current = false;
      setShow(false);
      return;
    }
    setShow(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(
      () => {
        clickNavigation.current = false;
        setShow(false);
      },
      clickNavigation.current ? 450 : 800
    );
  }, [pathname, isAdmin]);

  // Internal link clicks: slide the panel in first, navigate once the page is covered
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (url.pathname.startsWith('/admin') || window.location.pathname.startsWith('/admin')) return;

      // preventDefault makes next/link skip its own navigation; other click handlers (e.g. closing menus) still run
      event.preventDefault();
      clickNavigation.current = true;
      setShow(true);
      setTimeout(() => router.push(url.pathname + url.search + url.hash), COVER_MS);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [router]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key="page-transition"
          aria-hidden="true"
          // Slides in from the bottom and, when done, slides away upwards
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#d39a06]"
        >
          <div className="intro-logo">
            <Image
              src={LOGO_URL}
              alt=""
              width={480}
              height={168}
              priority
              className="h-28 w-auto brightness-0 invert sm:h-36 md:h-44"
            />
          </div>
          <div className="mt-10 h-px w-52 overflow-hidden bg-[#ffffff]/35 md:w-72">
            <div className="intro-bar h-full w-full origin-left bg-[#ffffff]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
