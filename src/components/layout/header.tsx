'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, ChevronDown, Search, Sun, Moon } from 'lucide-react';
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
  
  // Filter states
  const [searchLocation, setSearchLocation] = useState('');
  const [searchNature, setSearchNature] = useState('');
  const [searchBusinessType, setSearchBusinessType] = useState('');

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setUserMenuOpen(false);
      }
    };
    
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navigation = [
    { name: t('home') || 'Início', href: '/' },
    { name: t('about') || 'Sobre Nós', href: '/sobre' },
    { name: t('services') || 'Serviços', href: '/servicos' },
    { name: t('properties'), href: '/imoveis' },
  ];

  const isHomePage = pathname === '/';

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (searchNature) params.set('nature', searchNature);
    if (searchBusinessType) params.set('business_type', searchBusinessType);
    
    const queryString = params.toString();
    router.push(`/imoveis${queryString ? `?${queryString}` : ''}`);
    setShowFilters(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 flex items-center justify-between h-20 relative z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png"
            alt="Covialvi"
            width={200}
            height={70}
            className="h-16 w-auto dark:brightness-0 dark:invert"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2 relative z-50">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Unified CTA Button */}
          <Link
            href="/servicos"
            className="px-4 py-2 rounded-full bg-yellow-500 text-white font-medium text-sm hover:bg-yellow-600 transition-colors"
          >
            Serviços
          </Link>
          
          {/* Contact Button - Simple */}
          <Link 
            href="/contacto"
            className="px-4 py-2 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-all"
          >
            Contacto
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="relative" data-dropdown>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <User className="h-4 w-4" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-card rounded-xl shadow-lg border border-border py-2 z-50">
                  <Link
                    href="/conta"
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Minha Conta
                  </Link>
                  <Link
                    href="/conta/favoritos"
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Favoritos
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Painel Admin
                    </Link>
                  )}
                  <hr className="my-2 border-border" />
                  <button
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await signOut();
                      window.location.href = '/';
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => { window.location.href = '/auth/login'; }}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <User className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Filter Bar Dropdown */}
      <div
        className={cn(
          'absolute left-0 right-0 bg-background border-b border-border shadow-lg transition-all duration-300 overflow-hidden',
          showFilters ? 'max-h-32 opacity-100 z-40' : 'max-h-0 opacity-0 pointer-events-none -z-10'
        )}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20 py-4">
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Localização..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <Select value={searchNature} onValueChange={setSearchNature}>
              <SelectTrigger className="rounded-full border-border min-w-[150px]">
                <SelectValue placeholder="Tipo de Imóvel" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="apartment">Apartamento</SelectItem>
                <SelectItem value="house">Moradia</SelectItem>
                <SelectItem value="land">Terreno</SelectItem>
                <SelectItem value="commercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={searchBusinessType} onValueChange={setSearchBusinessType}>
              <SelectTrigger className="rounded-full border-border min-w-[120px]">
                <SelectValue placeholder="Negócio" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sale">Comprar</SelectItem>
                <SelectItem value="rent">Arrendar</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={handleSearch}
              className="bg-foreground text-background rounded-full px-6 py-2.5 font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Pesquisar
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 top-20 bg-background border-b border-border transition-all duration-300 ease-in-out',
          mobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        )}
      >
        <div className="px-6 py-6 space-y-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block text-lg font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Mobile Theme Toggle */}
          <div className="flex justify-end py-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-foreground"
            >
              {mounted && theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span className="text-sm">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span className="text-sm">Escuro</span>
                </>
              )}
            </button>
          </div>
          
          {/* Mobile Serviços CTA */}
          <Link
            href="/servicos"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center py-3 rounded-xl bg-yellow-500 text-white font-medium"
          >
            Serviços
          </Link>
          
          {/* Mobile Contact Button */}
          <Link
            href="/contacto"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center py-3 rounded-xl bg-foreground text-background font-medium"
          >
            Contacto
          </Link>
          
          <hr className="border-border" />
          
          {/* Mobile Filter */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Localização..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select value={searchNature} onValueChange={setSearchNature}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Moradia</SelectItem>
                  <SelectItem value="land">Terreno</SelectItem>
                </SelectContent>
              </Select>
              <Select value={searchBusinessType} onValueChange={setSearchBusinessType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Negócio" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sale">Comprar</SelectItem>
                  <SelectItem value="rent">Arrendar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={() => {
                handleSearch();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-foreground text-background rounded-xl py-3 font-medium"
            >
              Pesquisar
            </button>
          </div>
          
          <hr className="border-border" />
          {user ? (
            <>
              <Link
                href="/conta"
                className="block text-lg font-medium text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Minha Conta
              </Link>
              <Link
                href="/conta/favoritos"
                className="block text-lg font-medium text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Favoritos
              </Link>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await signOut();
                  window.location.href = '/';
                }}
                className="block text-lg font-medium text-destructive"
              >
                Sair
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-3">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/registar" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-foreground text-background">
                  Criar Conta
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
