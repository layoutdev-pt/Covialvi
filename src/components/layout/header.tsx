'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, User, ChevronDown, Search, Sun, Moon, Calculator, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/providers/auth-provider';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';


export function Header() {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [ferramentasOpen, setFerramentasOpen] = useState(false);
  // Non-homepage always starts as pill; homepage starts transparent
  const [scrolled, setScrolled] = useState(false);
  
  // Filter states
  const [searchLocation, setSearchLocation] = useState('');
  const [searchNature, setSearchNature] = useState('');
  const [searchBusinessType, setSearchBusinessType] = useState('');

  const isHomePage = pathname === '/';

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navigation = [
    { name: t('home') || 'Início', href: '/' },
    { name: t('about') || 'Sobre Nós', href: '/sobre' },
    { name: t('services') || 'Serviços', href: '/servicos' },
    { name: t('properties'), href: '/imoveis' },
    { name: t('contact') || 'Contacto', href: '/contacto' },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (searchNature) params.set('nature', searchNature);
    if (searchBusinessType) params.set('business_type', searchBusinessType);
    
    const queryString = params.toString();
    router.push(`/imoveis${queryString ? `?${queryString}` : ''}`);
    setShowFilters(false);
  };

  // Non-homepage: always pill (even before mount — no flash needed)
  // Homepage: transparent at top, pill after scroll
  const isPill = !isHomePage || (mounted && scrolled);
  const isTransparent = isHomePage && !(mounted && scrolled);

  // Derived color helpers — explicit, not relying on CSS variables that may not resolve
  const pillBg = mounted && theme === 'dark' ? 'rgba(15,15,15,0.96)' : 'rgba(255,255,255,0.97)';
  const pillBorder = mounted && theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">

      {/* Outer centering wrapper — uses CSS flex when pill */}
      <div
        className={cn(
          'pointer-events-auto transition-all duration-[450ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
          isPill ? 'flex justify-center pt-3' : 'block pt-0'
        )}
      >
        {/* Width-limiting wrapper */}
        <motion.div
          className="w-full"
          animate={{ maxWidth: isPill ? '780px' : '9999px' }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Visual pill shell */}
          <motion.div
            animate={isPill ? {
              borderRadius: '9999px',
              backgroundColor: pillBg,
              boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
              borderWidth: '1px',
              borderColor: pillBorder,
            } : {
              borderRadius: '0px',
              backgroundColor: 'rgba(0,0,0,0)',
              boxShadow: 'none',
              borderWidth: '0px',
              borderColor: 'rgba(0,0,0,0)',
            }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ borderStyle: 'solid', backdropFilter: isPill ? 'blur(20px) saturate(180%)' : 'none' }}
          >
            <nav
              className="px-6 md:px-8 flex items-center justify-between"
              style={{ height: isPill ? '56px' : '80px', transition: 'height 0.45s cubic-bezier(0.25,0.46,0.45,0.94)' }}
            >
              {/* Logo */}
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Image
                  src="https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png"
                  alt="Covialvi"
                  width={200}
                  height={70}
                  className="w-auto transition-all duration-500"
                  style={{
                    height: isTransparent ? '44px' : '36px',
                    filter: isTransparent
                      ? 'brightness(0) invert(1)'
                      : (mounted && theme === 'dark')
                        ? 'brightness(0) invert(1)'
                        : 'none',
                  }}
                  priority
                />
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium transition-colors whitespace-nowrap hover:text-yellow-500"
                    style={{
                      color: isTransparent
                        ? 'rgba(255,255,255,0.90)'
                        : (mounted && theme === 'dark')
                          ? 'rgb(243,244,246)'
                          : 'rgb(17,24,39)',
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-1.5">
                {/* Tools visible only in transparent (hero) mode */}
                {isTransparent && (
                  <>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                    <div className="relative" data-dropdown>
                      <button
                        onClick={() => setFerramentasOpen(!ferramentasOpen)}
                        className="flex items-center gap-1 px-4 py-2 rounded-full bg-yellow-500 text-white font-medium text-sm hover:bg-yellow-600 transition-colors"
                      >
                        Ferramentas
                        <ChevronDown className={cn('h-4 w-4 transition-transform', ferramentasOpen && 'rotate-180')} />
                      </button>
                      {ferramentasOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border py-2 z-50">
                          <a
                            href="https://simuladores.bancomontepio.pt/ITSCredit.External/Calculator/ITSCredit.Calculator.UI.External/calculator/HOUSINGJOURNEY"
                            target="_blank" rel="noopener noreferrer"
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
                    <Link
                      href="/contacto"
                      className="px-4 py-1.5 rounded-full font-medium text-sm bg-white/15 text-white hover:bg-white/25 border border-white/20 transition-all"
                    >
                      Contacto
                    </Link>
                  </>
                )}

                {/* User icon — always visible */}
                {user ? (
                  <div className="relative" data-dropdown>
                    <button
                      onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                      className={cn(
                        'p-2 rounded-full transition-colors cursor-pointer',
                        isTransparent
                          ? 'text-white/70 hover:text-white hover:bg-white/10'
                          : mounted && theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-white/10'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      )}
                    >
                      <User className="h-4 w-4" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-card rounded-xl shadow-lg border border-border py-2 z-[70]">
                        <Link href="/conta" className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenuOpen(false)}>Minha Conta</Link>
                        <Link href="/conta/favoritos" className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenuOpen(false)}>Favoritos</Link>
                        {isAdmin && <Link href="/admin" className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenuOpen(false)}>Painel Admin</Link>}
                        <hr className="my-2 border-border" />
                        <button onClick={() => { setUserMenuOpen(false); window.location.href = '/auth/logout'; }} className="block w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10">Sair</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className={cn(
                      'p-2 rounded-full transition-colors flex items-center justify-center',
                      isTransparent
                        ? 'text-white/70 hover:text-white hover:bg-white/10'
                        : mounted && theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <User className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className={cn(
                  'lg:hidden p-2 rounded-lg transition-colors',
                  isTransparent
                    ? 'text-white hover:bg-white/10'
                    : mounted && theme === 'dark'
                      ? 'text-gray-200 hover:bg-white/10'
                      : 'text-gray-800 hover:bg-gray-100'
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </nav>

            {/* Filter Bar — inside pill shell */}
            {showFilters && (
              <div className="border-t border-border/50 px-6 py-4">
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Localização..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 min-w-[180px] px-4 py-2.5 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  />
                  <Select value={searchNature} onValueChange={setSearchNature}>
                    <SelectTrigger className="rounded-full border-border min-w-[140px]"><SelectValue placeholder="Tipo de Imóvel" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      <SelectItem value="apartment">Apartamento</SelectItem>
                      <SelectItem value="house">Moradia</SelectItem>
                      <SelectItem value="land">Terreno</SelectItem>
                      <SelectItem value="commercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={searchBusinessType} onValueChange={setSearchBusinessType}>
                    <SelectTrigger className="rounded-full border-border min-w-[110px]"><SelectValue placeholder="Negócio" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="sale">Comprar</SelectItem>
                      <SelectItem value="rent">Arrendar</SelectItem>
                    </SelectContent>
                  </Select>
                  <button onClick={handleSearch} className="bg-foreground text-background rounded-full px-5 py-2.5 font-medium hover:opacity-90 flex items-center gap-2">
                    <Search className="h-4 w-4" /> Pesquisar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile Menu — full width dropdown below navbar */}
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 bg-background border-b border-border shadow-lg transition-all duration-300 ease-in-out z-40',
          isPill ? 'top-[68px]' : 'top-[80px]',
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none invisible'
        )}
      >
        <div className="px-6 py-6 space-y-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block text-base font-medium text-foreground hover:text-yellow-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm">
              {mounted && theme === 'dark' ? <><Sun className="h-4 w-4" /><span>Modo Claro</span></> : <><Moon className="h-4 w-4" /><span>Modo Escuro</span></>}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ferramentas</p>
            <a
              href="https://simuladores.bancomontepio.pt/ITSCredit.External/Calculator/ITSCredit.Calculator.UI.External/calculator/HOUSINGJOURNEY"
              target="_blank" rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-4 rounded-xl bg-yellow-500/10 text-foreground"
            >
              <Calculator className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="font-medium text-sm">Simulador de Crédito</div>
                <div className="text-xs text-muted-foreground">Calcule a sua prestação</div>
              </div>
            </a>
            <Link href="/avaliacao-completa" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-yellow-500/10 text-foreground">
              <ClipboardList className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="font-medium text-sm">Avaliação de Imóvel</div>
                <div className="text-xs text-muted-foreground">Questionário completo</div>
              </div>
            </Link>
          </div>

          <Link href="/contacto" onClick={() => setMobileMenuOpen(false)} className="block text-center py-3 rounded-xl bg-foreground text-background font-medium text-sm">
            Contacto
          </Link>

          <hr className="border-border" />

          {user ? (
            <div className="space-y-2">
              <Link href="/conta" className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Minha Conta</Link>
              <Link href="/conta/favoritos" className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Favoritos</Link>
              {isAdmin && <Link href="/admin" className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Painel Admin</Link>}
              <button onClick={() => { setMobileMenuOpen(false); window.location.href = '/auth/logout'; }} className="block py-2 text-sm font-medium text-destructive">Sair</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full">Entrar</Button></Link>
              <Link href="/auth/registar" onClick={() => setMobileMenuOpen(false)}><Button className="w-full">Criar Conta</Button></Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
