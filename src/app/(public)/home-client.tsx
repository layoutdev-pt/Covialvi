'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Home,
  Leaf,
  Palmtree,
  Search,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Eye,
  Target,
  ArrowRight,
  ArrowUpRight,
  Play,
  Star,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const WhatsAppButton = dynamic(() => import('@/components/ui/whatsapp-button').then(mod => mod.WhatsAppButton), { ssr: false });

interface HomeClientProps {
  properties: any[];
  featuredProperties: any[];
  stats: { properties: number; projects: number; clients: number; value: string; };
  heroProperty: any | null;
  availableLocations: { districts: string[]; municipalities: string[]; };
}

// ─── Win2K primitives ────────────────────────────────────────────────────────

function WinWindow({ title, children, className = '', icon }: { title: string; children: React.ReactNode; className?: string; icon?: React.ReactNode }) {
  return (
    <div
      className={className}
      style={{
        background: '#d4d0c8',
        borderTop: '2px solid #ffffff',
        borderLeft: '2px solid #ffffff',
        borderRight: '2px solid #404040',
        borderBottom: '2px solid #404040',
        boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: 'linear-gradient(to right, #0a246a 0%, #a6caf0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '3px 6px',
          height: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {icon && <span style={{ fontSize: '12px' }}>{icon}</span>}
          <span style={{ color: '#fff', fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          {['_', '□', '✕'].map((c) => (
            <span key={c} style={{
              width: '16px', height: '14px',
              background: '#d4d0c8',
              borderTop: '1px solid #fff', borderLeft: '1px solid #fff',
              borderRight: '1px solid #808080', borderBottom: '1px solid #808080',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', color: '#000',
            }}>{c}</span>
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: '8px' }}>
        {children}
      </div>
    </div>
  );
}

function WinBtn({ children, onClick, primary = false, style = {} }: { children: React.ReactNode; onClick?: () => void; primary?: boolean; style?: React.CSSProperties }) {
  const [active, setActive] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
      style={{
        background: '#d4d0c8',
        borderTop: active ? '2px solid #808080' : '2px solid #ffffff',
        borderLeft: active ? '2px solid #808080' : '2px solid #ffffff',
        borderRight: active ? '2px solid #ffffff' : '2px solid #808080',
        borderBottom: active ? '2px solid #ffffff' : '2px solid #808080',
        padding: active ? '4px 11px 2px 13px' : '3px 16px',
        fontFamily: 'Tahoma, Arial, sans-serif',
        fontSize: '13px',
        cursor: 'pointer',
        color: '#000',
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        minWidth: '80px',
        justifyContent: 'center',
        boxShadow: primary ? 'inset 0 0 0 1px #000' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function WinSeparator() {
  return (
    <div style={{ height: '2px', borderTop: '1px solid #808080', borderBottom: '1px solid #ffffff', margin: '6px 0' }} />
  );
}

function WinLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '13px', color: '#000' }}>
      {children}
    </span>
  );
}

// Animated Counter
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const increment = Math.ceil(value / 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); } else { setCount(start); }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function HomeClient({ properties, featuredProperties, stats, heroProperty, availableLocations }: HomeClientProps) {
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchNature, setSearchNature] = useState('');
  const [searchBusinessType, setSearchBusinessType] = useState('');
  const [activeService, setActiveService] = useState(0);
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError('');
    setContactSuccess(false);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${contactForm.firstName} ${contactForm.lastName}`.trim(), email: contactForm.email, phone: contactForm.phone, message: contactForm.message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao enviar mensagem');
      setContactSuccess(true);
      setContactForm({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setContactError(err.message || 'Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setContactLoading(false);
    }
  };

  const filteredProperties = properties.filter((property: any) => {
    let matches = true;
    if (searchLocation && searchLocation !== 'all') {
      if (searchLocation.startsWith('municipality:')) {
        const municipality = searchLocation.replace('municipality:', '');
        matches = matches && property.municipality === municipality;
      } else if (searchLocation.startsWith('district:')) {
        const district = searchLocation.replace('district:', '');
        matches = matches && property.district === district;
      } else {
        const loc = searchLocation.toLowerCase();
        matches = matches && (property.municipality?.toLowerCase() === loc || property.district?.toLowerCase() === loc);
      }
    }
    if (searchNature && searchNature !== 'all') matches = matches && property.nature === searchNature;
    if (searchBusinessType && searchBusinessType !== 'all') matches = matches && property.business_type === searchBusinessType;
    return matches;
  });

  const heroProperties = filteredProperties.slice(0, 3);

  const handleSearch = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Sob Consulta';
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price) + ' €';
  };

  const businessTypeLabels: Record<string, string> = { sale: 'Venda', rent: 'Arrendamento', transfer: 'Trespasse' };

  const services = [
    { id: 0, icon: Home, title: 'Residências de Luxo', shortTitle: 'LUXO', description: 'Propriedades exclusivas com design premium e localizações privilegiadas em Portugal.', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075' },
    { id: 1, icon: Leaf, title: 'Edifícios Sustentáveis', shortTitle: 'ECO', description: 'Imóveis com certificação energética A+, materiais eco e tecnologia verde integrada.', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053' },
    { id: 2, icon: Palmtree, title: 'Casas de Férias', shortTitle: 'FÉRIAS', description: 'Casas de férias em destinos premium — ideal para uso próprio ou arrendamento de alto retorno.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070' },
  ];

  // Windows desktop tiled background
  const desktopStyle: React.CSSProperties = {
    background: '#008080',          // classic Win2K teal desktop
    minHeight: '100vh',
    padding: '8px',
    fontFamily: 'Tahoma, Arial, sans-serif',
  };

  return (
    <main style={desktopStyle}>

      {/* ── HERO WINDOW ── */}
      <WinWindow
        title="Covialvi Imobiliária - Pesquisa de Imóveis"
        icon="🏠"
        className="mb-4 w-full"
      >
        <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
          {/* Left panel - video/image */}
          <div style={{ flex: '1 1 400px', minHeight: '340px', position: 'relative', background: '#000', border: '2px inset #808080' }}>
            <video
              autoPlay muted loop playsInline
              poster="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '340px' }}
            >
              <source src="/video/hero.mp4" type="video/mp4" />
            </video>
            {/* Marquee-style overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(0,36,106,0.85)',
              borderTop: '2px solid #a6caf0',
              padding: '4px 8px',
              overflow: 'hidden',
            }}>
              <marquee style={{ color: '#fff', fontFamily: 'Tahoma, Arial', fontSize: '12px' }}>
                🏠 Covialvi Imobiliária — Encontre a sua casa ideal hoje! | {stats.properties}+ imóveis disponíveis | {stats.clients}+ clientes satisfeitos | Valor em projetos: {stats.value}€ | Contacte-nos agora!
              </marquee>
            </div>
          </div>

          {/* Right panel - search */}
          <div style={{ flex: '0 0 280px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Welcome message box */}
            <div style={{
              background: '#fff', border: '2px inset #808080',
              padding: '8px', fontFamily: 'Tahoma, Arial', fontSize: '13px', color: '#000'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#0a246a' }}>
                Bem-vindo à Covialvi!
              </div>
              <div style={{ fontSize: '12px', color: '#444' }}>
                Oferecemos soluções imobiliárias personalizadas em Portugal. Utilize a pesquisa abaixo para encontrar o seu imóvel ideal.
              </div>
            </div>

            {/* Stats group */}
            <fieldset style={{ border: '2px groove #808080', padding: '8px', fontFamily: 'Tahoma, Arial' }}>
              <legend style={{ fontWeight: 'bold', fontSize: '12px', padding: '0 4px' }}>Estatísticas</legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { label: 'Imóveis', value: stats.properties, suffix: '+' },
                  { label: 'Clientes', value: stats.clients, suffix: '+' },
                  { label: 'Valor', value: 10, suffix: 'M€+' },
                  { label: 'Anos exp.', value: 30, suffix: '+' },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center', background: '#fff', border: '1px inset #808080', padding: '4px 2px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0a246a' }}>
                      <AnimatedCounter value={s.value} suffix={s.suffix} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#555' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Search group */}
            <fieldset style={{ border: '2px groove #808080', padding: '8px', fontFamily: 'Tahoma, Arial' }}>
              <legend style={{ fontWeight: 'bold', fontSize: '12px', padding: '0 4px' }}>Pesquisar Imóveis</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Localização:</label>
                <select
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="win-select"
                  style={{ width: '100%' }}
                >
                  <option value="">Todas as localizações</option>
                  {availableLocations.municipalities.map((m) => (
                    <option key={`municipality:${m}`} value={`municipality:${m}`}>{m}</option>
                  ))}
                  {availableLocations.districts.map((d) => (
                    <option key={`district:${d}`} value={`district:${d}`}>{d}</option>
                  ))}
                </select>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tipo:</label>
                <select value={searchNature} onChange={(e) => setSearchNature(e.target.value)} className="win-select" style={{ width: '100%' }}>
                  <option value="">Todos</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Moradia</option>
                  <option value="land">Terreno</option>
                  <option value="commercial">Comercial</option>
                  <option value="warehouse">Armazém</option>
                  <option value="shop">Loja</option>
                </select>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Negócio:</label>
                <select value={searchBusinessType} onChange={(e) => setSearchBusinessType(e.target.value)} className="win-select" style={{ width: '100%' }}>
                  <option value="">Todos</option>
                  <option value="sale">Comprar</option>
                  <option value="rent">Arrendar</option>
                </select>
                <WinBtn onClick={handleSearch} primary>
                  <Search className="h-3 w-3" /> Pesquisar
                </WinBtn>
              </div>
            </fieldset>
          </div>
        </div>
      </WinWindow>

      {/* ── FEATURED PROPERTIES WINDOW ── */}
      <div ref={resultsRef}>
        <WinWindow title="Imóveis em Destaque — Resultados" icon="🔍" className="mb-4 w-full">
          {heroProperties.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
              {heroProperties.map((property: any) => (
                <HeroPropertyCard key={property.id} property={property} formatPrice={formatPrice} businessTypeLabels={businessTypeLabels} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', background: '#fff', border: '2px inset #808080' }}>
              <Building2 className="h-10 w-10 mx-auto mb-2" style={{ color: '#808080' }} />
              <p style={{ fontFamily: 'Tahoma, Arial', fontSize: '13px', color: '#444' }}>Nenhum imóvel encontrado com os filtros selecionados.</p>
            </div>
          )}
        </WinWindow>
      </div>

      {/* ── TWO-COLUMN ROW: Services + About ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }} className="flex-wrap-win">

        {/* Services Window */}
        <WinWindow title="Os Nossos Serviços" icon="⚙️">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {services.map((service, index) => (
              <button
                key={service.id}
                onClick={() => setActiveService(index)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 8px', cursor: 'pointer', fontFamily: 'Tahoma, Arial', fontSize: '13px',
                  background: activeService === index ? '#0a246a' : '#d4d0c8',
                  color: activeService === index ? '#fff' : '#000',
                  borderTop: '1px solid ' + (activeService === index ? '#0a246a' : '#fff'),
                  borderLeft: '1px solid ' + (activeService === index ? '#0a246a' : '#fff'),
                  borderRight: '1px solid ' + (activeService === index ? '#0a246a' : '#808080'),
                  borderBottom: '1px solid ' + (activeService === index ? '#0a246a' : '#808080'),
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <service.icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{service.title}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>{service.shortTitle}</div>
                </div>
              </button>
            ))}
            <WinSeparator />
            <div style={{ background: '#fff', border: '2px inset #808080', padding: '6px', fontSize: '12px', color: '#000', fontFamily: 'Tahoma, Arial' }}>
              {services[activeService].description}
            </div>
            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', border: '2px inset #808080' }}>
              <Image src={services[activeService].image} alt={services[activeService].title} fill className="object-cover" />
            </div>
          </div>
        </WinWindow>

        {/* About Window */}
        <WinWindow title="Quem Somos — Covialvi Imobiliária" icon="ℹ️">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ position: 'relative', height: '180px', border: '2px inset #808080', overflow: 'hidden' }}>
              <Image src="/team-covialvi.png" alt="Equipa Covialvi" fill className="object-cover" />
              {/* Floating badge */}
              <div style={{
                position: 'absolute', bottom: '8px', right: '8px',
                background: '#0a246a', color: '#fff',
                fontFamily: 'Tahoma, Arial', fontSize: '13px', fontWeight: 'bold',
                padding: '6px 10px',
                borderTop: '2px solid #a6caf0', borderLeft: '2px solid #a6caf0',
                borderRight: '2px solid #040e2e', borderBottom: '2px solid #040e2e',
              }}>
                90%<br /><span style={{ fontSize: '10px', fontWeight: 'normal' }}>Retenção</span>
              </div>
            </div>
            <div style={{ background: '#fff', border: '2px inset #808080', padding: '8px', fontFamily: 'Tahoma, Arial', fontSize: '12px', color: '#000' }}>
              <strong style={{ color: '#0a246a' }}>REDEFININDO EXCELÊNCIA NO IMOBILIÁRIO</strong>
              <p style={{ marginTop: '4px' }}>Especializamo-nos em propriedades de luxo, casas sustentáveis e arrendamentos de férias — movidos pela paixão por uma vida excecional.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {[
                { label: 'Visão', icon: '👁️', text: 'Ser líder no mercado imobiliário, oferecendo serviços incomparáveis.' },
                { label: 'Missão', icon: '🎯', text: 'Criar experiências de vida excecionais através de inovação e serviço personalizado.' },
              ].map((item) => (
                <div key={item.label} style={{
                  background: '#d4d0c8',
                  borderTop: '2px solid #fff', borderLeft: '2px solid #fff',
                  borderRight: '2px solid #808080', borderBottom: '2px solid #808080',
                  padding: '8px', fontFamily: 'Tahoma, Arial',
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{item.icon}</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0a246a', marginBottom: '2px' }}>A Nossa {item.label}</div>
                  <div style={{ fontSize: '11px', color: '#444' }}>{item.text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/sobre"><WinBtn>Saber Mais &gt;</WinBtn></Link>
            </div>
          </div>
        </WinWindow>
      </div>

      {/* ── ALL FEATURED PROPERTIES ── */}
      <WinWindow title="Imóveis Disponíveis — Covialvi.exe" icon="🏘️" className="mb-4 w-full">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontFamily: 'Tahoma, Arial', fontSize: '12px', color: '#000' }}>
            {featuredProperties.length} imóveis encontrados
          </span>
          <Link href="/imoveis">
            <WinBtn>Ver Todos os Imóveis &gt;</WinBtn>
          </Link>
        </div>
        <WinSeparator />
        {featuredProperties.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px', marginTop: '8px' }}>
            {featuredProperties.slice(0, 6).map((property: any) => (
              <PropertyCard key={property.id} property={property} formatPrice={formatPrice} businessTypeLabels={businessTypeLabels} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', background: '#fff', border: '2px inset #808080', fontFamily: 'Tahoma, Arial', fontSize: '13px', color: '#444' }}>
            Nenhum imóvel disponível de momento.
          </div>
        )}
      </WinWindow>

      {/* ── CTA BUILD ── */}
      <WinWindow title="Quer Construir a Sua Casa? — Parceiros" icon="🏗️" className="mb-4 w-full">
        <div style={{ background: '#fff3cd', border: '2px inset #808080', padding: '12px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ fontFamily: 'Tahoma, Arial', fontSize: '13px', color: '#000' }}>
            <strong>Quer construir a sua casa?</strong>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>Conheça os nossos parceiros especializados em construção e torne o seu sonho realidade.</p>
          </div>
          <a href="https://www.virgilioroque.com" target="_blank" rel="noopener noreferrer">
            <WinBtn style={{ background: '#fffbe6' }}>
              Visitar Parceiro <ArrowUpRight className="h-3 w-3" />
            </WinBtn>
          </a>
        </div>
      </WinWindow>

      {/* ── CONTACT FORM WINDOW ── */}
      <WinWindow title="Contacte-nos — Enviar Mensagem" icon="✉️" className="mb-4 w-full">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexWrap: 'wrap' }} className="contact-grid">
          {/* Background image side */}
          <div style={{ position: 'relative', minHeight: '240px', border: '2px inset #808080', overflow: 'hidden' }}>
            <Image src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053" alt="Modern architecture" fill className="object-cover" />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,36,106,0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
              <p style={{ color: '#a6caf0', fontFamily: 'Tahoma, Arial', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Contacte-nos</p>
              <h3 style={{ color: '#fff', fontFamily: 'Tahoma, Arial', fontSize: '18px', fontWeight: 'bold', lineHeight: 1.3, marginBottom: '8px' }}>
                Tem questões ou está pronto para o próximo passo?
              </h3>
              <p style={{ color: '#ccc', fontFamily: 'Tahoma, Arial', fontSize: '12px' }}>
                A nossa equipa está aqui para o guiar em cada etapa.
              </p>
            </div>
          </div>

          {/* Form side */}
          <div>
            {contactSuccess ? (
              <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'Tahoma, Arial' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                <strong style={{ fontSize: '14px' }}>Mensagem Enviada!</strong>
                <p style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>Entraremos em contacto brevemente.</p>
                <WinBtn onClick={() => setContactSuccess(false)} style={{ marginTop: '12px' }}>Enviar nova mensagem</WinBtn>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Tahoma, Arial', fontSize: '12px', marginBottom: '2px' }}>Primeiro Nome:</label>
                    <input type="text" placeholder="João" value={contactForm.firstName} onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })} required className="win-inset" style={{ width: '100%', padding: '3px 6px', fontFamily: 'Tahoma, Arial', fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Tahoma, Arial', fontSize: '12px', marginBottom: '2px' }}>Último Nome:</label>
                    <input type="text" placeholder="Silva" value={contactForm.lastName} onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })} className="win-inset" style={{ width: '100%', padding: '3px 6px', fontFamily: 'Tahoma, Arial', fontSize: '12px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Tahoma, Arial', fontSize: '12px', marginBottom: '2px' }}>Email:</label>
                  <input type="email" placeholder="joao@exemplo.pt" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required className="win-inset" style={{ width: '100%', padding: '3px 6px', fontFamily: 'Tahoma, Arial', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Tahoma, Arial', fontSize: '12px', marginBottom: '2px' }}>Telefone:</label>
                  <input type="tel" placeholder="+351 000 000 000" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className="win-inset" style={{ width: '100%', padding: '3px 6px', fontFamily: 'Tahoma, Arial', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Tahoma, Arial', fontSize: '12px', marginBottom: '2px' }}>Mensagem:</label>
                  <textarea rows={4} placeholder="Como podemos ajudar?" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className="win-inset" style={{ width: '100%', padding: '3px 6px', fontFamily: 'Tahoma, Arial', fontSize: '12px', resize: 'vertical' }} />
                </div>
                {contactError && <p style={{ color: '#c00', fontFamily: 'Tahoma, Arial', fontSize: '12px' }}>{contactError}</p>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <WinBtn onClick={() => setContactForm({ firstName: '', lastName: '', email: '', phone: '', message: '' })}>Limpar</WinBtn>
                  <WinBtn primary style={{ background: '#0a246a', color: '#fff', borderTop: '2px solid #4a7ad4', borderLeft: '2px solid #4a7ad4' }}>
                    {contactLoading ? 'A enviar...' : 'Enviar'}
                  </WinBtn>
                </div>
              </form>
            )}
          </div>
        </div>
      </WinWindow>

      <WhatsAppButton />

      <style>{`
        @media (max-width: 640px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .flex-wrap-win { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────────
function PropertyCard({ property, formatPrice, businessTypeLabels }: { property: any; formatPrice: (price: number | null) => string; businessTypeLabels: Record<string, string> }) {
  const [isHovered, setIsHovered] = useState(false);
  const coverImage = property.property_images?.find((img: any) => img.is_cover) || property.property_images?.[0];
  const hasVideo = property.video_url;

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}&controls=0&showinfo=0`;
    return url;
  };
  const videoEmbedUrl = hasVideo ? getYouTubeEmbedUrl(property.video_url) : null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#d4d0c8',
        borderTop: '2px solid #ffffff',
        borderLeft: '2px solid #ffffff',
        borderRight: '2px solid #404040',
        borderBottom: '2px solid #404040',
        fontFamily: 'Tahoma, Arial, sans-serif',
        cursor: 'pointer',
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', border: '2px inset #808080' }}>
        <Link href={`/imoveis/${property.slug}`}>
          <div style={{ position: 'absolute', inset: 0, transition: 'opacity 0.3s', opacity: isHovered && hasVideo ? 0 : 1 }}>
            {coverImage ? (
              <Image src={coverImage.url} alt={property.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#c0c0c0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 style={{ width: '32px', height: '32px', color: '#808080' }} />
              </div>
            )}
          </div>
          {hasVideo && isHovered && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
              <iframe src={videoEmbedUrl || ''} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 'none', pointerEvents: 'none', width: '100%', height: '100%' }} />
            </div>
          )}
        </Link>

        {/* Sold ribbon */}
        {property.construction_status === 'sold' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 30 }}>
            <div style={{ position: 'absolute', textAlign: 'center', transform: 'rotate(-45deg)', background: '#c00', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '6px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.4)', width: '280px', top: '50px', left: '-70px' }}>
              100% Vendido
            </div>
          </div>
        )}

        {/* Type badge */}
        <div style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 20 }}>
          <span style={{
            background: '#d4d0c8', color: '#000', fontSize: '11px',
            padding: '2px 6px', fontFamily: 'Tahoma, Arial',
            borderTop: '1px solid #fff', borderLeft: '1px solid #fff',
            borderRight: '1px solid #808080', borderBottom: '1px solid #808080',
          }}>
            {businessTypeLabels[property.business_type] || 'Venda'}
          </span>
        </div>

        {/* Video badge */}
        {hasVideo && !isHovered && (
          <div style={{ position: 'absolute', top: '4px', left: '4px', zIndex: 20 }}>
            <span style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: '11px', padding: '2px 6px', fontFamily: 'Tahoma, Arial', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Play style={{ width: '10px', height: '10px', fill: '#fff' }} /> Vídeo
            </span>
          </div>
        )}

        {/* Quick view on hover */}
        {isHovered && (
          <div style={{ position: 'absolute', bottom: '4px', left: '4px', right: '4px', zIndex: 20 }}>
            <Link href={`/imoveis/${property.slug}`}>
              <button className="win-btn" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                Ver Detalhes
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Info area */}
      <div style={{ padding: '6px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#555', fontSize: '11px', marginBottom: '2px' }}>
          <MapPin style={{ width: '12px', height: '12px', color: '#0a246a' }} />
          {property.municipality || property.district || 'Portugal'}
        </div>
        <Link href={`/imoveis/${property.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '13px', color: '#000', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {property.title}
          </h3>
        </Link>
        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#666', marginBottom: '4px', borderTop: '1px solid #808080', paddingTop: '4px' }}>
          {property.bedrooms !== null && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Bed style={{ width: '11px', height: '11px' }} />{property.bedrooms}</span>}
          {property.bathrooms !== null && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Bath style={{ width: '11px', height: '11px' }} />{property.bathrooms}</span>}
          {property.gross_area !== null && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Maximize style={{ width: '11px', height: '11px' }} />{property.gross_area}m²</span>}
        </div>
        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#0a246a' }}>
          {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
          {!property.price_on_request && property.business_type === 'rent' && <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#555' }}> /mês</span>}
        </p>
      </div>
    </div>
  );
}

// ─── Hero Property Card ───────────────────────────────────────────────────────
function HeroPropertyCard({ property, formatPrice, businessTypeLabels }: { property: any; formatPrice: (price: number | null) => string; businessTypeLabels: Record<string, string> }) {
  const [isHovered, setIsHovered] = useState(false);
  const coverImage = property.property_images?.find((img: any) => img.is_cover) || property.property_images?.[0];
  const hasVideo = property.video_url;

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}&controls=0&showinfo=0`;
    return url;
  };
  const videoEmbedUrl = hasVideo ? getYouTubeEmbedUrl(property.video_url) : null;

  return (
    <Link href={`/imoveis/${property.slug}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: '#d4d0c8',
          borderTop: '2px solid #fff',
          borderLeft: '2px solid #fff',
          borderRight: '2px solid #404040',
          borderBottom: '2px solid #404040',
          fontFamily: 'Tahoma, Arial, sans-serif',
          cursor: 'pointer',
          transform: isHovered ? 'translateY(-2px)' : 'none',
          transition: 'transform 0.1s',
        }}
      >
        <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', border: '2px inset #808080' }}>
          <div style={{ position: 'absolute', inset: 0, transition: 'opacity 0.3s', opacity: isHovered && hasVideo ? 0 : 1 }}>
            {coverImage ? <Image src={coverImage.url} alt={property.title} fill className="object-cover" /> : (
              <div style={{ width: '100%', height: '100%', background: '#c0c0c0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 style={{ width: '24px', height: '24px', color: '#808080' }} />
              </div>
            )}
          </div>
          {hasVideo && isHovered && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
              <iframe src={videoEmbedUrl || ''} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 'none', pointerEvents: 'none', width: '100%', height: '100%' }} />
            </div>
          )}
          {property.construction_status === 'sold' && (
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 30 }}>
              <div style={{ position: 'absolute', textAlign: 'center', transform: 'rotate(-45deg)', background: '#c00', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '4px 0', width: '260px', top: '45px', left: '-60px' }}>100% Vendido</div>
            </div>
          )}
          <span style={{ position: 'absolute', top: '4px', right: '4px', background: '#d4d0c8', color: '#000', fontSize: '11px', padding: '1px 5px', zIndex: 20, borderTop: '1px solid #fff', borderLeft: '1px solid #fff', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>
            {businessTypeLabels[property.business_type] || 'Venda'}
          </span>
        </div>
        <div style={{ padding: '6px 8px', background: 'rgba(0,36,106,0.92)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a6caf0', fontSize: '11px', marginBottom: '2px' }}>
            <MapPin style={{ width: '11px', height: '11px' }} />
            {property.municipality || property.district || 'Portugal'}
          </div>
          <h3 style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
            {property.title}
          </h3>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#a6caf0' }}>
            {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
            {!property.price_on_request && property.business_type === 'rent' && <span style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.8 }}> /mês</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}
