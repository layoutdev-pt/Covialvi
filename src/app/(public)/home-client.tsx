'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ArrowUpRight,
  Building2, 
  Home,
  Mountain,
  Store,
  Star, 
  MapPin,
  Bed,
  Bath,
  Maximize,
  Eye,
  Target,
  Leaf,
  Palmtree,
  ChevronRight,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FadeInUp, 
  SlideInLeft, 
  SlideInRight, 
  ScaleIn,
  StaggerContainer,
  StaggerItem
} from '@/components/ui/motion';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValueEvent, useMotionValue, useMotionTemplate } from 'framer-motion';
import { OtpDialog } from '@/components/ui/otp-dialog';
import { TrimmedImage } from '@/components/properties/trimmed-image';
import { ScrollRevealText } from '@/components/ui/scroll-reveal-text';

const WhatsAppButton = dynamic(() => import('@/components/ui/whatsapp-button').then(mod => mod.WhatsAppButton), {
  ssr: false,
});

interface HomeClientProps {
  properties: any[];
  featuredProperties: any[];
  premiumHighlights?: any[];
  stats: {
    properties: number;
    projects: number;
    clients: number;
    value: string;
  };
  heroProperty: any | null;
  availableLocations: {
    districts: string[];
    municipalities: string[];
  };
}

// Animated Counter Component
function AnimatedCounter({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const incrementTime = (duration * 1000) / end;
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, Math.max(incrementTime, 10));
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function HomeClient({ properties, featuredProperties, premiumHighlights = [], stats, heroProperty, availableLocations }: HomeClientProps) {
  const router = useRouter();
  const [activeService, setActiveService] = useState(0);

  // Panels sit side by side on wide screens and on landscape phones; stacked otherwise
  const [panelsHorizontal, setPanelsHorizontal] = useState(false);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setPanelsHorizontal(w >= 1024 || (w >= 600 && w > h * 1.3));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Scrolling through the pinned services section opens the panels one after another
  const servicesRef = useRef<HTMLElement>(null);
  const { scrollYProgress: servicesProgress } = useScroll({
    target: servicesRef,
    offset: ['start start', 'end end'],
  });
  useMotionValueEvent(servicesProgress, 'change', (v) => {
    const SERVICE_COUNT = 4;
    setActiveService(Math.min(SERVICE_COUNT - 1, Math.max(0, Math.floor(v * SERVICE_COUNT))));
  });
  const { scrollYProgress } = useScroll();
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Search filter states
  const [searchLocation, setSearchLocation] = useState('');
  const [searchNature, setSearchNature] = useState('');
  const [searchBusinessType, setSearchBusinessType] = useState('');
  
  // Contact form states
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    website: '',
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [showContactOtp, setShowContactOtp] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  /** Step 1: Validate email then send OTP */
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setContactError('Tem de aceitar as Políticas de Privacidade e os Termos e Condições para continuar.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(contactForm.email.trim())) {
      setContactError('Por favor, introduza um e-mail válido.');
      return;
    }

    setContactLoading(true);
    setContactError('');

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contactForm.email.trim(), formType: 'contact' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível enviar o código de verificação.');
      setShowContactOtp(true);
    } catch (err: any) {
      setContactError(err.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setContactLoading(false);
    }
  };

  /** Step 2: OTP verified — submit the actual contact */
  const handleContactOtpVerified = async (verifiedToken: string) => {
    setShowContactOtp(false);
    setContactLoading(true);
    setContactError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${contactForm.firstName} ${contactForm.lastName}`.trim(),
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message,
          website: contactForm.website,
          otpToken: verifiedToken,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao enviar mensagem');
      setContactSuccess(true);
      setContactForm({ firstName: '', lastName: '', email: '', phone: '', message: '', website: '' });
    } catch (err: any) {
      setContactError(err.message || 'Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleResendContactOtp = async () => {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: contactForm.email.trim(), formType: 'contact' }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao reenviar.');
    }
  };
  
  // Parallax effect for hero
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  
  // Filter properties based on search for hero section
  const filteredProperties = properties.filter((property: any) => {
    let matches = true;
    if (searchLocation && searchLocation !== 'all') {
      // Check if it's a municipality or district selection (prefixed)
      if (searchLocation.startsWith('municipality:')) {
        const municipality = searchLocation.replace('municipality:', '');
        matches = matches && property.municipality === municipality;
      } else if (searchLocation.startsWith('district:')) {
        const district = searchLocation.replace('district:', '');
        matches = matches && property.district === district;
      } else {
        // Fallback for unprefixed values
        const loc = searchLocation.toLowerCase();
        matches = matches && (
          property.municipality?.toLowerCase() === loc ||
          property.district?.toLowerCase() === loc
        );
      }
    }
    if (searchNature && searchNature !== 'all') {
      matches = matches && property.nature === searchNature;
    }
    if (searchBusinessType && searchBusinessType !== 'all') {
      matches = matches && property.business_type === searchBusinessType;
    }
    return matches;
  });
  
  const isSearchActive = searchLocation !== '' || searchNature !== '' || searchBusinessType !== '';
  // Get hero properties (filtered results or premium highlights)
  const heroProperties = isSearchActive 
    ? filteredProperties.slice(0, 3) 
    : (premiumHighlights || []);
  
  const handleSearch = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || price === 0) return 'Sob Consulta';
    return new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' €';
  };

  const businessTypeLabels: Record<string, string> = {
    sale: 'Venda',
    rent: 'Arrendamento',
    transfer: 'Trespasse',
  };

  const services = [
    {
      id: 0,
      icon: Home,
      title: 'Moradias',
      shortTitle: 'PRONTAS A HABITAR',
      description: 'Casas prontas a habitar, com acabamentos de qualidade e boas localizações.',
      linkLabel: 'Ver moradias',
      href: '/imoveis?nature=house',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070',
    },
    {
      id: 1,
      icon: Building2,
      title: 'Apartamentos',
      shortTitle: 'DO T0 AO T4+',
      description: 'Apartamentos para todas as fases da vida, de estúdios a tipologias T4 ou superiores.',
      linkLabel: 'Ver apartamentos',
      href: '/imoveis?nature=apartment',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070',
    },
    {
      id: 2,
      icon: Mountain,
      title: 'Terrenos',
      shortTitle: 'PARA CONSTRUIR',
      description: 'Terrenos com potencial para construir a casa dos seus sonhos ou o seu próximo investimento.',
      linkLabel: 'Ver terrenos',
      href: '/imoveis?nature=land',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070',
    },
    {
      id: 3,
      icon: Store,
      title: 'Comércio e armazéns',
      shortTitle: 'LOJAS E ESPAÇOS',
      description: 'Lojas, armazéns e espaços comerciais para fazer crescer o seu negócio.',
      linkLabel: 'Ver espaços comerciais',
      href: '/imoveis?nature=commercial',
      image: 'https://images.unsplash.com/photo-1565891741441-64926e441838?q=80&w=2070',
    },
  ];

  const futureProjects = [
    {
      id: 1,
      title: 'Residencial Vila Nova',
      description: 'Empreendimento moderno com 50 unidades habitacionais, incluindo apartamentos T2 e T3 com acabamentos de luxo e áreas comuns premium.',
      status: 'Início em 2026',
      location: 'Covilhã',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070',
    },
    {
      id: 2,
      title: 'Condomínio Jardim das Flores',
      description: 'Projeto residencial sustentável com certificação energética A+, espaços verdes e infraestruturas eco-friendly para famílias modernas.',
      status: 'Em Breve',
      location: 'Fundão',
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070',
    },
    {
      id: 3,
      title: 'Loteamento Serra da Estrela',
      description: 'Lotes para construção em localização privilegiada com vista panorâmica para a Serra da Estrela, ideal para moradias unifamiliares.',
      status: '2026',
      location: 'Belmonte',
      image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=2070',
    },
  ];

  const heroFilterTrigger ='h-14 md:h-12 lg:h-14 w-full min-w-0 rounded-full border border-gray-200 bg-white pl-12 md:pl-10 lg:pl-12 pr-5 md:pr-3 lg:pr-5 text-sm lg:text-base font-medium text-gray-800 shadow-none hover:border-gray-300 focus:ring-2 focus:ring-yellow-500/40 focus:ring-offset-0 [&>svg]:text-gray-500 [&>svg]:opacity-100 [&>svg]:shrink-0 [&>span]:!block [&>span]:flex-1 [&>span]:text-left [&>span]:truncate [&>span]:pr-2';

  return (
    <main className="bg-background overflow-x-clip -mt-20">
      {/* Hero Section - Full video background with dark mask, white filter card */}
      <section className="relative bg-black pt-28 md:pt-32 pb-52 md:pb-28 min-h-[640px] lg:min-h-[88vh] flex items-center">
        {/* Video background + dark mask */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973"
            className="absolute inset-0 w-full h-full object-cover"
            onLoadedMetadata={(e) => { (e.currentTarget as HTMLVideoElement).currentTime = 4; }}
            onTimeUpdate={(e) => { const v = e.currentTarget as HTMLVideoElement; if (v.dataset.started !== '1') { v.dataset.started = '1'; if (v.currentTime < 4) v.currentTime = 4; } }}
            onCanPlay={(e) => { (e.target as HTMLVideoElement).play().catch(() => {}); }}
            onEnded={(e) => { const v = e.currentTarget as HTMLVideoElement; v.currentTime = 4; v.play().catch(() => {}); }}
          >
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/35" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal text-white leading-[1.08] tracking-tight"
              >
                Encontre a sua casa ideal hoje
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="block text-white/90 text-sm sm:text-base md:text-lg max-w-xl mt-4 md:mt-6 leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]"
              >
                Oferecemos soluções imobiliárias personalizadas, guiando-o em cada passo com experiências que atendem às suas necessidades e aspirações únicas.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-8 md:mt-10"
              >
                <Link
                  href="/imoveis"
                  className="inline-flex items-center gap-3 rounded-full border border-white/70 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-gray-900"
                >
                  Começar a explorar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Filter card - white, overlapping the bottom of the green hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute inset-x-0 bottom-0 translate-y-1/2 px-6 md:px-12 lg:px-20 z-20"
        >
          <div className="max-w-7xl mx-auto rounded-3xl bg-white p-4 md:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-100">
            <div className="grid gap-3 md:gap-2 lg:gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center">
              {/* Location */}
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-5 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
                <Select value={searchLocation} onValueChange={setSearchLocation}>
                  <SelectTrigger className={heroFilterTrigger}>
                    <SelectValue placeholder="Localização" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={6} className="bg-white border border-gray-200 shadow-xl rounded-2xl max-h-[300px]">
                    <SelectItem value="all" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Todas as localizações</SelectItem>
                    {availableLocations.districts.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">Distritos</div>
                        {availableLocations.districts.map((district) => (
                          <SelectItem key={`district:${district}`} value={`district:${district}`} className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">
                            {district}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {availableLocations.municipalities.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">Concelhos</div>
                        {availableLocations.municipalities.map((municipality) => (
                          <SelectItem key={`municipality:${municipality}`} value={`municipality:${municipality}`} className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">
                            {municipality}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Property type */}
              <div className="relative">
                <Home className="pointer-events-none absolute left-5 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
                <Select value={searchNature} onValueChange={setSearchNature}>
                  <SelectTrigger className={heroFilterTrigger}>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={6} className="bg-white border border-gray-200 shadow-xl rounded-2xl">
                    <SelectItem value="all" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Todos</SelectItem>
                    <SelectItem value="apartment" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Apartamento</SelectItem>
                    <SelectItem value="house" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Moradia</SelectItem>
                    <SelectItem value="land" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Terreno</SelectItem>
                    <SelectItem value="commercial" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Comercial</SelectItem>
                    <SelectItem value="warehouse" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Armazém</SelectItem>
                    <SelectItem value="shop" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Loja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Business type */}
              <div className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-5 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
                <Select value={searchBusinessType} onValueChange={setSearchBusinessType}>
                  <SelectTrigger className={heroFilterTrigger}>
                    <SelectValue placeholder="Negócio" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={6} className="bg-white border border-gray-200 shadow-xl rounded-2xl">
                    <SelectItem value="all" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Todos</SelectItem>
                    <SelectItem value="sale" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Comprar</SelectItem>
                    <SelectItem value="rent" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Arrendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSearch}
                className="h-14 md:h-12 lg:h-14 whitespace-nowrap rounded-full bg-yellow-500 px-6 md:px-5 lg:px-9 text-base md:text-sm lg:text-base font-semibold text-white transition-colors hover:bg-yellow-600 flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                Pesquisar
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Properties Below Hero */}
      <section ref={resultsRef} className="pt-44 md:pt-24 pb-5 px-6 md:px-12 lg:px-20 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="max-w-7xl mx-auto"
        >
          {heroProperties.length > 0 ? (
            <>
              {!isSearchActive && premiumHighlights && premiumHighlights.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <ScrollRevealText
                    as="h1"
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 mt-6 tracking-tight leading-tight"
                    segments={[
                      { text: 'OPORTUNIDADES', breakAfter: true },
                      { text: 'ÚNICAS', className: 'text-yellow-500' },
                    ]}
                  />
                </div>
              )}
              {isSearchActive && (
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                    Resultados da Pesquisa
                  </h2>
                </div>
              )}
              <div className="grid md:grid-cols-3 gap-6">
                {heroProperties.map((property: any) => (
                  <HeroPropertyCard 
                    key={property.id} 
                    property={property} 
                    formatPrice={formatPrice}
                    businessTypeLabels={businessTypeLabels}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 bg-secondary/50 rounded-2xl">
              <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Nenhum imóvel encontrado com os filtros selecionados</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Services Section - Premium Tabs */}
      {/* The tall section scrolls "through" the panels: each one opens in turn while the page is pinned */}
      <section ref={servicesRef} className="relative bg-background h-[340vh]">
       <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col px-4 sm:px-6 md:px-12 lg:px-20 pt-20 md:pt-24 pb-3 md:pb-6">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-7xl mx-auto relative w-full flex flex-col flex-1 min-h-0">
          <FadeInUp>
            <span className="inline-block [@media(max-height:620px)]:hidden px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-border text-xs md:text-sm text-muted-foreground mb-2 md:mb-4">
              Os Nossos Serviços
            </span>
            <ScrollRevealText
              as="h2"
              className="text-2xl sm:text-3xl lg:text-5xl [@media(max-height:620px)]:!text-xl font-bold text-foreground mb-3 md:mb-3 [@media(max-height:620px)]:!mb-2 tracking-tight leading-tight"
              segments={[
                { text: 'SOLUÇÕES IMOBILIÁRIAS' },
                { text: 'COMPLETAS', className: 'text-yellow-500' },
              ]}
            />
            <p className="hidden md:block [@media(max-height:760px)]:hidden text-muted-foreground text-base md:text-lg max-w-2xl mb-6 md:mb-8">
              Da primeira casa ao investimento: moradias, apartamentos, terrenos e espaços comerciais.
            </p>
          </FadeInUp>

          {/* Expanding image panels */}
          <div className={`flex ${panelsHorizontal ? 'flex-row' : 'flex-col'} gap-2 md:gap-3 flex-1 min-h-0 max-h-[640px]`}>
            {services.map((service, index) => {
              const isActive = activeService === index;
              return (
                <div
                  key={service.id}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                  onFocus={() => setActiveService(index)}
                  onClick={() => setActiveService(index)}
                  className={`group relative min-h-0 min-w-0 overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive ? (panelsHorizontal ? 'flex-[6]' : 'flex-[8]') : 'flex-[1]'
                  }`}
                  style={{ flexBasis: 0 }}
                >
                  {/* Photo */}
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className={`object-cover transition-transform duration-[1200ms] ease-out ${isActive ? 'scale-100' : 'scale-110'}`}
                  />
                  {/* Dark mask */}
                  <div className={`absolute inset-0 transition-colors duration-700 ${isActive ? 'bg-gradient-to-t from-black/90 via-black/45 to-black/10' : 'bg-black/55 group-hover:bg-black/40'}`} />

                  {/* Collapsed: number + icon + vertical title */}
                  <div className={`absolute inset-0 flex items-center justify-between ${panelsHorizontal ? 'flex-col p-5' : 'px-4 py-2'} transition-opacity duration-500 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-300'}`}>
                    <span className="text-sm font-light tracking-widest text-white/70">0{index + 1}</span>
                    <span className={`flex items-center gap-3 ${panelsHorizontal ? 'flex-col-reverse' : ''}`}>
                      <span className={`font-light tracking-wide text-white whitespace-nowrap ${panelsHorizontal ? 'text-2xl [writing-mode:vertical-rl] rotate-180' : 'text-xl'}`}>
                        {service.title}
                      </span>
                      <service.icon className="h-6 w-6 text-yellow-400" />
                    </span>
                  </div>

                  {/* Expanded content */}
                  <div className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10 transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
                    <div className="hidden sm:flex [@media(max-height:620px)]:hidden items-center gap-3 mb-3 md:mb-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-500 text-white">
                        <service.icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-white/75">{service.shortTitle}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-5xl [@media(max-height:620px)]:!text-2xl font-light text-white tracking-tight leading-tight mb-2 md:mb-3 whitespace-normal">
                      {service.title}
                    </h3>
                    <p className="text-sm md:text-base text-white/85 max-w-md leading-relaxed whitespace-normal [@media(max-height:560px)]:hidden">
                      {service.description}
                    </p>
                    <Link
                      href={service.href}
                      tabIndex={isActive ? 0 : -1}
                      className="mt-3 md:mt-6 inline-flex items-center gap-3 rounded-full bg-white/15 backdrop-blur-md border border-white/30 pl-5 md:pl-6 pr-1.5 md:pr-2 py-1.5 md:py-2 text-sm font-medium text-white hover:bg-yellow-500 hover:border-yellow-500 transition-colors"
                    >
                      {service.linkLabel}
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-900">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
       </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-28 px-6 md:px-12 lg:px-20 bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <FadeInUp>
              <span className="inline-block px-4 py-2 rounded-full border border-border bg-background text-sm text-muted-foreground mb-4">
                Imóveis em Destaque
              </span>
              <ScrollRevealText
                as="h2"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight"
                segments={[
                  { text: 'DESCUBRA IMÓVEIS', breakAfter: true },
                  { text: 'À SUA MEDIDA', className: 'text-yellow-500' },
                ]}
              />
            </FadeInUp>
            
            <FadeInUp delay={0.2}>
              <Link href="/imoveis">
                <motion.button 
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group inline-flex items-center gap-3 bg-foreground text-background rounded-full pl-6 pr-2 py-2 font-medium hover:opacity-90 transition-all"
                >
                  Ver Todos
                  <span className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-foreground group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
            </FadeInUp>
          </div>
          
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.1}>
            {featuredProperties.slice(0, 6).map((property) => (
              <StaggerItem key={property.id}>
                <HeroPropertyCard
                  property={property} 
                  formatPrice={formatPrice} 
                  businessTypeLabels={businessTypeLabels} 
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      
      {/* About Section - Who We Are */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-14 lg:gap-24 items-center">
            {/* Left - Video */}
            <SlideInLeft>
              <div className="relative max-w-lg mx-auto lg:max-w-none">
                {/* Decorative offset frame */}
                <div className="absolute -bottom-4 -left-4 h-full w-full rounded-[2rem] border border-yellow-500/50" aria-hidden="true" />
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/team-covialvi.png"
                    className="absolute inset-0 h-full w-full object-cover"
                    onCanPlay={(e) => { (e.target as HTMLVideoElement).play().catch(() => {}); }}
                  >
                    <source src="/video/quem-somos.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-5 left-5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 px-5 py-3">
                    <p className="text-3xl font-light text-white leading-none">90%</p>
                    <p className="mt-1 text-xs text-white/85">Taxa de Retenção</p>
                  </div>
                </div>
              </div>
            </SlideInLeft>

            {/* Right - Text + KPIs */}
            <SlideInRight>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                Quem Somos
              </span>
              <ScrollRevealText
                as="h2"
                className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground tracking-tight leading-[1.08] mb-6"
                segments={[
                  { text: 'Redefinindo excelência no' },
                  { text: 'imobiliário', className: 'text-yellow-500' },
                ]}
              />
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mb-12">
                Especializamo-nos em propriedades de luxo, casas sustentáveis e arrendamentos de férias — movidos pela paixão por uma vida excecional e compromisso com qualidade, inovação e satisfação do cliente.
              </p>

              {/* KPIs - no boxes */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-10 mb-12 max-w-xl">
                {[
                  { value: 80, suffix: '+', label: 'Projetos Concluídos' },
                  { value: 100, suffix: '+', label: 'Clientes Satisfeitos' },
                  { value: 10, suffix: 'M+', label: 'Valor em Projetos' },
                  { value: 30, suffix: '+', label: 'Anos de Experiência' },
                ].map((kpi) => (
                  <div key={kpi.label} className="group border-t border-border pt-5">
                    <p className="text-5xl md:text-6xl font-light text-foreground leading-none tracking-tight group-hover:text-yellow-500 transition-colors duration-300">
                      <AnimatedCounter value={kpi.value} suffix={kpi.suffix} />
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{kpi.label}</p>
                  </div>
                ))}
              </div>

              <Link href="/sobre" className="group inline-flex items-center gap-3 text-foreground font-medium">
                Saber Mais Sobre Nós
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border group-hover:bg-yellow-500 group-hover:border-yellow-500 group-hover:text-white transition-all duration-300">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </SlideInRight>
          </div>
          
          {/* Vision & Mission Cards */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-5 mt-20 max-w-5xl mx-auto">
            <ValueCard
              index={0}
              tone="dark"
              Icon={Eye}
              title="A Nossa Visão"
              text="Ser líder no mercado imobiliário, oferecendo serviços incomparáveis em luxo, sustentabilidade e propriedades de férias."
            />
            <ValueCard
              index={1}
              tone="gold"
              Icon={Target}
              title="A Nossa Missão"
              text="Criar experiências de vida excecionais através de inovação, sustentabilidade e serviço personalizado no imobiliário moderno."
            />
          </div>
        </div>
      </section>

      {/* Build Your House CTA Section */}
      <section className="relative isolate overflow-hidden py-20 px-6 md:px-12 lg:px-20 bg-gradient-to-r from-yellow-500 to-yellow-600">
        {/* Construction site photo, blended into the yellow */}
        <Image
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover opacity-40 mix-blend-multiply"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-500/50 via-transparent to-yellow-600/40" />
        <div className="max-w-4xl mx-auto text-center">
          <FadeInUp>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Quer construir a sua casa?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Conheça os nossos parceiros especializados em construção e torne o seu sonho realidade.
            </p>
            <a
              href="https://www.virgilioroque.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-gray-900 rounded-full px-8 py-4 font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              Quer construir a sua casa?
              <ArrowUpRight className="h-5 w-5" />
            </a>
          </FadeInUp>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image with Parallax */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053"
            alt="Modern architecture"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="max-w-2xl mx-auto">
            <FadeInUp>
              <div className="text-center mb-10">
                <span className="inline-block px-4 py-2 rounded-full border border-white/20 text-sm text-white/70 mb-6">
                  Contacte-nos
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Tem questões ou está pronto<br />para dar o próximo passo?
                </h2>
                <p className="text-white/60">
                  A nossa equipa está aqui para o guiar em cada etapa. Vamos transformar os seus objetivos imobiliários em realidade.
                </p>
              </div>
            </FadeInUp>
            
            <FadeInUp delay={0.2}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl"
              >
                <OtpDialog
                  email={contactForm.email.trim()}
                  formType="contact"
                  isOpen={showContactOtp}
                  onVerified={handleContactOtpVerified}
                  onClose={() => setShowContactOtp(false)}
                  onResend={handleResendContactOtp}
                />
                {contactSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Mensagem Enviada!</h3>
                    <p className="text-gray-600">Entraremos em contacto brevemente.</p>
                    <button
                      onClick={() => setContactSuccess(false)}
                      className="mt-4 text-yellow-600 font-medium hover:text-yellow-700"
                    >
                      Enviar nova mensagem
                    </button>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleContactSubmit}>
                    {/* Honeypot field - invisible to users */}
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="home-website">Website</label>
                      <input
                        id="home-website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={contactForm.website}
                        onChange={(e) => setContactForm({ ...contactForm, website: e.target.value })}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <input
                        type="text"
                        placeholder="Primeiro Nome"
                        value={contactForm.firstName}
                        onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                        required
                        className="w-full px-5 py-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder:text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Último Nome"
                        value={contactForm.lastName}
                        onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                        className="w-full px-5 py-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <input
                        type="email"
                        placeholder="Email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                        className="w-full px-5 py-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder:text-gray-400"
                      />
                      <input
                        type="tel"
                        placeholder="Telefone"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-5 py-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <textarea
                      placeholder="Como podemos ajudar?"
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-5 py-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder:text-gray-400 resize-none"
                    />
                    <label className="flex cursor-pointer items-start gap-3 pt-1 text-sm leading-relaxed text-gray-600">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => {
                          setAcceptedTerms(e.target.checked);
                          if (e.target.checked) setContactError('');
                        }}
                        required
                        className="mt-1 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-gray-300 accent-yellow-500"
                      />
                      <span>
                        Li e aceito as{' '}
                        <Link href="/politica-de-privacidade" target="_blank" className="font-medium text-gray-900 underline underline-offset-2 hover:text-yellow-600">
                          Políticas de Privacidade
                        </Link>{' '}
                        e os{' '}
                        <Link href="/termos-e-condicoes" target="_blank" className="font-medium text-gray-900 underline underline-offset-2 hover:text-yellow-600">
                          Termos e Condições
                        </Link>
                        .
                      </span>
                    </label>
                    {contactError && (
                      <p className="text-red-500 text-sm">{contactError}</p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={contactLoading}
                      className="w-full bg-gray-900 text-white rounded-full py-4 font-medium hover:bg-gray-800 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {contactLoading ? 'A enviar...' : 'Agendar Chamada'}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </FadeInUp>
          </div>
        </div>
      </section>

    </main>
  );
}

// Hero Property Card Component - With Video Hover
function HeroPropertyCard({ 
  property, 
  formatPrice, 
  businessTypeLabels 
}: { 
  property: any; 
  formatPrice: (price: number | null | undefined) => string;
  businessTypeLabels: Record<string, string>;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const coverImage = property.property_images?.find((img: any) => img.is_cover) ||
    property.property_images?.[0];
  
  const hasVideo = property.video_url;
  
  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}&controls=0&showinfo=0`;
    }
    return url;
  };
  
  const videoEmbedUrl = hasVideo ? getYouTubeEmbedUrl(property.video_url) : null;

  const natureLabels: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Moradia',
    land: 'Terreno',
    commercial: 'Comercial',
    warehouse: 'Armazém',
    shop: 'Loja',
  };
  const natureLabel = natureLabels[property.nature];

  return (
    <Link href={`/imoveis/${property.slug}`} className="block h-full">
      <motion.div
        whileHover={{ y: -6 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative h-full bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] transition-shadow duration-300 border border-gray-100"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Image - shown when not hovered or no video */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered && hasVideo ? 'opacity-0' : 'opacity-100'}`}>
            {coverImage ? (
              <motion.div
                initial={{ scale: 1.25 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <TrimmedImage
                  src={coverImage.url}
                  alt={property.title}
                  className={`object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${property.construction_status === 'sold' || property.construction_status === 'sold_100' ? 'grayscale' : ''}`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-300" />
              </div>
            )}
          </div>

          {/* Video - shown on hover if property has video */}
          {hasVideo && isHovered && (
            <div className="absolute inset-0 z-10">
              <iframe
                src={videoEmbedUrl || ''}
                className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none', pointerEvents: 'none' }}
              />
            </div>
          )}

          {/* Video indicator badge */}
          {hasVideo && !isHovered && (
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                <Play className="h-3 w-3 fill-white" />
                Vídeo
              </span>
            </div>
          )}

          {/* Vendido label */}
          {(property.construction_status === 'sold' || property.construction_status === 'sold_100') && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <span className="rounded-2xl bg-red-600 px-6 py-2.5 text-base font-bold text-white shadow-lg tracking-wide">
                {property.construction_status === 'sold' ? 'Vendido' : '100% Vendido'}
              </span>
            </div>
          )}

          {/* Hover arrow circle */}
          {!(property.construction_status === 'sold' || property.construction_status === 'sold_100') && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/70 backdrop-blur-sm text-white opacity-0 scale-75 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100">
                <ArrowUpRight className="h-6 w-6" />
              </span>
            </div>
          )}

          {/* Business type (Venda / Arrendamento) */}
          <span className="absolute top-4 right-4 z-20 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900">
            {businessTypeLabels[property.business_type] || 'Venda'}
          </span>

          {/* Price pill - bottom left */}
          <span className="absolute bottom-4 left-4 z-20 rounded-full bg-white/95 px-4 py-1.5 text-sm font-semibold text-gray-900 shadow-sm">
            {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
            {!property.price_on_request && property.business_type === 'rent' && (
              <span className="text-xs font-normal text-gray-500"> /mês</span>
            )}
          </span>

          {/* Property type pill - bottom right */}
          {natureLabel && (
            <span className="absolute bottom-4 right-4 z-20 rounded-full bg-yellow-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm">
              {natureLabel}
            </span>
          )}
        </div>

        <div className="px-6 pt-6 pb-5">
          <h3 className="text-xl font-normal text-gray-900 line-clamp-1 group-hover:text-yellow-600 transition-colors">
            {property.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {property.municipality || property.district || 'Portugal'}
          </p>
        </div>

        <div className="mx-0 border-t border-gray-100 px-6 py-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-5">
            {property.typology && (
              <span className="flex items-center gap-1.5">
                <LayoutGrid className="h-4 w-4 text-gray-500" />
                {property.typology}
              </span>
            )}
            {property.bedrooms !== null && property.bedrooms !== undefined && (
              <span className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-gray-500" />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms !== null && property.bathrooms !== undefined && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-gray-500" />
                {property.bathrooms}
              </span>
            )}
            {property.gross_area !== null && property.gross_area !== undefined && (
              <span className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4 text-gray-500" />
                {property.gross_area} m²
              </span>
            )}
          </div>
          <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-yellow-600 transition-colors" />
        </div>
      </motion.div>
    </Link>
  );
}

// Animated Vision / Mission card: cursor spotlight, pulsing rings, floating numeral, word-by-word reveal
function ValueCard({
  index,
  tone,
  Icon,
  title,
  text,
}: {
  index: number;
  tone: 'dark' | 'gold';
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const dark = tone === 'dark';
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,${dark ? 0.1 : 0.3}), transparent 65%)`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      className={`group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-3xl p-6 text-white md:p-8 ${
        dark ? 'bg-gray-900' : 'bg-yellow-500'
      }`}
    >
      {/* Cursor spotlight */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: spotlight }}
      />

      {/* Floating outlined numeral */}
      <motion.span
        aria-hidden="true"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute right-8 top-4 select-none text-[6rem] font-light leading-none text-transparent md:right-12 md:text-[8rem]"
        style={{ WebkitTextStroke: dark ? '1.5px rgba(255,255,255,0.5)' : '1.5px rgba(255,255,255,0.9)' }}
      >
        0{index + 1}
      </motion.span>

      {/* Icon with pulsing rings */}
      <div className="relative h-11 w-11">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className={`absolute inset-0 rounded-full border ${dark ? 'border-yellow-500/60' : 'border-white/70'}`}
            animate={{ scale: [1, 2.3], opacity: [0.6, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i, ease: 'easeOut' }}
          />
        ))}
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 + index * 0.15 }}
          className={`relative flex h-11 w-11 items-center justify-center rounded-full ${
            dark ? 'bg-yellow-500 text-white' : 'bg-white text-yellow-600'
          }`}
        >
          <Icon className="h-5 w-5" />
        </motion.span>
      </div>

      {/* Text */}
      <div className="relative mt-8">
        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: 40 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 + index * 0.15 }}
          className="mb-3 block h-px bg-current opacity-60"
        />
        <h3 className="mb-2 text-2xl font-light tracking-tight md:text-3xl">{title}</h3>
        <p className={`max-w-md text-sm leading-relaxed md:text-base ${dark ? 'text-white/75' : 'text-white/95'}`}>
          {text.split(' ').map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.15 + i * 0.03 }}
              className="mr-[0.3em] inline-block"
            >
              {word}
            </motion.span>
          ))}
        </p>
      </div>
    </motion.article>
  );
}
