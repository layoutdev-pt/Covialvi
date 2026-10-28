'use client';
import { ScrollRevealText } from '@/components/ui/scroll-reveal-text';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Users, Building2, Target, Phone, Mail, MapPin, CheckCircle2, Heart, Shield, Handshake, MessageCircle, Search, CalendarCheck, KeyRound, type LucideIcon } from 'lucide-react';
import { company } from '@/lib/company';
import { 
  FadeInUp, 
  SlideInLeft, 
  SlideInRight, 
  StaggerContainer,
  StaggerItem,
  ScaleIn
} from '@/components/ui/motion';
import { motion, useInView } from 'framer-motion';
import { PortugalMap } from '@/components/portugal-map';
import { OpenStatus } from '@/components/open-status';

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

function PrincipleRow({ value, number, className = '' }: { value: { icon: LucideIcon; title: string; description: string }; number: number; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={`group relative grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-4 py-6 sm:gap-x-6 ${className}`}
    >
      {/* Grey track under the row; the gold line draws over it and stays */}
      <span aria-hidden="true" className="absolute -bottom-px left-0 h-px w-full bg-border" />
      <motion.span
        aria-hidden="true"
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: 1, transition: { duration: 1.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] } },
        }}
        className="absolute -bottom-px left-0 z-10 h-px w-full origin-left bg-yellow-500"
      />
      <span className="pt-1.5 text-sm tabular-nums text-yellow-600">{String(number).padStart(2, '0')}</span>
      <div>
        <h3 className="text-2xl font-light tracking-tight text-foreground transition-transform duration-500 group-hover:translate-x-1">
          {value.title}
        </h3>
        <p className="mt-2 max-w-md text-muted-foreground">{value.description}</p>
      </div>
    </motion.div>
  );
}

const FACTS = [
  { title: 'Raízes locais', text: 'Beira Interior' },
  { title: 'Presença nacional', text: 'Todo o território' },
  { title: 'Equipa dedicada', text: 'Atendimento pessoal' },
];

export function AboutClient() {
  const [heroExpanded, setHeroExpanded] = useState(false);
  const [activeFact, setActiveFact] = useState<number | null>(null);
  const factsRef = useRef<HTMLUListElement>(null);
  const factsInView = useInView(factsRef, { once: true, amount: 0.6 });

  // Entrance effect: when the section is reached, each box turns yellow in turn and then goes back to white
  useEffect(() => {
    if (!factsInView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    FACTS.forEach((_, index) => {
      timers.push(setTimeout(() => setActiveFact(index), 150 + index * 450));
    });
    timers.push(setTimeout(() => setActiveFact(null), 150 + FACTS.length * 450));
    return () => timers.forEach(clearTimeout);
  }, [factsInView]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroExpanded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const values = [
    {
      icon: Award,
      title: 'Excelência',
      description: 'Comprometemo-nos com os mais altos padrões de qualidade em todos os nossos serviços.',
    },
    {
      icon: Heart,
      title: 'Proximidade',
      description: 'Construímos relações duradouras baseadas na confiança e no respeito mútuo.',
    },
    {
      icon: Shield,
      title: 'Confiança',
      description: 'Décadas de conhecimento do mercado imobiliário português ao seu serviço.',
    },
    {
      icon: Handshake,
      title: 'Compromisso',
      description: 'Focamo-nos em encontrar a solução perfeita para cada cliente.',
    },
  ];

  const journeySteps: { icon: LucideIcon; title: string; text: string }[] = [
    { icon: MessageCircle, title: 'Fale connosco', text: 'Diga-nos o que procura ou quer vender. Respondemos depressa.' },
    { icon: Search, title: 'Encontramos o ideal', text: 'Selecionamos imóveis à sua medida ou avaliamos o seu, sem compromisso.' },
    { icon: CalendarCheck, title: 'Visita e negociação', text: 'Acompanhamos as visitas e negociamos por si, com transparência.' },
    { icon: KeyRound, title: 'Escritura e chaves', text: 'Tratamos da burocracia. Só lhe falta abrir a porta.' },
  ];

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${company.address.street}, ${company.address.detail}, ${company.address.postalCode} ${company.address.locality}`
  )}`;

  const stats = [
    { value: 30, suffix: '', label: 'Anos de Experiência' },
    { value: 1000, suffix: '+', label: 'Imóveis Vendidos' },
    { value: 100, suffix: '+', label: 'Projetos Concluídos' },
  ];

  const services = [
    'Compra e Venda de Imóveis',
    'Arrendamento',
    'Avaliação de Imóveis',
    'Consultoria Imobiliária',
    'Gestão de Património',
    'Apoio Jurídico e Financeiro',
  ];

  const team = [
    {
      name: 'João Silva',
      role: 'Diretor Geral',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400',
    },
    {
      name: 'Maria Santos',
      role: 'Consultora Sénior',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400',
    },
    {
      name: 'Pedro Costa',
      role: 'Gestor de Imóveis',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
    },
  ];

  return (
    <main className="bg-background overflow-hidden">
      {/* Hero Section - Matching Homepage Style */}
      <section className="pt-[88px] pb-4 px-6 md:px-12 lg:px-20">
        <motion.div 
          className="relative max-w-7xl mx-auto rounded-3xl overflow-hidden min-h-[500px] md:min-h-[600px]"
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
            animate={{ scale: heroExpanded ? 1 : 1.1 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <Image
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973"
              alt="Covialvi Team"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          
          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 lg:p-16 min-h-[500px] md:min-h-[600px]">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="inline-block px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-full text-sm text-yellow-300 border border-yellow-500/30 mb-6">
                  Sobre Nós
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight"
              >
                A SUA<br />
                IMOBILIÁRIA<br />
                <span className="text-yellow-400">DE CONFIANÇA</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-white/70 text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
              >
                Há mais de 30 anos a ajudar famílias portuguesas a encontrar o lar perfeito. 
                Somos especialistas em imóveis na região da Beira Interior e em todo o país.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/imoveis">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex h-14 min-w-[200px] items-center justify-between gap-3 rounded-full bg-yellow-500 pl-7 pr-2 font-medium text-white shadow-lg shadow-yellow-500/25 transition-all hover:bg-yellow-600"
                  >
                    <span>Ver Imóveis</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </motion.button>
                </Link>
                <Link href="/contacto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Contactar</span>
                  </motion.button>
                </Link>
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
                {stats.map((stat, index) => (
                  <div key={stat.label} className="group">
                    <p className="text-4xl md:text-5xl font-bold text-white mb-1">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-white/50 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>


      {/* Story - short and visual */}
      <section className="py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <SlideInLeft>
              <span className="inline-block px-4 py-2 bg-secondary rounded-full text-sm text-muted-foreground mb-4">
                A Nossa História
              </span>
              <ScrollRevealText as="h2" className="text-3xl md:text-5xl font-light tracking-tight text-foreground mb-5 leading-[1.1]" segments={[{ text: "Uma tradição de", breakAfter: true }, { text: "excelência imobiliária" }]} />
              <p className="text-lg text-muted-foreground max-w-md">
                Da <strong className="font-medium text-foreground">Beira Interior</strong> para todo o país, com
                o mesmo compromisso: confiança, transparência e atendimento próximo.
              </p>

              <ul ref={factsRef} className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {FACTS.map((item, index) => {
                  const active = activeFact === index;
                  return (
                    <motion.li
                      key={item.title}
                      initial={{ opacity: 0, y: 28 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      className={`rounded-2xl border px-4 py-3.5 transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
                        active
                          ? 'border-yellow-500 bg-yellow-500 shadow-lg shadow-yellow-500/25'
                          : 'border-border bg-card'
                      }`}
                    >
                      <p className={`text-sm font-medium transition-colors duration-300 ${active ? 'text-[#ffffff]' : 'text-foreground'}`}>
                        {item.title}
                      </p>
                      <p className={`text-sm transition-colors duration-300 ${active ? 'text-[#ffffff]/85' : 'text-muted-foreground'}`}>
                        {item.text}
                      </p>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/imoveis">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-6">
                      Ver Imóveis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/contacto">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="rounded-full px-6">
                      Contactar
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </SlideInLeft>

            <SlideInRight>
              <PortugalMap />
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Da <span className="font-medium text-yellow-600">Covilhã</span> a todo o país
              </p>
            </SlideInRight>
          </div>
        </div>
      </section>

      {/* Customer journey - four easy steps */}
      <section className="relative overflow-hidden bg-[#0b1016] py-20 md:py-28 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <FadeInUp className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              O Seu Caminho
            </span>
            <ScrollRevealText as="h2" className="text-3xl font-light leading-tight tracking-tight text-white md:text-5xl" segments={[{ text: "Do primeiro contacto", breakAfter: true }, { text: "às chaves na mão", className: "text-yellow-500" }]} />
            <ScrollRevealText as="p" className="mt-5 text-white/60" segments={[{ text: "Quatro passos simples. Nós tratamos do resto." }]} />
          </FadeInUp>

          <div className="relative">
            {/* Connecting line: horizontal on desktop, vertical on mobile */}
            <motion.div
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-[12.5%] right-[12.5%] top-12 hidden h-px origin-left bg-gradient-to-r from-yellow-500/70 via-yellow-500 to-yellow-500/70 lg:block"
            />
            <div aria-hidden="true" className="absolute bottom-10 left-12 top-12 w-px bg-gradient-to-b from-yellow-500/70 via-yellow-500/50 to-transparent lg:hidden" />

            <ol className="relative grid gap-12 lg:grid-cols-4 lg:gap-6">
              {journeySteps.map((step, index) => (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="flex gap-6 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
                >
                  <div className="relative flex-shrink-0">
                    <motion.div
                      whileHover={{ y: -6, rotate: -3 }}
                      className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-500 to-amber-400 text-white shadow-[0_18px_40px_-12px_rgba(234,179,8,0.55)]"
                    >
                      <step.icon className="h-10 w-10" strokeWidth={1.6} />
                    </motion.div>
                    <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#0b1016] text-xs font-medium text-white">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="lg:mt-8">
                    <h3 className="text-xl font-normal text-white">{step.title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60 lg:mx-auto">{step.text}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>

          <FadeInUp delay={0.2} className="mt-14 text-center md:mt-20">
            <Link href="/contacto">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 rounded-full bg-yellow-500 py-2 pl-7 pr-2 font-medium text-white shadow-lg shadow-yellow-500/25 transition-colors hover:bg-yellow-600"
              >
                Começar agora
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </motion.span>
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* Services */}
      <section className="bg-secondary/30 px-4 py-20 md:px-8 md:py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-20">
            <SlideInLeft className="lg:h-full lg:pt-[52px]">
              <div className="relative lg:h-full">
                {/* Soft golden frame offset behind the photo */}
                <div
                  aria-hidden="true"
                  className="absolute -bottom-4 -left-4 hidden h-full w-full rounded-3xl border border-yellow-500/40 sm:block"
                />
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-black/15 lg:aspect-auto lg:h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973"
                    alt="Chaves e maqueta de uma casa"
                    fill
                    className="object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>
              </div>
            </SlideInLeft>

            <SlideInRight>
              <span className="mb-4 inline-block rounded-full bg-background px-4 py-2 text-sm text-muted-foreground">
                Os Nossos Serviços
              </span>
              <ScrollRevealText as="h2" className="mb-8 text-3xl font-light leading-[1.1] tracking-tight text-foreground md:text-5xl" segments={[{ text: "Soluções completas", breakAfter: true }, { text: "para as suas necessidades", className: "text-yellow-500" }]} />

              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {services.map((service, index) => (
                  <motion.li
                    key={service}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 rounded-2xl bg-background px-4 py-4 shadow-[0_6px_24px_-10px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(234,179,8,0.35)] hover:ring-yellow-500/40"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                    </span>
                    <span className="text-[15px] leading-snug text-foreground">{service}</span>
                  </motion.li>
                ))}
              </ul>
            </SlideInRight>
          </div>
        </div>
      </section>

      {/* Values - principles: one under the headline, three on the right, rows aligned across both columns */}
      <section className="px-4 py-16 md:px-8 md:py-20 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-x-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_auto_auto]">
          <FadeInUp className="mb-10 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mb-8">
            <span className="mb-5 inline-block rounded-full bg-secondary px-4 py-2 text-sm text-muted-foreground">
              Os Nossos Valores
            </span>
            <ScrollRevealText as="h2" className="text-3xl font-light leading-[1.1] tracking-tight text-foreground md:text-5xl" segments={[{ text: "Princípios", breakAfter: true }, { text: "que nos guiam", className: "text-yellow-500" }]} />
            <ScrollRevealText as="p" className="mt-5 max-w-sm text-lg text-muted-foreground" segments={[{ text: "Quatro ideias simples que orientam cada decisão e cada conversa com os nossos clientes." }]} />
          </FadeInUp>

          {values.map((value, index) => (
            <PrincipleRow
              key={value.title}
              value={value}
              number={index + 1}
              className={
                index === 0
                  ? 'lg:col-start-1 lg:row-start-3 border-t border-border'
                  : ['', 'lg:col-start-2 lg:row-start-1', 'lg:col-start-2 lg:row-start-2', 'lg:col-start-2 lg:row-start-3'][index]
              }
            />
          ))}
        </div>
      </section>

      {/* Contact Info + map */}
      <section className="bg-secondary/30 px-4 py-16 md:px-8 md:py-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl items-stretch gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <FadeInUp className="flex flex-col justify-center">
            <span className="mb-5 inline-block self-start rounded-full bg-background px-4 py-2 text-sm text-muted-foreground">
              Contacte-nos
            </span>
            <ScrollRevealText as="h2" className="text-3xl font-light leading-[1.1] tracking-tight text-foreground md:text-5xl" segments={[{ text: "Estamos aqui", breakAfter: true }, { text: "para ajudar", className: "text-yellow-500" }]} />
            <ScrollRevealText as="p" className="mt-5 max-w-sm text-lg text-muted-foreground" segments={[{ text: "Fale connosco por qualquer um dos nossos canais ou visite-nos em Tortosendo." }]} />

            <ul className="mt-8 border-t border-border">
              {[
                { icon: Phone, label: 'Telefone', value: company.phone, href: `tel:${company.phoneTel}` },
                { icon: Mail, label: 'Email', value: company.email, href: `mailto:${company.email}` },
                {
                  icon: MapPin,
                  label: 'Morada',
                  value: `${company.address.street}, ${company.address.detail}, ${company.address.postalCode} ${company.address.locality}`,
                  href: mapsLink,
                },
              ].map((item) => (
                <li key={item.label} className="border-b border-border">
                  <a
                    href={item.href}
                    {...(item.label === 'Morada' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center gap-5 py-5"
                  >
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-background text-foreground shadow-[0_6px_20px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transition-colors duration-300 group-hover:bg-yellow-500 group-hover:text-white">
                      <item.icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</span>
                      <span className="mt-1 block break-words text-foreground transition-colors group-hover:text-yellow-600">{item.value}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 -translate-x-2 text-yellow-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-background px-5 py-4 shadow-[0_6px_24px_-10px_rgba(0,0,0,0.12)] ring-1 ring-black/5 dark:ring-white/10">
              <OpenStatus />
              <p className="mt-1.5 pl-[22px] text-xs text-muted-foreground">{company.hours}</p>
            </div>
          </FadeInUp>

          <ScaleIn>
            <div className="relative h-[360px] overflow-hidden rounded-3xl shadow-2xl shadow-black/10 ring-1 ring-black/5 lg:h-full lg:min-h-[460px]">
              <iframe
                title="Localização da Covialvi"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1521.5!2d-7.508579!3d40.2268017!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd3d3d8a2b44f8a7%3A0xb87b2a0de875d062!2sFRENTE%20PRINCIPAL!5e0!3m2!1spt-PT!2spt!4v1704900000000!5m2!1spt-PT!2spt"
                className="absolute inset-0 h-full w-full border-0 dark:[filter:invert(0.92)_hue-rotate(180deg)_saturate(0.8)]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:bg-yellow-500 hover:text-white"
              >
                <MapPin className="h-4 w-4" />
                Abrir no Google Maps
              </a>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <ScaleIn>
            <div className="relative rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
                alt="Modern house"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
              
              <div className="relative z-10 py-20 px-8 md:px-16 text-center">
                <FadeInUp delay={0.2}>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Pronto Para Encontrar<br />o Seu Novo Lar?
                  </h2>
                </FadeInUp>
                <FadeInUp delay={0.4}>
                  <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
                    Entre em contacto connosco e descubra como podemos ajudá-lo a 
                    encontrar o imóvel perfeito para si e para a sua família.
                  </p>
                </FadeInUp>
                <FadeInUp delay={0.6}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/imoveis">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-8 shadow-lg shadow-yellow-500/25">
                          Ver Imóveis
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href="/contacto">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" variant="outline" className="rounded-full border-white/30 bg-white/5 px-8 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white">
                          Contactar
                          <Phone className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </FadeInUp>
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>
    </main>
  );
}
