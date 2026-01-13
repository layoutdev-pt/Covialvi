'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home, 
  Leaf, 
  Palmtree, 
  Building2, 
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  TrendingUp,
  Heart
} from 'lucide-react';
import { FadeInUp, SlideInLeft, SlideInRight, StaggerContainer, StaggerItem } from '@/components/ui/motion';

const services = [
  {
    id: 1,
    icon: Home,
    title: 'Residências de Luxo',
    description: 'Experimente elegância incomparável nas nossas residências de luxo, com design requintado, comodidades premium e localizações privilegiadas para os gostos mais exigentes.',
    features: [
      'Propriedades exclusivas em localizações prime',
      'Acabamentos de alta qualidade',
      'Vistas panorâmicas e espaços amplos',
      'Segurança e privacidade garantidas'
    ],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075',
  },
  {
    id: 2,
    icon: Leaf,
    title: 'Edifícios Sustentáveis',
    description: 'Invista em propriedades eco-friendly com certificação energética de topo, materiais sustentáveis e tecnologia verde integrada para um futuro melhor.',
    features: [
      'Certificação energética A ou superior',
      'Painéis solares e energia renovável',
      'Materiais de construção sustentáveis',
      'Sistemas de eficiência hídrica'
    ],
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053',
  },
  {
    id: 3,
    icon: Palmtree,
    title: 'Casas de Férias',
    description: 'Descubra propriedades de férias em localizações deslumbrantes, perfeitas para relaxar ou como investimento rentável com retorno garantido.',
    features: [
      'Localizações turísticas premium',
      'Gestão de arrendamento incluída',
      'Alto retorno de investimento',
      'Manutenção profissional'
    ],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070',
  },
  {
    id: 4,
    icon: Building2,
    title: 'Investimento Comercial',
    description: 'Oportunidades de investimento em imóveis comerciais com rendimento estável e valorização a longo prazo.',
    features: [
      'Análise de mercado detalhada',
      'Contratos de arrendamento seguros',
      'Gestão de propriedades',
      'Consultoria fiscal especializada'
    ],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070',
  },
];

const benefits = [
  {
    icon: Users,
    title: 'Equipa Especializada',
    description: 'Profissionais com anos de experiência no mercado imobiliário português.'
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Processos transparentes e documentação legal completa em cada transação.'
  },
  {
    icon: TrendingUp,
    title: 'Valorização',
    description: 'Aconselhamento estratégico para maximizar o retorno do seu investimento.'
  },
  {
    icon: Heart,
    title: 'Serviço Personalizado',
    description: 'Acompanhamento dedicado desde a primeira visita até à escritura.'
  },
];

export default function ServicosPage() {
  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 lg:px-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <span className="inline-block px-4 py-2 rounded-full border border-border bg-background text-sm text-muted-foreground mb-6">
              Os Nossos Serviços
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              SOLUÇÕES IMOBILIÁRIAS<br />
              <span className="text-muted-foreground">COMPLETAS</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Oferecemos uma gama completa de serviços imobiliários, desde a compra e venda de propriedades de luxo até investimentos sustentáveis e gestão de arrendamentos.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-32">
            {services.map((service, index) => (
              <div 
                key={service.id}
                className={`grid lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={index % 2 === 1 ? 'lg:order-2' : ''}
                >
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg">
                        <service.icon className="h-7 w-7 text-gray-900" />
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={index % 2 === 1 ? 'lg:order-1' : ''}
                >
                  <span className="text-yellow-500 font-medium mb-2 block">0{service.id}</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {service.title}
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/imoveis">
                    <motion.button
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 text-foreground font-medium hover:text-yellow-500 transition-colors"
                    >
                      Ver Propriedades
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full border border-border bg-background text-sm text-muted-foreground mb-6">
                Porquê Escolher-nos
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                A Diferença Covialvi
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Combinamos experiência, dedicação e conhecimento do mercado para oferecer o melhor serviço imobiliário.
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
            {benefits.map((benefit) => (
              <StaggerItem key={benefit.title}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInUp>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pronto para começar?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Entre em contacto connosco e descubra como podemos ajudá-lo a encontrar a propriedade perfeita.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contacto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-foreground text-background rounded-full px-8 py-4 font-medium hover:opacity-90 transition-all"
                >
                  Contactar Agora
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link href="/imoveis">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 border border-border rounded-full px-8 py-4 font-medium text-foreground hover:bg-secondary transition-all"
                >
                  Ver Imóveis
                </motion.button>
              </Link>
            </div>
          </FadeInUp>
        </div>
      </section>
    </main>
  );
}
