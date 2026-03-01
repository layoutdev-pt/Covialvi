import { Metadata } from 'next';
import Image from 'next/image';
import { MapPin, Calendar, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Projetos Futuros | Covialvi',
  description: 'Descubra os nossos próximos empreendimentos e seja o primeiro a conhecer as melhores oportunidades imobiliárias.',
};

const futureProjects = [
  {
    id: 1,
    title: 'Residencial Vila Nova',
    description: 'Empreendimento moderno com 50 unidades habitacionais, incluindo apartamentos T2 e T3 com acabamentos de luxo e áreas comuns premium.',
    fullDescription: 'O Residencial Vila Nova representa o futuro da habitação moderna na Covilhã. Com 50 unidades cuidadosamente projetadas, este empreendimento oferece apartamentos T2 e T3 com acabamentos de primeira qualidade. As áreas comuns incluem jardins paisagísticos, parque infantil, ginásio e espaços de convívio. Certificação energética A+ e materiais sustentáveis garantem conforto e eficiência.',
    status: 'Início em 2026',
    location: 'Covilhã',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070',
    features: ['50 Unidades', 'T2 e T3', 'Certificação A+', 'Áreas Comuns Premium'],
    startDate: '2026',
  },
  {
    id: 2,
    title: 'Condomínio Jardim das Flores',
    description: 'Projeto residencial sustentável com certificação energética A+, espaços verdes e infraestruturas eco-friendly para famílias modernas.',
    fullDescription: 'O Condomínio Jardim das Flores é um projeto pioneiro em sustentabilidade na região. Com amplos espaços verdes, painéis solares, sistemas de reaproveitamento de águas pluviais e materiais de construção ecológicos, este empreendimento oferece qualidade de vida em harmonia com o ambiente. Ideal para famílias que valorizam o contacto com a natureza sem abdicar do conforto urbano.',
    status: 'Em Breve',
    location: 'Fundão',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070',
    features: ['Sustentável', 'Espaços Verdes', 'Painéis Solares', 'Eco-Friendly'],
    startDate: '2026',
  },
  {
    id: 3,
    title: 'Loteamento Serra da Estrela',
    description: 'Lotes para construção em localização privilegiada com vista panorâmica para a Serra da Estrela, ideal para moradias unifamiliares.',
    fullDescription: 'Localizado numa das zonas mais privilegiadas de Belmonte, o Loteamento Serra da Estrela oferece lotes para construção de moradias unifamiliares com vistas deslumbrantes para a Serra da Estrela. Infraestruturas completas, acesso facilitado e proximidade a serviços essenciais fazem deste projeto a escolha ideal para quem procura construir a casa dos sonhos num ambiente tranquilo e natural.',
    status: '2026',
    location: 'Belmonte',
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=2070',
    features: ['Lotes Personalizados', 'Vista Panorâmica', 'Infraestruturas Completas', 'Localização Premium'],
    startDate: '2026',
  },
  {
    id: 4,
    title: 'Edifício Central Plaza',
    description: 'Empreendimento comercial e residencial no centro da cidade, com lojas, escritórios e apartamentos de luxo.',
    fullDescription: 'O Edifício Central Plaza é um projeto de uso misto que combina comércio, escritórios e habitação de luxo no coração da cidade. Com arquitetura contemporânea e acabamentos premium, este empreendimento oferece a conveniência de viver, trabalhar e fazer compras no mesmo local. Estacionamento subterrâneo, segurança 24h e áreas de lazer completam a oferta.',
    status: 'Planeamento',
    location: 'Covilhã',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070',
    features: ['Uso Misto', 'Centro Cidade', 'Estacionamento', 'Segurança 24h'],
    startDate: '2027',
  },
  {
    id: 5,
    title: 'Quinta do Vale',
    description: 'Condomínio fechado com moradias geminadas e isoladas, piscina comum e áreas de lazer em ambiente rural.',
    fullDescription: 'A Quinta do Vale é um condomínio fechado que oferece o melhor de dois mundos: a tranquilidade do campo com a proximidade à cidade. Moradias geminadas e isoladas com jardins privativos, piscina comum, campos de ténis e parque infantil. Segurança 24h e manutenção de espaços comuns incluídas. Perfeito para famílias que procuram qualidade de vida.',
    status: 'Em Breve',
    location: 'Tortosendo',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070',
    features: ['Condomínio Fechado', 'Piscina Comum', 'Segurança 24h', 'Ambiente Rural'],
    startDate: '2026',
  },
  {
    id: 6,
    title: 'Residencial Horizonte',
    description: 'Apartamentos modernos com varandas amplas, garagem e arrecadação, próximo a escolas e serviços.',
    fullDescription: 'O Residencial Horizonte é um projeto pensado para o conforto familiar. Apartamentos T1, T2 e T3 com varandas generosas, garagem box e arrecadação. Localizado numa zona residencial tranquila mas próxima a escolas, supermercados e transportes públicos. Acabamentos de qualidade e eficiência energética garantida.',
    status: 'Planeamento',
    location: 'Fundão',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070',
    features: ['T1, T2 e T3', 'Garagem Box', 'Próximo Serviços', 'Varandas Amplas'],
    startDate: '2027',
  },
];

export default function ProjetosFuturosPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 lg:px-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium mb-6">
            Novidades
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Projetos Futuros
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubra os nossos próximos empreendimentos e seja o primeiro a conhecer as melhores oportunidades imobiliárias
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {futureProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-semibold">
                    {project.status}
                  </span>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      {project.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Início: {project.startDate}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-yellow-500 group-hover:text-white group-hover:border-yellow-500 transition-colors"
                  >
                    <Link href="/contacto" className="flex items-center justify-center gap-2">
                      Manifestar Interesse
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <Building2 className="h-16 w-16 mx-auto mb-6 text-yellow-500" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Interessado num Projeto?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Entre em contacto connosco para receber mais informações sobre os nossos projetos futuros e garantir a sua reserva antecipada.
          </p>
          <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Link href="/contacto">
              Contactar-nos
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
