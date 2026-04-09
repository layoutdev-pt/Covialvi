'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, ChevronDown, Search, Calculator, ClipboardList } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [ferramentasOpen, setFerramentasOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchNature, setSearchNature] = useState('');
  const [searchBusinessType, setSearchBusinessType] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Sobre Nós', href: '/sobre' },
    { name: 'Serviços', href: '/servicos' },
    { name: 'Imóveis', href: '/imoveis' },
    { name: 'Contacto', href: '/contacto' },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (searchNature) params.set('nature', searchNature);
    if (searchBusinessType) params.set('business_type', searchBusinessType);
    const queryString = params.toString();
    router.push(`/imoveis${queryString ? `?${queryString}` : ''}`);
    setShowSearchBar(false);
  };

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ── Windows 2000 Taskbar ── */}
      <div
        style={{
          background: 'linear-gradient(to bottom, #1c6ec8 0%, #0a3492 45%, #0d47ab 100%)',
          borderBottom: '1px solid #1a4fa0',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 4px',
          gap: '2px',
        }}
      >
        {/* Start button */}
        <button
          className="flex items-center gap-1 px-3 h-[26px] text-white text-xs font-bold"
          style={{
            background: 'linear-gradient(to bottom, #3d8e3d 0%, #1e5f1e 100%)',
            borderTop: '1px solid #6fc46f',
            borderLeft: '1px solid #6fc46f',
            borderRight: '1px solid #144014',
            borderBottom: '1px solid #144014',
            borderRadius: '2px',
            fontFamily: 'Tahoma, Arial, sans-serif',
            fontSize: '12px',
            letterSpacing: '0.5px',
            cursor: 'pointer',
          }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Image
            src="https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png"
            alt="Covialvi"
            width={16}
            height={16}
            className="w-4 h-4 brightness-0 invert"
          />
          <span className="italic">start</span>
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '24px', background: '#0a3492', borderRight: '1px solid #4a8fd4', marginLeft: '2px', marginRight: '2px' }} />

        {/* Quick Launch area — nav links as taskbar buttons */}
        <div className="hidden md:flex items-center gap-0.5">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '26px',
                padding: '0 10px',
                fontFamily: 'Tahoma, Arial, sans-serif',
                fontSize: '12px',
                color: '#fff',
                textDecoration: 'none',
                background: pathname === item.href
                  ? 'rgba(0,0,0,0.35)'
                  : 'transparent',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.href) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.href) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* System tray area */}
        <div className="flex items-center gap-2 px-2">
          {/* Search icon */}
          <button
            onClick={() => setShowSearchBar(!showSearchBar)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '2px', display: 'flex', alignItems: 'center' }}
            title="Pesquisar"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          {/* Ferramentas dropdown */}
          <div className="relative hidden md:block" data-dropdown>
            <button
              onClick={() => setFerramentasOpen(!ferramentasOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#fff',
                fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '2px',
              }}
            >
              Ferramentas <ChevronDown className="h-3 w-3" />
            </button>
            {ferramentasOpen && (
              <div
                style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: '2px',
                  background: '#d4d0c8', zIndex: 60, minWidth: '220px',
                  borderTop: '2px solid #fff',
                  borderLeft: '2px solid #fff',
                  borderRight: '2px solid #808080',
                  borderBottom: '2px solid #808080',
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                }}
              >
                <a
                  href="https://simuladores.bancomontepio.pt/ITSCredit.External/Calculator/ITSCredit.Calculator.UI.External/calculator/HOUSINGJOURNEY"
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', color: '#000', textDecoration: 'none', fontFamily: 'Tahoma, Arial', fontSize: '12px' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#000'; }}
                  onClick={() => setFerramentasOpen(false)}
                >
                  <Calculator className="h-4 w-4" />
                  Simulador de Crédito
                </a>
                <Link
                  href="/avaliacao-completa"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', color: '#000', textDecoration: 'none', fontFamily: 'Tahoma, Arial', fontSize: '12px' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#000'; }}
                  onClick={() => setFerramentasOpen(false)}
                >
                  <ClipboardList className="h-4 w-4" />
                  Avaliação de Imóvel
                </Link>
              </div>
            )}
          </div>

          {/* System clock area */}
          <div
            style={{
              background: 'rgba(0,0,0,0.2)',
              borderTop: '1px solid #0a3492',
              borderLeft: '1px solid #0a3492',
              borderRight: '1px solid #4a8fd4',
              borderBottom: '1px solid #4a8fd4',
              padding: '1px 8px',
              color: '#fff',
              fontFamily: 'Tahoma, Arial, sans-serif',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '22px',
            }}
          >
            {/* User icon */}
            {user ? (
              <div className="relative" data-dropdown>
                <button
                  onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'Tahoma, Arial', fontSize: '11px' }}
                >
                  <User className="h-3 w-3" />
                  {profile?.full_name?.split(' ')[0] || 'Utilizador'}
                </button>
                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute', right: 0, bottom: '100%', marginBottom: '2px',
                      background: '#d4d0c8', zIndex: 70, minWidth: '160px',
                      borderTop: '2px solid #fff', borderLeft: '2px solid #fff',
                      borderRight: '2px solid #808080', borderBottom: '2px solid #808080',
                      boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                    }}
                  >
                    <Link href="/conta" style={{ display: 'block', padding: '5px 10px', color: '#000', textDecoration: 'none', fontFamily: 'Tahoma, Arial', fontSize: '12px' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#000'; }} onClick={() => setUserMenuOpen(false)}>Minha Conta</Link>
                    <Link href="/conta/favoritos" style={{ display: 'block', padding: '5px 10px', color: '#000', textDecoration: 'none', fontFamily: 'Tahoma, Arial', fontSize: '12px' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#000'; }} onClick={() => setUserMenuOpen(false)}>Favoritos</Link>
                    {isAdmin && <Link href="/admin" style={{ display: 'block', padding: '5px 10px', color: '#000', textDecoration: 'none', fontFamily: 'Tahoma, Arial', fontSize: '12px' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#000'; }} onClick={() => setUserMenuOpen(false)}>Painel Admin</Link>}
                    <div style={{ height: '1px', background: '#808080', borderBottom: '1px solid #fff', margin: '2px 0' }} />
                    <button onClick={() => { setUserMenuOpen(false); window.location.href = '/auth/logout'; }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 10px', color: '#c00', background: 'none', border: 'none', fontFamily: 'Tahoma, Arial', fontSize: '12px', cursor: 'pointer' }}>Sair</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'Tahoma, Arial', fontSize: '11px' }}>
                <User className="h-3 w-3" /> Entrar
              </Link>
            )}
            <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '6px' }}>
              <WinClock />
            </span>
          </div>
        </div>
      </div>

      {/* Search bar dropdown (below taskbar) */}
      {showSearchBar && (
        <div
          style={{
            background: '#d4d0c8',
            borderBottom: '2px solid #808080',
            padding: '6px 12px',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Localização..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="win-inset"
            style={{ padding: '2px 6px', fontFamily: 'Tahoma, Arial', fontSize: '12px', width: '160px' }}
          />
          <select value={searchNature} onChange={(e) => setSearchNature(e.target.value)} className="win-select">
            <option value="">Tipo</option>
            <option value="apartment">Apartamento</option>
            <option value="house">Moradia</option>
            <option value="land">Terreno</option>
            <option value="commercial">Comercial</option>
          </select>
          <select value={searchBusinessType} onChange={(e) => setSearchBusinessType(e.target.value)} className="win-select">
            <option value="">Negócio</option>
            <option value="sale">Comprar</option>
            <option value="rent">Arrendar</option>
          </select>
          <button onClick={handleSearch} className="win-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Search className="h-3 w-3" /> Pesquisar
          </button>
        </div>
      )}

      {/* Mobile Start-menu dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute', top: '32px', left: '0',
            background: '#d4d0c8',
            borderTop: '2px solid #fff', borderLeft: '2px solid #fff',
            borderRight: '2px solid #808080', borderBottom: '2px solid #808080',
            width: '240px', zIndex: 60,
            boxShadow: '3px 3px 6px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header strip */}
          <div
            style={{
              background: 'linear-gradient(to bottom, #2462c8, #0a3492)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Image src="https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png" alt="Covialvi" width={32} height={32} className="w-8 h-8 brightness-0 invert" />
            <span style={{ color: '#fff', fontFamily: 'Tahoma, Arial', fontSize: '14px', fontWeight: 'bold' }}>Covialvi</span>
          </div>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 16px', color: '#000', textDecoration: 'none', fontFamily: 'Tahoma, Arial', fontSize: '13px' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#000'; }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div style={{ height: '1px', background: '#808080', borderBottom: '1px solid #fff', margin: '4px 0' }} />
          <a
            href="https://simuladores.bancomontepio.pt/ITSCredit.External/Calculator/ITSCredit.Calculator.UI.External/calculator/HOUSINGJOURNEY"
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 16px', color: '#000', textDecoration: 'none', fontFamily: 'Tahoma, Arial', fontSize: '13px' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#000'; }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Calculator className="h-4 w-4" /> Simulador de Crédito
          </a>
          <Link
            href="/avaliacao-completa"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 16px', color: '#000', textDecoration: 'none', fontFamily: 'Tahoma, Arial', fontSize: '13px' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#000'; }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <ClipboardList className="h-4 w-4" /> Avaliação de Imóvel
          </Link>
        </div>
      )}
    </header>
  );
}

function WinClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);
  return <span>{time}</span>;
}
