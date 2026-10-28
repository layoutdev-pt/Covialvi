import { ScrollRevealText } from '@/components/ui/scroll-reveal-text';
import { Metadata } from 'next';
import Link from 'next/link';
import { TrimmedImage } from '@/components/properties/trimmed-image';
import { createClient } from '@/lib/supabase/server';
import { MapPin, Building2, Maximize, ArrowRight, ArrowUpRight, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { PriceFilter } from './price-filter';
import { SortSelect } from './sort-select';
import { CONDOMINIOS } from '@/lib/condominios';

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
  construction_status?: string;
  bedrooms?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  page?: string;
  all?: string;
  show_sob_consulta?: string;
}

async function getCondominioCovers() {
  const supabase = createClient();
  const covers: Record<string, string | null> = {};

  for (const condo of CONDOMINIOS) {
    let query = supabase
      .from('properties')
      .select('id, property_images(*)')
      .eq('status', 'published')
      .limit(1);

    if (condo.filterType === 'address') {
      query = query.ilike('address', `%${condo.filterValue}%`);
    } else {
      query = query.ilike('title', `%${condo.filterValue}%`);
    }

    const { data } = await query;
    const firstProperty = data?.[0] as any;
    const img = firstProperty?.property_images?.find((i: any) => i.is_cover) || firstProperty?.property_images?.[0];
    covers[condo.slug] = img?.url ?? null;
  }

  return covers;
}

async function getAvailableLocations(): Promise<{ districts: string[]; municipalities: string[] }> {
  const supabase = createClient();
  const { data } = await supabase
    .from('properties')
    .select('district, municipality')
    .eq('status', 'published');
  
  if (!data) return { districts: [], municipalities: [] };
  
  const districts = [...new Set(data.map((p: { district: string | null }) => p.district).filter(Boolean))] as string[];
  const municipalities = [...new Set(data.map((p: { municipality: string | null }) => p.municipality).filter(Boolean))] as string[];
  
  return {
    districts: districts.sort(),
    municipalities: municipalities.sort(),
  };
}

async function getProperties(searchParams: SearchParams) {
  const supabase = createClient();
  
  let query = supabase
    .from('properties')
    .select(`
      *,
      property_images (*)
    `, { count: 'exact' })
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
  if (searchParams.construction_status) {
    query = query.eq('construction_status', searchParams.construction_status);
  }
  if (searchParams.bedrooms) {
    const bedroomNum = parseInt(searchParams.bedrooms);
    // For typology filter: T1 should include T1, T1 Duplex, etc.
    // Match by bedrooms number OR by typology starting with T{num}
    if (bedroomNum >= 4) {
      // "T4+" also covers T5, T6, T7... (by number of bedrooms or by typology label)
      const typologies = Array.from({ length: 10 - bedroomNum }, (_, i) => `typology.ilike.T${bedroomNum + i}%`);
      query = query.or([`bedrooms.gte.${bedroomNum}`, ...typologies].join(','));
    } else {
      query = query.or(`bedrooms.eq.${bedroomNum},typology.ilike.T${bedroomNum}%`);
    }
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

  // Pagination - 9 properties per page
  const limit = 9;
  const requestedPage = Math.max(1, parseInt(searchParams.page || '1') || 1);
  const offset = (requestedPage - 1) * limit;

  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count || 0) / limit));

  return {
    properties: data || [],
    total: count || 0,
    page: Math.min(requestedPage, totalPages),
    totalPages,
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
];

const natures = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Moradia' },
  { value: 'land', label: 'Terreno' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'warehouse', label: 'Armazém' },
  { value: 'shop', label: 'Loja' },
];

const constructionStatuses = [
  { value: 'new', label: 'Novo' },
  { value: 'used', label: 'Usado' },
  { value: 'under_construction', label: 'Em Construção' },
  { value: 'in_project', label: 'Em Projecto' },
  { value: 'to_recover', label: 'Para Recuperar' },
  { value: 'recovered', label: 'Recuperado' },
  { value: 'renovated', label: 'Renovado' },
  { value: 'sold', label: 'Vendido' },
  { value: 'sold_100', label: '100% Vendido' },
];

// Page numbers to show, with "..." gaps for long lists: 1 ... 4 5 6 ... 12
function pageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | '...')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('...');
    result.push(p);
  });
  return result;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [{ properties, total, page, totalPages }, locations, condoCoverImages] = await Promise.all([
    getProperties(searchParams),
    getAvailableLocations(),
    getCondominioCovers(),
  ]);

  // Link to another page of results, keeping the active filters and sorting
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page' && key !== 'all') params.set(key, String(value));
    });
    if (target > 1) params.set('page', String(target));
    const query = params.toString();
    return `/imoveis${query ? `?${query}` : ''}#resultados`;
  };

  return (
    <main className="min-h-screen bg-[#f5f5f3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-16">
        {/* Title */}
        <header className="mb-8">
          <ScrollRevealText as="h1" className="text-3xl md:text-5xl font-light tracking-tight text-foreground" segments={[{ text: "Imóveis disponíveis" }]} />
          <ScrollRevealText as="p" className="mt-2 text-muted-foreground" segments={[{ text: "Encontre o imóvel perfeito para si. Explore a nossa seleção de propriedades." }]} />
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
          {/* Filters - fixed on the left while scrolling */}
          <PriceFilter
            defaultMinPrice={searchParams.min_price}
            defaultMaxPrice={searchParams.max_price}
            defaultLocation={searchParams.municipality || searchParams.district || searchParams.location}
            defaultNature={searchParams.nature}
            defaultBusinessType={searchParams.business_type}
            defaultConstructionStatus={searchParams.construction_status}
            defaultBedrooms={searchParams.bedrooms}
            defaultShowSobConsulta={searchParams.show_sob_consulta}
            defaultSort={searchParams.sort}
            total={total}
            availableLocations={locations}
          />

          {/* Results */}
          <section id="resultados" className="scroll-mt-24 min-w-0">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg font-medium text-foreground">
                {total} {total === 1 ? 'imóvel' : 'imóveis'}
              </p>
              <SortSelect current={searchParams.sort} />
            </div>

            {properties.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property: any) => {
                  const coverImage = property.property_images?.find((img: any) => img.is_cover) ||
                    property.property_images?.[0];
                  const businessLabel = property.business_type === 'sale' ? 'Venda' : property.business_type === 'rent' ? 'Arrendamento' : 'Trespasse';
                  const natureLabel = natures.find((n) => n.value === property.nature)?.label;
                  const isSold = property.construction_status === 'sold' || property.construction_status === 'sold_100';

                  return (
                    <article
                      key={property.id}
                      className={`group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)]`}
                    >
                      <Link href={`/imoveis/${property.slug}`} className="block">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          {coverImage ? (
                            <TrimmedImage
                              src={coverImage.url}
                              alt={property.title}
                              className={`object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isSold ? 'grayscale' : ''}`}
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary">
                              <Building2 className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}

                          {/* Vendido label */}
                          {isSold && (
                            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                              <span className="rounded-2xl bg-red-600 px-6 py-2.5 text-base font-bold tracking-wide text-white shadow-lg">
                                {property.construction_status === 'sold' ? 'Vendido' : '100% Vendido'}
                              </span>
                            </div>
                          )}

                          {/* Hover arrow circle */}
                          {!isSold && (
                            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                              <span className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-yellow-500/70 text-white opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                                <ArrowUpRight className="h-6 w-6" />
                              </span>
                            </div>
                          )}

                          <span className="absolute right-4 top-4 z-20 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 backdrop-blur-sm">
                            {businessLabel}
                          </span>
                          <span className="absolute bottom-4 left-4 z-20 rounded-full bg-white/95 px-4 py-1.5 text-sm font-semibold text-gray-900 shadow-sm">
                            {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
                            {!property.price_on_request && property.business_type === 'rent' && (
                              <span className="text-xs font-normal text-gray-500"> /mês</span>
                            )}
                          </span>
                          {natureLabel && (
                            <span className="absolute bottom-4 right-4 z-20 rounded-full bg-yellow-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm">
                              {natureLabel}
                            </span>
                          )}
                        </div>

                        <div className="px-5 pb-4 pt-5">
                          <h3 className="line-clamp-1 text-xl font-normal text-gray-900 transition-colors group-hover:text-yellow-600">
                            {property.title}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5" />
                            {property.municipality || property.district || 'Portugal'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5 text-sm text-gray-600">
                          <div className="flex items-center gap-5">
                            {property.typology && (
                              <span className="flex items-center gap-1.5">
                                <LayoutGrid className="h-4 w-4 text-gray-500" />
                                {property.typology}
                              </span>
                            )}
                            {property.gross_area !== null && property.gross_area !== undefined && (
                              <span className="flex items-center gap-1.5">
                                <Maximize className="h-4 w-4 text-gray-500" />
                                {property.gross_area} m²
                              </span>
                            )}
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-yellow-600" />
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl bg-secondary/50 py-16 text-center">
                <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
                <p className="mb-4 text-lg text-muted-foreground">
                  Nenhum imóvel encontrado com os filtros selecionados.
                </p>
                <Link
                  href="/imoveis"
                  className="inline-block rounded-full bg-yellow-500 px-6 py-3 font-medium text-white transition-colors hover:bg-yellow-600"
                >
                  Limpar Filtros
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Páginas de imóveis" className="mt-10 flex items-center justify-center gap-2">
                {page > 1 ? (
                  <Link href={pageHref(page - 1)} aria-label="Página anterior" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-yellow-500 hover:text-yellow-600">
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-300">
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                )}

                {pageNumbers(page, totalPages).map((item, i) =>
                  item === '...' ? (
                    <span key={`gap-${i}`} className="px-1 text-gray-400">…</span>
                  ) : (
                    <Link
                      key={item}
                      href={pageHref(item)}
                      aria-label={`Página ${item}`}
                      aria-current={item === page ? 'page' : undefined}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium shadow-sm transition-colors ${
                        item === page
                          ? 'border-yellow-500 bg-yellow-500 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-500 hover:text-yellow-600'
                      }`}
                    >
                      {item}
                    </Link>
                  )
                )}

                {page < totalPages ? (
                  <Link href={pageHref(page + 1)} aria-label="Página seguinte" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-yellow-500 hover:text-yellow-600">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-300">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </nav>
            )}
          </section>
        </div>
      </div>

      {/* Condomínios em Destaque */}
      <section id="condominios" className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Building2 className="h-4 w-4" />
            Condomínios em Destaque
          </span>
          <ScrollRevealText as="h2" className="text-3xl md:text-4xl font-bold text-foreground mb-3" segments={[{ text: "Explore os Nossos Condomínios" }]} />
          <ScrollRevealText as="p" className="text-muted-foreground max-w-2xl mx-auto" segments={[{ text: "Encontre o apartamento ideal dentro dos nossos condomínios. Todos os imóveis organizados para facilitar a sua procura." }]} />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONDOMINIOS.map((condo) => (
            <Link key={condo.slug} href={`/imoveis/condominios/${condo.slug}`} className="group">
              <article className="bg-card rounded-2xl overflow-hidden border border-border hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/5 transition-all duration-300 h-full flex flex-col">
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                  {condoCoverImages[condo.slug] ? (
                    <TrimmedImage
                      src={condoCoverImages[condo.slug]!}
                      alt={condo.name}
                      fill
                      className={`object-cover transition-transform duration-500 group-hover:scale-110 ${condo.soldOut ? 'grayscale' : ''}`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {condo.soldOut && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                      <span className="rounded-2xl bg-red-600 px-6 py-2.5 text-base font-bold tracking-wide text-white shadow-lg">
                        100% Vendido
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <div className="w-9 h-9 rounded-xl bg-yellow-500 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-yellow-600 transition-colors line-clamp-2">
                    {condo.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                    {condo.location}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{condo.description}</p>
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm font-medium mt-auto">
                    Ver imóveis
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
