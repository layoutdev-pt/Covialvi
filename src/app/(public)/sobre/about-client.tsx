'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Users, Building2, Target, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { 
  FadeIn, 
  FadeInUp, 
  SlideInLeft, 
  SlideInRight, 
  StaggerContainer,
  StaggerItem,
  ScaleIn
} from '@/components/ui/motion';
import { motion } from 'framer-motion';

export function AboutClient() {
  const values = [
    {
      icon: Award,
      title: 'Excelência',
      description: 'Comprometemo-nos com os mais altos padrões de qualidade em todos os nossos serviços.',
    },
    {
      icon: Users,
      title: 'Proximidade',
      description: 'Construímos relações duradouras baseadas na confiança e no respeito mútuo.',
    },
    {
      icon: Building2,
      title: 'Experiência',
      description: 'Décadas de conhecimento do mercado imobiliário português ao seu serviço.',
    },
    {
      icon: Target,
      title: 'Resultados',
      description: 'Focamo-nos em encontrar a solução perfeita para cada cliente.',
    },
  ];

  const stats = [
    { value: '25+', label: 'Anos de Experiência' },
    { value: '500+', label: 'Imóveis Vendidos' },
    { value: '98%', label: 'Clientes Satisfeitos' },
    { value: '50+', label: 'Projetos Concluídos' },
  ];

  const services = [
    'Compra e Venda de Imóveis',
    'Arrendamento',
    'Avaliação de Imóveis',
    'Consultoria Imobiliária',
    'Gestão de Património',
    'Apoio Jurídico e Financeiro',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973"
          alt="Covialvi Team"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
          <FadeInDown delay={0.2}>
            <span className="inline-block px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-full text-sm text-yellow-300 border border-yellow-500/30 mb-6">
              Sobre Nós
            </span>
          </FadeInDown>
          <FadeInUp delay={0.4}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              A Sua Imobiliária<br />
              <span className="text-yellow-400">de Confiança</span>
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.6}>
            <p className="text-xl text-white/80 max-w-2xl">
              Há mais de 25 anos a ajudar famílias portuguesas a encontrar o lar perfeito. 
              Somos especialistas em imóveis na região da Beira Interior e em todo o país.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-yellow-500 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8" staggerDelay={0.1}>
            {stats.map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-yellow-100">{stat.label}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
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
    </div>
  );
}

function FadeInDown({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
