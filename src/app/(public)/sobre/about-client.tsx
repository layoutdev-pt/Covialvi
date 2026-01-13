'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Users, Building2, Target, Phone, Mail, MapPin, CheckCircle2, Heart, Shield, Handshake } from 'lucide-react';
import { 
  FadeInUp, 
  SlideInLeft, 
  SlideInRight, 
  StaggerContainer,
  StaggerItem,
  ScaleIn
} from '@/components/ui/motion';
import { motion, useInView } from 'framer-motion';

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

export function AboutClient() {
  const [heroExpanded, setHeroExpanded] = useState(false);
  
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

  const stats = [
    { value: 25, suffix: '+', label: 'Anos de Experiência' },
    { value: 500, suffix: '+', label: 'Imóveis Vendidos' },
    { value: 98, suffix: '%', label: 'Clientes Satisfeitos' },
    { value: 50, suffix: '+', label: 'Projetos Concluídos' },
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
                Há mais de 25 anos a ajudar famílias portuguesas a encontrar o lar perfeito. 
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
                    className="group flex items-center gap-2 bg-yellow-500 text-white rounded-full pl-6 pr-2 py-3 font-medium hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-500/25"
                  >
                    <span>Ver Imóveis</span>
                    <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </motion.button>
                </Link>
                <Link href="/contacto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white rounded-full px-6 py-3 font-medium hover:bg-white/20 transition-all border border-white/20"
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


      {/* Story */}
      <section className="py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SlideInLeft>
              <span className="inline-block px-4 py-2 bg-secondary rounded-full text-sm text-muted-foreground mb-4">
                A Nossa História
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Uma Tradição de<br />Excelência Imobiliária
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  A <strong className="text-foreground">Covialvi</strong> nasceu da paixão pelo imobiliário e pelo desejo de oferecer 
                  um serviço diferenciado no mercado português. Desde a nossa fundação, 
                  temos vindo a construir uma reputação sólida baseada na confiança, 
                  transparência e excelência.
                </p>
                <p>
                  Com raízes profundas na região da <strong className="text-foreground">Beira Interior</strong>, expandimos a nossa 
                  atuação para todo o território nacional, mantendo sempre o compromisso 
                  com a qualidade e o atendimento personalizado que nos caracteriza.
                </p>
                <p>
                  A nossa equipa é composta por profissionais experientes e apaixonados, 
                  que trabalham diariamente para encontrar a solução ideal para cada 
                  cliente, seja na compra, venda ou arrendamento de imóveis.
                </p>
              </div>
              
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
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053"
                  alt="Modern home"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </motion.div>
            </SlideInRight>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SlideInLeft>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973"
                  alt="Team meeting"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </SlideInLeft>
            
            <SlideInRight>
              <span className="inline-block px-4 py-2 bg-background rounded-full text-sm text-muted-foreground mb-4">
                Os Nossos Serviços
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Soluções Completas<br />Para as Suas Necessidades
              </h2>
              <p className="text-muted-foreground mb-8">
                Oferecemos uma gama completa de serviços imobiliários para garantir 
                que encontra exatamente o que procura, com todo o apoio necessário.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <motion.div 
                    key={service}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-foreground font-medium">{service}</span>
                  </motion.div>
                ))}
              </div>
            </SlideInRight>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-secondary rounded-full text-sm text-muted-foreground mb-4">
              Os Nossos Valores
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Princípios que Nos Guiam
            </h2>
            <p className="text-muted-foreground text-lg">
              Valores que guiam cada decisão e cada interação com os nossos clientes.
            </p>
          </FadeInUp>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-card p-8 rounded-2xl border border-border text-center hover:border-yellow-500/50 hover:shadow-xl transition-all"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6"
                  >
                    <value.icon className="h-8 w-8 text-yellow-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-background rounded-full text-sm text-muted-foreground mb-4">
              Contacte-nos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Estamos Aqui Para Ajudar
            </h2>
            <p className="text-muted-foreground text-lg">
              Entre em contacto connosco através de qualquer um dos nossos canais.
            </p>
          </FadeInUp>

          <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
            <StaggerItem>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-2xl border border-border text-center"
              >
                <div className="w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Telefone</h3>
                <p className="text-muted-foreground">+351 275 XXX XXX</p>
              </motion.div>
            </StaggerItem>
            
            <StaggerItem>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-2xl border border-border text-center"
              >
                <div className="w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground">info@covialvi.com</p>
              </motion.div>
            </StaggerItem>
            
            <StaggerItem>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-2xl border border-border text-center"
              >
                <div className="w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Morada</h3>
                <p className="text-muted-foreground">Fundão, Portugal</p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
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
                        <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8">
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
