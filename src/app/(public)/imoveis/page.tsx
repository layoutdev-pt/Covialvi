import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { MapPin, Building2, Bed, Maximize } from 'lucide-react';
import { PriceFilter } from './price-filter';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Imóveis à Venda e para Arrendar em Portugal | Covialvi',
  description: 'Explore a nossa seleção de imóveis em Portugal. Apartamentos, moradias, terrenos e espaços comerciais para comprar ou arrendar. Filtros avançados para encontrar o imóvel ideal.',
  keywords: [
    'imóveis Portugal',
    'apartamentos à venda',
    'moradias para comprar',
    'arrendar casa',
    'terrenos construção',
    'imóveis comerciais',
    'Covilhã imóveis',
  ],
  openGraph: {
    title: 'Imóveis à Venda e para Arrendar | Covialvi',
    description: 'Explore a nossa seleção de imóveis em Portugal. Apartamentos, moradias, terrenos e espaços comerciais.',
    type: 'website',
    locale: 'pt_PT',
    url: 'https://covialvi.com/imoveis',
    siteName: 'Covialvi',
  },
  alternates: {
    canonical: 'https://covialvi.com/imoveis',
  },
};

interface SearchParams {
  q?: string;
  location?: string;
  district?: string;
  municipality?: string;
  business_type?: string;
  nature?: string;
  bedrooms?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  page?: string;
  show_sob_consulta?: string;
}

async function getProperties(searchParams: SearchParams) {
  const supabase = createClient();
  
  let query = supabase
    .from('properties')
    .select(`
      *,
      property_images (*)
    `)
    .eq('status', 'published');

  // Apply filters
  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%,reference.ilike.%${searchParams.q}%`);
  }
  if (searchParams.location) {
    query = query.or(`district.ilike.%${searchParams.location}%,municipality.ilike.%${searchParams.location}%,parish.ilike.%${searchParams.location}%,address.ilike.%${searchParams.location}%`);
  }
  if (searchParams.district) {
    query = query.eq('district', searchParams.district);
  }
  if (searchParams.municipality) {
    query = query.eq('municipality', searchParams.municipality);
  }
  if (searchParams.business_type) {
    query = query.eq('business_type', searchParams.business_type);
  }
  if (searchParams.nature) {
    query = query.eq('nature', searchParams.nature);
  }
  if (searchParams.bedrooms) {
    query = query.eq('bedrooms', parseInt(searchParams.bedrooms));
  }
  if (searchParams.min_price) {
    query = query.gte('price', parseInt(searchParams.min_price));
  }
  if (searchParams.max_price) {
    query = query.lte('price', parseInt(searchParams.max_price));
  }
  
  // Filter sob consulta (price_on_request) properties
  if (searchParams.show_sob_consulta === 'false') {
    query = query.eq('price_on_request', false);
  }

  // Apply sorting
  switch (searchParams.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true, nullsFirst: false });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false, nullsFirst: false });
      break;
    case 'area_asc':
      query = query.order('gross_area', { ascending: true, nullsFirst: false });
      break;
    case 'area_desc':
      query = query.order('gross_area', { ascending: false, nullsFirst: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Pagination
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const offset = (page - 1) * limit;
  
  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;
  
  return {
    properties: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

const formatPrice = (price: number | null) => {
  if (price === null) return 'Sob Consulta';
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' €';
};

const businessTypes = [
  { value: 'sale', label: 'Venda' },
  { value: 'rent', label: 'Arrendamento' },
  { value: 'transfer', label: 'Trespasse' },
];

const natures = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Moradia' },
  { value: 'land', label: 'Terreno' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'warehouse', label: 'Armazém' },
  { value: 'office', label: 'Escritório' },
  { value: 'garage', label: 'Garagem' },
  { value: 'shop', label: 'Loja' },
];

const constructionStatuses = [
  { value: 'new', label: 'Novo' },
  { value: 'used', label: 'Usado' },
  { value: 'under_construction', label: 'Em Construção' },
  { value: 'to_recover', label: 'Para Recuperar' },
  { value: 'renovated', label: 'Renovado' },
];

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { properties, total, page, totalPages } = await getProperties(searchParams);

  return (
    <main className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Imóveis Disponíveis
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Encontre o imóvel perfeito para si. Explore a nossa seleção de propriedades.
        </p>
        {total > 0 && (
          <p className="text-yellow-600 font-medium mt-4">{total} imóveis encontrados</p>
        )}
      </section>

      {/* Filters */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-12">
        <PriceFilter
          defaultMinPrice={searchParams.min_price}
          defaultMaxPrice={searchParams.max_price}
          defaultLocation={searchParams.location}
          defaultNature={searchParams.nature}
          defaultBusinessType={searchParams.business_type}
          defaultBedrooms={searchParams.bedrooms}
          defaultShowSobConsulta={searchParams.show_sob_consulta}
        />
      </section>

      {/* Properties Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        {properties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => {
              const coverImage = property.property_images?.find((img: any) => img.is_cover) ||
                property.property_images?.[0];
              const businessLabel = property.business_type === 'sale' ? 'Venda' : property.business_type === 'rent' ? 'Arrendamento' : 'Trespasse';

              return (
                <article
                  key={property.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/5 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Link href={`/imoveis/${property.slug}`}>
                      {coverImage ? (
                        <Image
                          src={coverImage.url}
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
                    </Link>
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                        {businessLabel}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 text-yellow-500" />
                      <span>{property.municipality || property.district || 'Portugal'}</span>
                    </div>
                    <Link href={`/imoveis/${property.slug}`}>
                      <h3 className="font-semibold text-foreground text-lg mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                        {property.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-secondary/50 rounded-2xl">
            <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">
              Nenhum imóvel encontrado com os filtros selecionados.
            </p>
            <Link
              href="/imoveis"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-3 rounded-full transition-colors"
            >
              Limpar Filtros
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            {page > 1 && (
              <Link
                href={{
                  pathname: '/imoveis',
                  query: { ...searchParams, page: page - 1 },
                }}
                className="px-4 py-2 rounded-full border border-border text-foreground hover:bg-secondary transition-colors"
              >
                Anterior
              </Link>
            )}
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Link
                  key={pageNum}
                  href={{
                    pathname: '/imoveis',
                    query: { ...searchParams, page: pageNum },
                  }}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    pageNum === page
                      ? 'bg-yellow-500 text-white'
                      : 'border border-border text-foreground hover:bg-secondary'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}

            {page < totalPages && (
              <Link
                href={{
                  pathname: '/imoveis',
                  query: { ...searchParams, page: page + 1 },
                }}
                className="px-4 py-2 rounded-full border border-border text-foreground hover:bg-secondary transition-colors"
              >
                Seguinte
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
