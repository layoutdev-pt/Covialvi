'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, Sun, Moon, Calculator, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// Scroll thresholds with hysteresis, so the header never flickers near the switch point
const COMPACT_ON = 36; // switch to the floating bar below... after scrolling past this
const COMPACT_OFF = 10; // and only go back to the full bar once back under this

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const DURATION = '500ms';

const LOGO_URL = 'https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png';

/** Animated hamburger: three bars that morph into a close icon */
function MenuIcon({ open }: { open: boolean }) {
  const bar = 'absolute left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300';
  return (
    <span className="relative block h-6 w-6" aria-hidden="true">
      <span className={cn(bar, 'top-[5px]', open && 'top-[11px] rotate-45')} />
      <span className={cn(bar, 'top-[11px]', open && 'scale-x-0 opacity-0')} />
      <span className={cn(bar, 'top-[17px]', open && 'top-[11px] -rotate-45')} />
    </span>
  );
}

export function Header() {
  const t = useTranslations('nav');
  const { user, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [ferramentasOpen, setFerramentasOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const compactRef = useRef(false);

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Scroll detection: passive listener + requestAnimationFrame, with two different thresholds
  useEffect(() => {
    let frame = 0;
    const evaluate = () => {
      frame = 0;
      const y = window.scrollY;
      if (!compactRef.current && y > COMPACT_ON) {
        compactRef.current = true;
        setCompact(true);
      } else if (compactRef.current && y < COMPACT_OFF) {
        compactRef.current = false;
        setCompact(false);
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(evaluate);
    };
    evaluate();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // The Ferramentas button folds away in the compact bar, so close its menu
  useEffect(() => {
    if (compact) setFerramentasOpen(false);
  }, [compact]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setUserMenuOpen(false);
        setFerramentasOpen(false);
      }
    };

    if (userMenuOpen || ferramentasOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen, ferramentasOpen]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Central navigation config. "priority: false" links fold away in the compact bar; all of them stay visible now.
  const navigation = [
    { name: t('home') || 'Início', href: '/', priority: true },
    { name: t('about') || 'Sobre Nós', href: '/sobre', priority: true },
    { name: t('services') || 'Serviços', href: '/servicos', priority: true },
    { name: t('properties'), href: '/imoveis', priority: true },
    { name: t('contact') || 'Contacto', href: '/contacto', priority: true },
  ];

  const isDark = mounted && theme === 'dark';

  // With reduced motion the bar still changes state, just faster and without sliding offsets
  const duration = reduceMotion ? '220ms' : DURATION;

  // ---- Visual states (always concrete values, so every property can transition) ----
  const shellStyle: React.CSSProperties = {
    marginTop: compact ? 12 : 0,
    width: compact ? 'min(780px, calc(100% - 24px))' : '100%',
    borderRadius: compact ? 16 : 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: compact
      ? isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'
      : 'rgba(0,0,0,0)',
    borderBottomColor: compact
      ? isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'
      : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    backgroundColor: isDark
      ? compact ? 'rgba(15,15,15,0.94)' : 'rgba(15,15,15,0.80)'
      : compact ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.80)',
    boxShadow: compact
      ? '0 12px 40px -12px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.06)'
      : '0 0 0 0 rgba(0,0,0,0), 0 0 0 0 rgba(0,0,0,0)',
    backdropFilter: compact ? 'blur(18px) saturate(180%)' : 'blur(12px) saturate(160%)',
    WebkitBackdropFilter: compact ? 'blur(18px) saturate(180%)' : 'blur(12px) saturate(160%)',
    transitionProperty: 'margin-top, width, border-radius, background-color, border-color, box-shadow, backdrop-filter, -webkit-backdrop-filter',
    transitionDuration: duration,
    transitionTimingFunction: EASE,
  };

  const rowStyle: React.CSSProperties = {
    paddingTop: compact ? 6 : 16,
    paddingBottom: compact ? 6 : 16,
    transitionProperty: 'padding',
    transitionDuration: duration,
    transitionTimingFunction: EASE,
  };

  const logoStyle: React.CSSProperties = {
    height: compact ? 28 : 40,
    width: 'auto',
    transitionProperty: 'height',
    transitionDuration: duration,
    transitionTimingFunction: EASE,
  };

  /** Width + opacity + slide, so secondary items fold away instead of just disappearing */
  const foldStyle = (hidden: boolean, maxWidth: number, pad = 12): React.CSSProperties => ({
    maxWidth: hidden ? 0 : maxWidth,
    opacity: hidden ? 0 : 1,
    transform: hidden && !reduceMotion ? 'translateX(-8px)' : 'translateX(0)',
    paddingLeft: hidden ? 0 : pad,
    paddingRight: hidden ? 0 : pad,
    pointerEvents: hidden ? 'none' : 'auto',
    transitionProperty: 'max-width, opacity, transform, padding',
    transitionDuration: duration,
    transitionTimingFunction: EASE,
  });

  const iconFocus = 'outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/70';
  const iconButton = cn(
    iconFocus,
    isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto" style={shellStyle}>
        <nav
          className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 md:px-6"
          style={rowStyle}
          aria-label="Navegação principal"
        >
          {/* Logo */}
          <Link href="/" className="flex flex-shrink-0 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
            <Image
              src={LOGO_URL}
              alt="Covialvi"
              width={200}
              height={70}
              className={cn(isDark && 'brightness-0 invert')}
              style={logoStyle}
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden items-center lg:flex">
            {navigation.map((item, index) => (
              <li
                key={item.name}
                className="overflow-hidden whitespace-nowrap"
                style={foldStyle(compact && !item.priority, 140)}
              >
                <Link
                  href={item.href}
                  tabIndex={compact && !item.priority ? -1 : 0}
                  className={cn(
                    'header-link-in group relative block rounded py-1 text-sm font-medium transition-colors duration-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500',
                    isDark ? 'text-gray-100 hover:text-yellow-400' : 'text-gray-900 hover:text-yellow-600'
                  )}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  {item.name}
                  {/* Underline grows from left to right on hover / focus */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-yellow-500 transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hidden items-center lg:flex">
            {/* Theme toggle - secondary, folds away in the compact bar */}
            <div className="overflow-hidden" style={foldStyle(false, 48)}>
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Modo claro' : 'Modo escuro'}
                className={cn('rounded-full p-2 transition-colors', iconButton)}
              >
                <span key={isDark ? 'sun' : 'moon'} className="theme-icon-swap flex">
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </span>
              </button>
            </div>

            {/* Ferramentas - folds away together with the Contacto pill once the bar is compact */}
            <div className="relative whitespace-nowrap" data-dropdown style={{ ...foldStyle(compact, 200, 4), overflow: compact ? "hidden" : "visible" }}>
              <button
                onClick={() => setFerramentasOpen(!ferramentasOpen)}
                aria-expanded={ferramentasOpen}
                className="flex items-center gap-1 rounded-full bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
              >
                Ferramentas
                <ChevronDown className={cn('h-4 w-4 transition-transform', ferramentasOpen && 'rotate-180')} />
              </button>
              {ferramentasOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card py-2 shadow-lg">
                  <a
                    href="https://simuladores.bancomontepio.pt/ITSCredit.External/Calculator/ITSCredit.Calculator.UI.External/calculator/HOUSINGJOURNEY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary"
                    onClick={() => setFerramentasOpen(false)}
                  >
                    <Calculator className="h-4 w-4 text-yellow-500" />
                    <div>
                      <div className="font-medium">Simulador de Crédito</div>
                      <div className="text-xs text-muted-foreground">Calcule a sua prestação</div>
                    </div>
                  </a>
                  <Link
                    href="/avaliacao-completa"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary"
                    onClick={() => setFerramentasOpen(false)}
                  >
                    <ClipboardList className="h-4 w-4 text-yellow-500" />
                    <div>
                      <div className="font-medium">Avaliação de Imóvel</div>
                      <div className="text-xs text-muted-foreground">Questionário completo</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Contact pill - secondary (the nav already has a Contacto link), folds away when compact */}
            <div className="overflow-hidden whitespace-nowrap" style={foldStyle(compact, 120)}>
              <Link
                href="/contacto"
                tabIndex={compact ? -1 : 0}
                className={cn(
                  'block rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500',
                  isDark
                    ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                    : 'border-gray-300 bg-white/60 text-gray-900 hover:bg-gray-100'
                )}
              >
                Contacto
              </Link>
            </div>

            {/* User / login - icon only */}
            {user ? (
              <div className="relative ml-1" data-dropdown>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  aria-label="Conta"
                  aria-expanded={userMenuOpen}
                  className={cn('cursor-pointer rounded-full p-2 transition-colors', iconButton)}
                >
                  <User className="h-4 w-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 z-[70] mt-2 w-52 rounded-xl border border-border bg-card py-2 shadow-lg">
                    <Link href="/conta" className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenuOpen(false)}>Minha Conta</Link>
                    <Link href="/conta/favoritos" className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenuOpen(false)}>Favoritos</Link>
                    {isAdmin && <Link href="/admin" className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenuOpen(false)}>Painel Admin</Link>}
                    <hr className="my-2 border-border" />
                    <button onClick={() => { setUserMenuOpen(false); window.location.href = '/auth/logout'; }} className="block w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10">Sair</button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                aria-label="Entrar"
                className={cn('ml-1 flex items-center justify-center rounded-full p-2 transition-colors', iconButton)}
              >
                <User className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn('rounded-lg p-2 transition-colors lg:hidden', isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100')}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            <MenuIcon open={mobileMenuOpen} />
          </button>
        </nav>

        {/* Mobile menu - opens below the bar, inside the same shell (grid rows 0fr -> 1fr, no fixed heights) */}
        <div
          className="grid lg:hidden"
          style={{
            gridTemplateRows: mobileMenuOpen ? '1fr' : '0fr',
            opacity: mobileMenuOpen ? 1 : 0,
            transitionProperty: 'grid-template-rows, opacity',
            transitionDuration: duration,
            transitionTimingFunction: EASE,
          }}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="max-h-[calc(100vh-110px)] space-y-4 overflow-y-auto border-t border-border/60 px-4 py-5 md:px-6">
              <div className="grid gap-3 md:grid-cols-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                    className="block rounded-xl px-1 py-2 text-base font-medium text-foreground transition-colors hover:text-yellow-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button onClick={toggleTheme} tabIndex={mobileMenuOpen ? 0 : -1} className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground">
                  {mounted && theme === 'dark' ? <><Sun className="h-4 w-4" /><span>Modo Claro</span></> : <><Moon className="h-4 w-4" /><span>Modo Escuro</span></>}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ferramentas</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <a
                    href="https://simuladores.bancomontepio.pt/ITSCredit.External/Calculator/ITSCredit.Calculator.UI.External/calculator/HOUSINGJOURNEY"
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={mobileMenuOpen ? 0 : -1}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-yellow-500/10 px-4 py-3 text-foreground"
                  >
                    <Calculator className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="text-sm font-medium">Simulador de Crédito</div>
                      <div className="text-xs text-muted-foreground">Calcule a sua prestação</div>
                    </div>
                  </a>
                  <Link
                    href="/avaliacao-completa"
                    tabIndex={mobileMenuOpen ? 0 : -1}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-yellow-500/10 px-4 py-3 text-foreground"
                  >
                    <ClipboardList className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="text-sm font-medium">Avaliação de Imóvel</div>
                      <div className="text-xs text-muted-foreground">Questionário completo</div>
                    </div>
                  </Link>
                </div>
              </div>

              <Link href="/contacto" tabIndex={mobileMenuOpen ? 0 : -1} onClick={() => setMobileMenuOpen(false)} className="block rounded-xl bg-foreground py-3 text-center text-sm font-medium text-background">
                Contacto
              </Link>

              <hr className="border-border" />

              {user ? (
                <div className="space-y-2">
                  <Link href="/conta" tabIndex={mobileMenuOpen ? 0 : -1} className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Minha Conta</Link>
                  <Link href="/conta/favoritos" tabIndex={mobileMenuOpen ? 0 : -1} className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Favoritos</Link>
                  {isAdmin && <Link href="/admin" tabIndex={mobileMenuOpen ? 0 : -1} className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Painel Admin</Link>}
                  <button onClick={() => { setMobileMenuOpen(false); window.location.href = '/auth/logout'; }} tabIndex={mobileMenuOpen ? 0 : -1} className="block py-2 text-sm font-medium text-destructive">Sair</button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <Link href="/auth/login" tabIndex={mobileMenuOpen ? 0 : -1} onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full">Entrar</Button></Link>
                  <Link href="/auth/registar" tabIndex={mobileMenuOpen ? 0 : -1} onClick={() => setMobileMenuOpen(false)}><Button className="w-full">Criar Conta</Button></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
