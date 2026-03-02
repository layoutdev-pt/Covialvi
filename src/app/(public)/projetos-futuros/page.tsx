import { Metadata } from 'next';
import Image from 'next/image';
import { MapPin, Calendar, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Projetos Futuros | Covialvi',
  description: 'Descubra os nossos próximos empreendimentos e seja o primeiro a conhecer as melhores oportunidades imobiliárias.',
};

async function getPublishedProjects() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('future_projects')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching future projects:', error);
    return [];
  }

  return data || [];
}

export default async function ProjetosFuturosPage() {
  const futureProjects = await getPublishedProjects();
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
          {futureProjects.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg">
                Nenhum projeto disponível no momento. Volte em breve!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {futureProjects.map((project: any) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={project.image_url}
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
                        Início: {project.start_date}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.features?.slice(0, 3).map((feature: string, idx: number) => (
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
          )}
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
