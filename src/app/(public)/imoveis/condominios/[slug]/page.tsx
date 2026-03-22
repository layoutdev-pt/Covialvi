import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Building2, Bed, Maximize, ArrowLeft } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { CONDOMINIOS } from '@/lib/condominios';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const formatPrice = (price: number | null) => {
  if (price === null) return 'Sob Consulta';
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' €';
};

async function getCondominioProperties(slug: string) {
  const condo = CONDOMINIOS.find((c) => c.slug === slug);
  if (!condo) return null;

  const supabase = createServiceClient();

  let query = supabase
    .from('properties')
    .select('id, title, slug, price, price_on_request, bedrooms, gross_area, construction_status, municipality, district, property_images(*)')
    .eq('status', 'published')
    .order('title');

  if (condo.filterType === 'address') {
    query = query.ilike('address', `%${condo.filterValue}%`);
  } else {
    query = query.ilike('title', `%${condo.filterValue}%`);
  }

  const { data } = await query;
  return { condo, properties: data || [] };
}

export async function generateStaticParams() {
  return CONDOMINIOS.map((c) => ({ slug: c.slug }));
}

export default async function CondominioPage({ params }: { params: { slug: string } }) {
  const result = await getCondominioProperties(params.slug);
  if (!result) notFound();

  const { condo, properties } = result;
  const coverImage = properties.find((p: any) => p.property_images?.length > 0)
    ?.property_images?.find((img: any) => img.is_cover) ||
    properties.find((p: any) => p.property_images?.length > 0)?.property_images?.[0];

  return (
    <main className="min-h-screen bg-background pt-20">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 overflow-hidden">
        {coverImage && (
          <div className="absolute inset-0">
            <Image
              src={coverImage.url}
              alt={condo.name}
              fill
              className="object-cover opacity-25"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90" />
          </div>
        )}
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <Link
            href="/imoveis#condominios"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Condomínios
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{condo.name}</h1>
              <p className="text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {condo.location}
              </p>
            </div>
          </div>
          <p className="text-gray-300 max-w-2xl mt-4">{condo.description}</p>
          <p className="mt-4 text-yellow-400 font-semibold">
            {properties.length} imóve{properties.length === 1 ? 'l' : 'is'} disponíve{properties.length === 1 ? 'l' : 'is'}
          </p>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {properties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => {
              const img = property.property_images?.find((i: any) => i.is_cover) || property.property_images?.[0];
              const isSold = property.construction_status === 'sold';

              return (
                <Link key={property.id} href={`/imoveis/${property.slug}`} className="group">
                  <article className="bg-card rounded-2xl overflow-hidden border border-border hover:border-yellow-500/50 hover:shadow-xl transition-all duration-300 h-full">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {img ? (
                        <Image
                          src={img.url}
                          alt={property.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      {isSold && (
                        <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                          <div className="absolute text-center transform -rotate-45 bg-red-600 text-white text-sm font-bold py-4 shadow-lg tracking-wide" style={{ width: '320px', top: '52px', left: '-85px' }}>
                            100% Vendido
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 text-yellow-500" />
                        <span>{property.municipality || property.district || condo.location}</span>
                      </div>
                      <h3 className="font-semibold text-foreground text-lg mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                        {property.bedrooms !== null && (
                          <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg">
                            <Bed className="h-4 w-4" />
                            {property.bedrooms} quartos
                          </span>
                        )}
                        {property.gross_area !== null && (
                          <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg">
                            <Maximize className="h-4 w-4" />
                            {property.gross_area} m²
                          </span>
                        )}
                      </div>
                      <div className="pt-4 border-t border-border">
                        <p className="text-xl font-bold text-foreground">
                          {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-secondary/50 rounded-2xl">
            <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Nenhum imóvel disponível de momento.</p>
          </div>
        )}
      </section>
    </main>
  );
}
