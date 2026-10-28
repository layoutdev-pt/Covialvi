'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useScroll, useTransform, type MotionValue } from 'framer-motion';
import {
  Home,
  KeyRound,
  ClipboardCheck,
  Lightbulb,
  Scale,
  ArrowRight,
  Plus,
  Phone,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeInUp, ScaleIn } from '@/components/ui/motion';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Service {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  image: string;
  href: string;
  cta: string;
  /** Grid span on large screens */
  span: string;
}

const services: Service[] = [
  {
    id: 1,
    icon: Home,
    title: 'Compra e Venda de Imóveis',
    description: 'Acompanhamos todo o processo, da primeira visita à escritura, de forma simples, segura e transparente.',
    features: ['Seleção à sua medida', 'Visitas e negociação', 'Apoio na escritura'],
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070',
    href: '/imoveis',
    cta: 'Ver imóveis',
    span: 'lg:col-span-4',
  },
  {
    id: 2,
    icon: KeyRound,
    title: 'Arrendamento',
    description: 'Casas para arrendar, com contratos claros e total tranquilidade para quem procura o seu novo lar.',
    features: ['Contratos seguros', 'Acompanhamento'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070',
    href: '/imoveis',
    cta: 'Ver imóveis',
    span: 'lg:col-span-2',
  },
  {
    id: 3,
    icon: ClipboardCheck,
    title: 'Avaliação de Imóveis',
    description: 'Saiba quanto vale o seu imóvel, com base no mercado real e sem compromisso.',
    features: ['Análise da zona', 'Imóveis comparáveis', 'Sem compromisso'],
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070',
    href: '/avaliacao-completa',
    cta: 'Pedir avaliação',
    span: 'lg:col-span-2',
  },
  {
    id: 4,
    icon: Lightbulb,
    title: 'Consultoria Imobiliária',
    description: 'Aconselhamento próximo para investir, comprar ou vender com a informação certa.',
    features: ['Oportunidades', 'Orientação por fases', 'Conhecimento local'],
    image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=2070',
    href: '/contacto',
    cta: 'Falar connosco',
    span: 'lg:col-span-2',
  },
  {
    id: 5,
    icon: Scale,
    title: 'Apoio Jurídico e Financeiro',
    description: 'Parceiros de confiança para que a burocracia e o crédito deixem de ser uma preocupação.',
    features: ['Documentação', 'Crédito habitação', 'Contratos e escrituras'],
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070',
    href: '/contacto',
    cta: 'Falar connosco',
    span: 'lg:col-span-2',
  },
];

const benefits: { title: string; description: string }[] = [
  {
    title: 'Equipa Especializada',
    description: 'Profissionais com anos de experiência no mercado imobiliário português.',
  },
  {
    title: 'Segurança Total',
    description: 'Processos transparentes e documentação legal completa em cada transação.',
  },
  {
    title: 'Valorização',
    description: 'Aconselhamento estratégico para maximizar o retorno do seu investimento.',
  },
  {
    title: 'Serviço Personalizado',
    description: 'Acompanhamento dedicado desde a primeira visita até à escritura.',
  },
];

const highlights = [
  { value: 30, suffix: '', label: 'Anos de experiência' },
  { value: 1000, suffix: '+', label: 'Imóveis vendidos' },
  { value: 5, suffix: '', label: 'Serviços num só lugar' },
];

/** Counts up from 0 to the value, once, when it comes into view */
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 2.4,
      delay: 0.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setCurrent(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {current}
      {suffix}
    </span>
  );
}

const STATEMENT =
  'Uma equipa especializada, processos seguros e transparentes, aconselhamento estratégico e um acompanhamento dedicado, da primeira visita até à escritura.';

function RevealWord({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.28em] inline-block">
      {word}
    </motion.span>
  );
}

function WordReveal({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 82%', 'end 62%'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className="text-3xl font-light leading-[1.2] tracking-tight text-foreground md:text-5xl">
      {words.map((word, i) => {
        const start = i / words.length;
        return <RevealWord key={i} word={word} progress={scrollYProgress} range={[start, Math.min(1, start + 1.5 / words.length)]} />;
      })}
    </p>
  );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay: (index % 3) * 0.1, ease: EASE }}
      className={service.span}
    >
      <Link
        href={service.href}
        className="group relative flex h-full min-h-[400px] flex-col overflow-hidden rounded-3xl bg-[#0b1016] text-white shadow-xl shadow-black/10 lg:min-h-[470px]"
      >
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-colors duration-700 group-hover:from-black/90 group-hover:via-black/50" />

        {/* Number and icon */}
        <div className="relative flex items-start justify-between p-6 md:p-8 md:pb-0">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-white shadow-[0_12px_30px_-10px_rgba(234,179,8,0.7)]">
            <service.icon className="h-6 w-6" strokeWidth={1.6} />
          </span>
          <span className="text-sm tabular-nums text-white/70">0{service.id}</span>
        </div>

        <div className="relative mt-auto p-6 pt-10 md:p-8 md:pt-10">
          <h3 className="text-2xl font-light leading-tight tracking-tight md:text-3xl">{service.title}</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 md:text-base">{service.description}</p>

          {/* Key points: always visible on touch screens, revealed on hover on desktop */}
          <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-700 ease-out lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <ul className="flex flex-wrap gap-2 pt-5">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-yellow-400">
              {service.cta}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white transition-transform duration-500 group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>

            {/* Hint for desktop: the details appear on hover */}
            <span className="hidden items-center gap-1.5 text-xs text-white/70 transition-opacity duration-500 group-hover:opacity-0 lg:inline-flex">
              <Plus className="h-3.5 w-3.5" />
              Passe o rato
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ServicosPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#0b1016] px-6 pb-24 pt-40 md:px-12 md:pb-32 md:pt-48 lg:px-20">
        <Image
          src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b1016] via-[#0b1016]/75 to-[#0b1016]/20" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#0b1016] to-transparent" />

        <div className="mx-auto max-w-7xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
            Os Nossos Serviços
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: EASE }}
            className="max-w-3xl text-4xl font-light leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            Soluções imobiliárias
            <br />
            <span className="text-yellow-500">completas</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/70"
          >
            Da compra e venda ao arrendamento, da avaliação à consultoria e ao apoio jurídico e financeiro: tudo o que
            precisa, num só lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: EASE }}
            className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-8"
          >
            {highlights.map((item) => (
              <div key={item.label}>
                <p className="text-3xl font-light tabular-nums text-white md:text-4xl">
                  <CountUp value={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-1 text-xs text-white/60 md:text-sm">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services bento */}
      <section className="px-4 py-20 md:px-8 md:py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-12 flex flex-col justify-between gap-4 md:mb-16 md:flex-row md:items-end"
          >
            <h2 className="text-3xl font-light leading-[1.1] tracking-tight text-foreground md:text-5xl">
              Tudo o que precisa,
              <br />
              <span className="text-yellow-500">do início à escritura</span>
            </h2>
            <p className="max-w-sm text-muted-foreground">
              Escolha o serviço e descubra como o podemos ajudar. Passe o rato por cima para ver os detalhes.
            </p>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-6 lg:gap-6">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Why us: statement that lights up word by word while scrolling, then four principles */}
      <section className="bg-secondary/30 px-4 py-20 md:px-8 md:py-32 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
            A Diferença Covialvi
          </span>
          <WordReveal text={STATEMENT} />

          {/* The four principles appear one after the other */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.75, delayChildren: 0.1 } } }}
            className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE } },
                }}
              >
                <motion.div
                  variants={{
                    hidden: { scaleX: 0 },
                    show: { scaleX: 1, transition: { duration: 1.2, ease: EASE } },
                  }}
                  className="mb-6 h-px origin-left bg-yellow-500"
                />
                <p className="text-5xl font-extralight tabular-nums text-yellow-500 md:text-6xl">0{index + 1}</p>
                <h3 className="mt-5 text-xl font-normal text-foreground">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA - same as the About page */}
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
