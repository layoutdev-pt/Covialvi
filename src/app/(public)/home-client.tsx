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
  Star, 
  MapPin,
  Bed,
  Bath,
  Maximize,
  Eye,
  Target,
  Heart,
  Leaf,
  Palmtree,
  ChevronRight,
  Search
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
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion';

interface HomeClientProps {
  properties: any[];
  stats: {
    properties: number;
    projects: number;
    clients: number;
    value: string;
  };
  heroProperty: any | null;
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

export function HomeClient({ properties, stats, heroProperty }: HomeClientProps) {
  const router = useRouter();
  const [activeService, setActiveService] = useState(0);
  const [heroExpanded, setHeroExpanded] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Expand hero image after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroExpanded(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  // Search filter states
  const [searchLocation, setSearchLocation] = useState('');
  const [searchNature, setSearchNature] = useState('');
  const [searchBusinessType, setSearchBusinessType] = useState('');
  
  // Parallax effect for hero
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  
  // Filter properties based on search
  const filteredProperties = properties.filter((property: any) => {
    let matches = true;
    if (searchLocation) {
      const loc = searchLocation.toLowerCase();
      matches = matches && (
        property.municipality?.toLowerCase().includes(loc) ||
        property.district?.toLowerCase().includes(loc) ||
        property.parish?.toLowerCase().includes(loc)
      );
    }
    if (searchNature && searchNature !== 'all') {
      matches = matches && property.nature === searchNature;
    }
    if (searchBusinessType && searchBusinessType !== 'all') {
      matches = matches && property.business_type === searchBusinessType;
    }
    return matches;
  });
  
  // Get hero properties (filtered or most viewed)
  const heroProperties = filteredProperties.slice(0, 3);
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (searchNature && searchNature !== 'all') params.set('nature', searchNature);
    if (searchBusinessType && searchBusinessType !== 'all') params.set('business_type', searchBusinessType);
    
    const queryString = params.toString();
    router.push(`/imoveis${queryString ? `?${queryString}` : ''}`);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Sob Consulta';
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
      title: 'Residências de Luxo',
      shortTitle: 'LUXO',
      description: 'Experimente elegância incomparável nas nossas residências de luxo, com design requintado, comodidades premium e localizações privilegiadas para os gostos mais exigentes.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075',
    },
    {
      id: 1,
      icon: Leaf,
      title: 'Edifícios Sustentáveis',
      shortTitle: 'ECO',
      description: 'Invista em propriedades eco-friendly com certificação energética de topo, materiais sustentáveis e tecnologia verde integrada para um futuro melhor.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053',
    },
    {
      id: 2,
      icon: Palmtree,
      title: 'Casas de Férias',
      shortTitle: 'FÉRIAS',
      description: 'Descubra propriedades de férias em localizações deslumbrantes, perfeitas para relaxar ou como investimento rentável com retorno garantido.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070',
    },
  ];

  return (
    <main className="bg-background overflow-hidden">
      {/* Hero Section - VistaHaven Style with Rounded Container */}
      <section className="pt-[88px] pb-4 px-6 md:px-12 lg:px-20">
        <motion.div 
          className="relative max-w-7xl mx-auto rounded-3xl overflow-hidden min-h-[600px] md:min-h-[700px]"
          initial={{ scale: 0.92, opacity: 0.8 }}
          animate={{ 
            scale: heroExpanded ? 1 : 0.92,
            opacity: heroExpanded ? 1 : 0.8,
          }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Background Image */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ 
              scale: heroExpanded ? 1 : 1.1,
            }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <Image
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075"
              alt="Luxury modern home"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          
          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 lg:p-16 min-h-[600px] md:min-h-[700px]">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                  FIND YOUR<br />
                  PERFECT HOME<br />
                  TODAY
                </h1>
              </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/70 text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
            >
              Oferecemos soluções imobiliárias personalizadas, guiando-o em cada passo com experiências que atendem às suas necessidades e aspirações únicas.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="w-full max-w-3xl"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-full p-2 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Localização..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm"
                  />
                </div>
                <div className="hidden md:block w-px h-8 bg-gray-200" />
                <div className="flex gap-2">
                  <Select value={searchNature} onValueChange={setSearchNature}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 flex-1 md:min-w-[130px] text-sm text-gray-900 [&>svg]:text-gray-400">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
                      <SelectItem value="all" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Todos</SelectItem>
                      <SelectItem value="apartment" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Apartamento</SelectItem>
                      <SelectItem value="house" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Moradia</SelectItem>
                      <SelectItem value="land" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Terreno</SelectItem>
                      <SelectItem value="commercial" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Comercial</SelectItem>
                      <SelectItem value="warehouse" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Armazém</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="hidden md:block w-px h-8 bg-gray-200" />
                  <Select value={searchBusinessType} onValueChange={setSearchBusinessType}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 flex-1 md:min-w-[100px] text-sm text-gray-900 [&>svg]:text-gray-400">
                      <SelectValue placeholder="Negócio" />
                    </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
                    <SelectItem value="all" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Todos</SelectItem>
                    <SelectItem value="sale" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Comprar</SelectItem>
                    <SelectItem value="rent" className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">Arrendar</SelectItem>
                  </SelectContent>
                </Select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  className="group flex items-center gap-2 bg-gray-900 text-white rounded-full pl-5 pr-2 py-2 font-medium hover:bg-yellow-500 transition-all"
                >
                  <span className="hidden sm:inline">Pesquisar</span>
                  <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Search className="h-4 w-4" />
                  </span>
                </motion.button>
              </div>
            </motion.div>
            </div>
            
            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-auto pt-12"
            >
              <div className="flex flex-wrap gap-8 md:gap-16">
                <div className="group">
                  <p className="text-4xl md:text-5xl font-bold text-white mb-1">
                    <AnimatedCounter value={stats.properties} suffix="+" />
                  </p>
                  <p className="text-white/50 text-sm">Projects Complete</p>
                </div>
                <div className="group">
                  <p className="text-4xl md:text-5xl font-bold text-white mb-1">
                    <AnimatedCounter value={stats.clients} suffix="+" />
                  </p>
                  <p className="text-white/50 text-sm">Happy Clients</p>
                </div>
                <div className="group">
                  <p className="text-4xl md:text-5xl font-bold text-white mb-1">
                    $<AnimatedCounter value={10} suffix="M+" />
                  </p>
                  <p className="text-white/50 text-sm">Project Value</p>
                </div>
              </div>
            </motion.div>
          </div>
          
        </motion.div>
        
        {/* Featured Properties Below Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-6 max-w-7xl mx-auto"
        >
          {heroProperties.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {heroProperties.map((property: any) => {
                const coverImage = property.property_images?.find((img: any) => img.is_cover) ||
                  property.property_images?.[0];
                return (
                  <Link key={property.id} href={`/imoveis/${property.slug}`}>
                    <motion.div
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                    >
                      <div className="relative aspect-[16/10]">
                        {coverImage ? (
                          <Image
                            src={coverImage.url}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Badge */}
                        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900">
                          {businessTypeLabels[property.business_type] || 'Venda'}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-1 text-white/80 text-xs mb-1">
                          <MapPin className="h-3 w-3" />
                          {property.municipality || property.district || 'Portugal'}
                        </div>
                        <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">
                          {property.title}
                        </h3>
                        <p className="text-white font-bold text-lg">
                          {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Building2 className="h-10 w-10 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Nenhum imóvel encontrado com os filtros selecionados</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Services Section - Premium Tabs */}
      <section className="py-28 px-6 md:px-12 lg:px-20 bg-background relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        
        <div className="max-w-7xl mx-auto relative">
          <FadeInUp>
            <span className="inline-block px-4 py-2 rounded-full border border-border text-sm text-muted-foreground mb-6">
              Os Nossos Serviços
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-tight">
              SOLUÇÕES IMOBILIÁRIAS<br />
              <span className="text-muted-foreground">COMPLETAS</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mb-16">
              Os nossos serviços abrangem vendas de propriedades de luxo, investimentos em edifícios sustentáveis e arrendamentos de férias premium.
            </p>
          </FadeInUp>
          
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Service Tabs */}
            <div className="lg:col-span-4 space-y-4">
              {services.map((service, index) => (
                <motion.button
                  key={service.id}
                  onClick={() => setActiveService(index)}
                  whileHover={{ x: 10 }}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                    activeService === index 
                      ? 'bg-foreground text-background shadow-xl' 
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeService === index ? 'bg-background/20' : 'bg-background'
                    }`}>
                      <service.icon className={`h-6 w-6 ${activeService === index ? 'text-background' : 'text-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{service.title}</h3>
                      <p className={`text-sm ${activeService === index ? 'text-background/60' : 'text-muted-foreground'}`}>
                        {service.shortTitle}
                      </p>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${activeService === index ? 'rotate-90' : ''}`} />
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Service Content */}
            <div className="lg:col-span-8">
              <motion.div 
                key={activeService}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src={services[activeService].image}
                    alt={services[activeService].title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-4">
                      0{activeService + 1}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      {services[activeService].title}
                    </h3>
                    <p className="text-white/80 max-w-lg leading-relaxed">
                      {services[activeService].description}
                    </p>
                  </div>
                </div>
              </motion.div>
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
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
                DESCUBRA IMÓVEIS<br />
                <span className="text-muted-foreground">À SUA MEDIDA</span>
              </h2>
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
            {properties.slice(0, 6).map((property) => (
              <StaggerItem key={property.id}>
                <PropertyCard 
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
      <section className="py-28 px-6 md:px-12 lg:px-20 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left - Image */}
            <SlideInLeft>
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974"
                    alt="Our Team"
                    fill
                    className="object-cover"
                  />
                </motion.div>
                {/* Floating Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="absolute -bottom-8 -right-8 bg-foreground text-background rounded-2xl p-6 shadow-2xl"
                >
                  <p className="text-4xl font-bold mb-1">90%</p>
                  <p className="text-sm text-background/60">Taxa de Retenção</p>
                </motion.div>
              </div>
            </SlideInLeft>
            
            {/* Right - Text Content */}
            <SlideInRight>
              <span className="inline-block px-4 py-2 rounded-full border border-border text-sm text-muted-foreground mb-6">
                Quem Somos
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                REDEFININDO<br />
                EXCELÊNCIA NO<br />
                <span className="text-muted-foreground">IMOBILIÁRIO</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                Especializamo-nos em propriedades de luxo, casas sustentáveis e arrendamentos de férias — movidos pela paixão por uma vida excecional e compromisso com qualidade, inovação e satisfação do cliente.
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="group">
                  <p className="text-4xl font-bold text-foreground group-hover:text-yellow-500 transition-colors">
                    <AnimatedCounter value={stats.properties} suffix="+" />
                  </p>
                  <p className="text-muted-foreground text-sm">Projetos Concluídos</p>
                </div>
                <div className="group">
                  <p className="text-4xl font-bold text-foreground group-hover:text-yellow-500 transition-colors">
                    <AnimatedCounter value={stats.clients} suffix="+" />
                  </p>
                  <p className="text-muted-foreground text-sm">Clientes Satisfeitos</p>
                </div>
                <div className="group">
                  <p className="text-4xl font-bold text-foreground group-hover:text-yellow-500 transition-colors">
                    <AnimatedCounter value={10} suffix="M+" />
                  </p>
                  <p className="text-muted-foreground text-sm">Valor em Projetos</p>
                </div>
                <div className="group">
                  <p className="text-4xl font-bold text-foreground group-hover:text-yellow-500 transition-colors">
                    <AnimatedCounter value={25} suffix="+" />
                  </p>
                  <p className="text-muted-foreground text-sm">Anos de Experiência</p>
                </div>
              </div>
              
              <Link href="/sobre">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 text-foreground font-medium hover:text-yellow-500 transition-colors"
                >
                  Saber Mais Sobre Nós
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
            </SlideInRight>
          </div>
          
          {/* Vision & Mission Cards */}
          <div className="grid md:grid-cols-2 gap-8 mt-24">
            <FadeInUp delay={0.2}>
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-card border border-border rounded-3xl p-8 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-6">
                  <Eye className="h-7 w-7 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">A Nossa Visão</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ser líder no mercado imobiliário, oferecendo serviços incomparáveis em luxo, sustentabilidade e propriedades de férias.
                </p>
              </motion.div>
            </FadeInUp>
            
            <FadeInUp delay={0.3}>
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-card border border-border rounded-3xl p-8 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">A Nossa Missão</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Criar experiências de vida excecionais através de inovação, sustentabilidade e serviço personalizado no imobiliário moderno.
                </p>
              </motion.div>
            </FadeInUp>
          </div>
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
                <form className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <input
                      type="text"
                      placeholder="Primeiro Nome"
                      className="w-full px-5 py-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder:text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Último Nome"
                      className="w-full px-5 py-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-5 py-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder:text-gray-400"
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      className="w-full px-5 py-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <textarea
                    placeholder="Como podemos ajudar?"
                    rows={3}
                    className="w-full px-5 py-4 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder:text-gray-400 resize-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gray-900 text-white rounded-full py-4 font-medium hover:bg-gray-800 transition-colors mt-4"
                  >
                    Agendar Chamada
                  </motion.button>
                </form>
              </motion.div>
            </FadeInUp>
          </div>
        </div>
      </section>

    </main>
  );
}

// Property Card Component - Premium Design
function PropertyCard({ 
  property, 
  formatPrice, 
  businessTypeLabels 
}: { 
  property: any; 
  formatPrice: (price: number | null) => string;
  businessTypeLabels: Record<string, string>;
}) {
  const coverImage = property.property_images?.find((img: any) => img.is_cover) ||
    property.property_images?.[0];

  return (
    <motion.article 
      whileHover={{ y: -12 }}
      className="group bg-card rounded-3xl overflow-hidden border border-border hover:border-yellow-500/30 hover:shadow-2xl transition-all duration-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/imoveis/${property.slug}`}>
          {coverImage ? (
            <Image
              src={coverImage.url}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </Link>
        
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-gray-900 shadow-lg">
            {businessTypeLabels[property.business_type] || 'Venda'}
          </span>
        </div>
        
        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-yellow-500 hover:text-white"
        >
          <Heart className="h-5 w-5" />
        </motion.button>
        
        {/* Quick View on Hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <Link href={`/imoveis/${property.slug}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl py-3 font-medium text-sm hover:bg-white transition-colors"
            >
              Ver Detalhes
            </motion.button>
          </Link>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">{property.municipality || property.district || 'Portugal'}</span>
        </div>
        
        <Link href={`/imoveis/${property.slug}`}>
          <h3 className="font-bold text-foreground text-lg mb-4 line-clamp-1 group-hover:text-yellow-500 transition-colors">
            {property.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5 pb-5 border-b border-border">
          {property.bedrooms !== null && (
            <span className="flex items-center gap-1.5">
              <Bed className="h-4 w-4" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms !== null && (
            <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" />
              {property.bathrooms}
            </span>
          )}
          {property.gross_area !== null && (
            <span className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4" />
              {property.gross_area} m²
            </span>
          )}
        </div>
        
        <p className="text-2xl font-bold text-foreground">
          {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
        </p>
      </div>
    </motion.article>
  );
}
