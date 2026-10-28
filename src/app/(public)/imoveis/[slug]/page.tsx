import Link from 'next/link';
import { TrimmedImage } from '@/components/properties/trimmed-image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { company } from '@/lib/company';
import {
  MapPin, ChevronDown, Building2, FileDown, FileText, LayoutGrid, ClipboardList, Play,
  Maximize, Layers, Calendar, Zap, BadgeCheck, Home, Tag, Map, Hash,
  type LucideIcon,
} from 'lucide-react';
import { PropertyActions } from './property-actions';
import { PropertyGallery } from './property-gallery';
import { PropertyContactForm } from './property-contact-form';
import { PropertyWarningBanner } from './property-warning-banner';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

async function getProperty(slug: string): Promise<any | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (*),
      property_floor_plans (*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return data;
}

async function getSimilarProperties(property: any): Promise<any[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (*)
    `)
    .eq('status', 'published')
    .eq('nature', property.nature)
    .neq('id', property.id)
    .limit(3);

  return data || [];
}

export async function generateMetadata({ params }: PageProps) {
  const property = await getProperty(params.slug);

  if (!property) {
    return { title: 'Imóvel não encontrado' };
  }

  const coverImage = property.property_images?.find((img: any) => img.is_cover) || property.property_images?.[0];
  const price = property.price_on_request ? 'Sob Consulta' : `${new Intl.NumberFormat('pt-PT').format(property.price)} €`;
  const description = property.description?.substring(0, 160) || `${property.title} - ${price} em ${property.municipality || 'Portugal'}`;

  return {
    title: `${property.title} | Covialvi`,
    description,
    keywords: [
      property.nature,
      property.business_type === 'sale' ? 'comprar' : 'arrendar',
      property.municipality,
      property.district,
      'imóveis',
      'portugal',
      'covialvi'
    ].filter(Boolean),
    openGraph: {
      title: property.title,
      description,
      type: 'website',
      locale: 'pt_PT',
      siteName: 'Covialvi',
      images: [{
        url: `/api/og?title=${encodeURIComponent(property.title)}&price=${encodeURIComponent(price)}&location=${encodeURIComponent(property.municipality || 'Portugal')}&type=${encodeURIComponent(property.business_type === 'sale' ? 'Venda' : 'Arrendamento')}&image=${encodeURIComponent(coverImage?.url || '')}&bedrooms=${property.bedrooms || ''}&bathrooms=${property.bathrooms || ''}&area=${property.gross_area || ''}`,
        width: 1200,
        height: 630,
        alt: property.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description,
      images: [`/api/og?title=${encodeURIComponent(property.title)}&price=${encodeURIComponent(price)}&location=${encodeURIComponent(property.municipality || 'Portugal')}&type=${encodeURIComponent(property.business_type === 'sale' ? 'Venda' : 'Arrendamento')}&image=${encodeURIComponent(coverImage?.url || '')}`],
    },
  };
}

const formatPrice = (price: number | null) => {
  if (price === null) return 'Sob Consulta';
  const formatted = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return `${formatted}\u00A0€`;
};

// JSON-LD Structured Data for Real Estate
function generatePropertyJsonLd(property: any) {
  const coverImage = property.property_images?.find((img: any) => img.is_cover) || property.property_images?.[0];
  const price = property.price_on_request ? undefined : property.price;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `https://covialvi.com/imoveis/${property.slug}`,
    datePosted: property.created_at,
    image: coverImage?.url,
    offers: price ? {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    } : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.municipality,
      addressRegion: property.district,
      addressCountry: 'PT',
      streetAddress: property.address,
    },
    geo: property.latitude && property.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    } : undefined,
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: property.gross_area ? {
      '@type': 'QuantitativeValue',
      value: property.gross_area,
      unitCode: 'MTK',
    } : undefined,
  };
}

// Organization JSON-LD
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: company.name,
  url: company.website,
  logo: 'https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png',
  telephone: company.phoneTel,
  email: company.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${company.address.street}, ${company.address.detail}`,
    addressLocality: company.address.locality,
    postalCode: company.address.postalCode,
    addressCountry: company.address.country,
  },
};

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await getProperty(params.slug);

  if (!property) {
    notFound();
  }

  const similarProperties = await getSimilarProperties(property);
  const propertyJsonLd = generatePropertyJsonLd(property);

  const images = property.property_images?.sort((a: any, b: any) => a.order - b.order) || [];
  const coverImage = images.find((img: any) => img.is_cover) || images[0];

  const businessTypeLabels: Record<string, string> = {
    sale: 'Venda',
    rent: 'Arrendamento',
    transfer: 'Trespasse',
  };

  const natureLabels: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Moradia',
    land: 'Terreno',
    commercial: 'Comercial',
    warehouse: 'Armazém',
    office: 'Escritório',
    garage: 'Garagem',
    shop: 'Loja',
  };

  const constructionStatusLabels: Record<string, string> = {
    // Standardized English keys
    new: 'Novo',
    used: 'Usado',
    under_construction: 'Em Construção',
    in_project: 'Em Projecto',
    to_recover: 'Para Recuperar',
    recovered: 'Recuperado',
    renovated: 'Renovado',
    sold: 'Vendido',
    sold_100: '100% Vendido',
    // Legacy Portuguese values (for backwards compatibility)
    'Em construção': 'Em Construção',
    'Em projecto': 'Em Projecto',
    'Novo': 'Novo',
    'Por recuperar': 'Para Recuperar',
    'Recuperado': 'Recuperado',
    'Renovado': 'Renovado',
    'Usado': 'Usado',
    'Vendido': 'Vendido',
  };

  // Short summary tiles: only the values that exist are shown
  // Property details: every field of the original table is kept ("-" when empty)
  const dash = (value: string | number | null | undefined) =>
    value !== null && value !== undefined && String(value).trim() !== '' ? String(value) : '-';
  const facts: { icon: LucideIcon; label: string; value: string; energy?: boolean }[] = [
    { icon: Tag, label: businessTypeLabels[property.business_type] || 'Venda', value: property.price_on_request ? 'Sob Consulta' : formatPrice(property.price) },
    { icon: Map, label: 'Distrito', value: dash(property.district) },
    { icon: Building2, label: 'Concelho', value: dash(property.municipality) },
    { icon: MapPin, label: 'Freguesia', value: dash(property.parish) },
    { icon: BadgeCheck, label: 'Estado do imóvel', value: property.construction_status ? (constructionStatusLabels[property.construction_status] || property.construction_status) : '-' },
    { icon: Home, label: 'Natureza', value: natureLabels[property.nature] || '-' },
    { icon: Maximize, label: 'Área Bruta', value: property.gross_area ? `${property.gross_area} m²` : '-' },
    { icon: LayoutGrid, label: 'Tipologia', value: dash(property.typology) },
    { icon: Layers, label: 'Piso', value: dash(property.floors) },
    { icon: Calendar, label: 'Ano de Construção', value: dash(property.construction_year) },
    { icon: Zap, label: 'Categoria Energética', value: dash(property.energy_certificate), energy: true },
    { icon: Hash, label: 'Referência', value: dash(property.reference) },
  ];

  const divisions: [string, number][] =
    property.divisions && typeof property.divisions === 'object'
      ? Object.entries(property.divisions).map(([name, area]) => [name, Number(area)] as [string, number])
      : [];
  // Same content as before, as plain text lines
  const roomItems: string[] = [
    ...(property.bathrooms !== null && property.bathrooms !== undefined ? [`Casa(s) de Banho: ${property.bathrooms}`] : []),
    ...(property.bedrooms !== null && property.bedrooms !== undefined ? [`Quarto(s): ${property.bedrooms}`] : []),
    ...divisions.map(([name, area]) => `${name}${area > 0 ? `: ${area} m²` : ''}`),
  ];
  const equipment: string[] = Array.isArray(property.equipment) ? property.equipment : [];
  const extras: string[] = Array.isArray(property.extras) ? property.extras : [];
  const areaItems: string[] = [
    ...(property.gross_area ? [`Área Bruta: ${property.gross_area} m²`] : []),
    ...(property.useful_area ? [`Área Útil: ${property.useful_area} m²`] : []),
    ...(property.land_area ? [`Área do Terreno: ${property.land_area} m²`] : []),
  ];

  const isSold = property.construction_status === 'sold' || property.construction_status === 'sold_100';
  const locationLine = [property.parish, property.municipality, property.district].filter(Boolean).join(' · ');

  const card = 'rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] md:p-8';

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

    <main className="min-h-screen bg-[#f5f5f3]">
      <PropertyWarningBanner slug={property.slug} />
      {/* Image Gallery with Vertical Carousel */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <PropertyGallery
          images={images}
          videoUrl={property.video_url}
          title={property.title}
          businessType={property.business_type}
        />
      </section>

      {/* Property Info Header */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-yellow-500 px-4 py-1.5 text-xs font-medium text-white">
                {businessTypeLabels[property.business_type] || 'Venda'}
              </span>
              {natureLabels[property.nature] && (
                <span className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-800">
                  {natureLabels[property.nature]}
                </span>
              )}
              {isSold && (
                <span className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white">
                  {property.construction_status === 'sold' ? 'Vendido' : '100% Vendido'}
                </span>
              )}
              {property.reference && (
                <span className="text-xs text-muted-foreground">Ref. {property.reference}</span>
              )}
            </div>
            <h1 className="text-3xl font-light leading-tight tracking-tight text-foreground md:text-5xl">
              {property.title}
            </h1>
            {locationLine && (
              <p className="mt-3 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                {locationLine}
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white px-7 py-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] lg:text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {property.business_type === 'rent' ? 'Renda' : 'Preço'}
            </p>
            <p className="mt-1 text-3xl font-light text-foreground md:text-4xl">
              {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
              {property.business_type === 'rent' && !property.price_on_request && (
                <span className="text-base text-muted-foreground"> /mês</span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Property sheet: main figures on top, the remaining details as a clean list */}
            <div className={card}>
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.22em] text-yellow-600">Ficha do imóvel</p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-7 border-b border-gray-200 pb-7 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-gray-200">
                {[facts[0], facts[7], facts[6], facts[10]].map((fact) => (
                  <div key={fact.label} className="sm:px-6 sm:first:pl-0">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{fact.label}</p>
                    <p
                      className={`mt-2 text-2xl font-light tracking-tight md:text-3xl ${
                        fact.energy && fact.value !== '-' ? energyText(fact.value) : 'text-foreground'
                      }`}
                    >
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>

              <dl className="grid gap-x-12 sm:grid-cols-2">
                {[facts[1], facts[2], facts[3], facts[4], facts[5], facts[8], facts[9], facts[11]].map((fact) => (
                  <div key={fact.label} className="flex items-baseline justify-between gap-4 border-b border-gray-100 py-3.5">
                    <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                    <dd className="text-right text-sm font-medium text-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {/* Description */}
            {property.description && (
              <div className={card}>
                <h2 className="mb-4 text-xl font-medium text-foreground">Sobre este imóvel</h2>
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {property.description}
                </p>
              </div>
            )}

            {/* Divisões + Equipamento */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className={card}>
                <SimpleTitle title="Divisões" />
                <SimpleList items={roomItems} />
              </div>
              <div className={card}>
                <SimpleTitle title="Equipamento" />
                <SimpleList items={equipment} />
              </div>
            </div>

            {/* Áreas + Extras */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className={card}>
                <SimpleTitle title="Áreas" />
                <SimpleList items={areaItems} />
              </div>
              <div className={card}>
                <SimpleTitle title="Extras" />
                <SimpleList items={extras} />
              </div>
            </div>

            {/* Documentos - Downloads Section */}
            <div className={card}>
              <SectionTitle icon={FileText} title="Documentos" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* Ficha Técnica */}
                <a
                  href={`/api/properties/${property.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={docLink}
                >
                  <span className={docIcon}><ClipboardList className="h-5 w-5" /></span>
                  Ficha Técnica
                </a>

                {/* Brochura */}
                {property.brochure_url ? (
                  <a
                    href={property.brochure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className={docLink}
                  >
                    <span className={docIcon}><FileText className="h-5 w-5" /></span>
                    Brochura
                  </a>
                ) : (
                  <span className={`${docLink} cursor-not-allowed opacity-50 hover:shadow-none`}>
                    <span className={docIcon}><FileText className="h-5 w-5" /></span>
                    Brochura
                  </span>
                )}

                {/* Plantas */}
                {property.property_floor_plans?.length > 0 ? (
                  property.property_floor_plans.length === 1 ? (
                    <a
                      href={property.property_floor_plans[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className={docLink}
                    >
                      <span className={docIcon}><LayoutGrid className="h-5 w-5" /></span>
                      Planta
                    </a>
                  ) : (
                    <div className="group relative">
                      <button className={`${docLink} w-full`}>
                        <span className={docIcon}><LayoutGrid className="h-5 w-5" /></span>
                        Plantas ({property.property_floor_plans.length})
                        <ChevronDown className="ml-auto h-4 w-4" />
                      </button>
                      <div className="invisible absolute left-0 right-0 top-full z-50 mt-1 rounded-2xl border border-border bg-background opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                        {property.property_floor_plans.map((plan: any, index: number) => (
                          <a
                            key={plan.id || index}
                            href={plan.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`Planta_${index + 1}.pdf`}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-secondary"
                          >
                            <FileDown className="h-4 w-4" />
                            {plan.title || `Planta ${index + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )
                ) : (
                  <span className={`${docLink} cursor-not-allowed opacity-50 hover:shadow-none`}>
                    <span className={docIcon}><LayoutGrid className="h-5 w-5" /></span>
                    Planta
                  </span>
                )}
              </div>
            </div>

            {/* Zona Envolvente */}
            <div className={card}>
              <SectionTitle icon={MapPin} title="Zona Envolvente" />
              {property.surrounding_area && property.surrounding_area.length > 0 ? (
                <div className="mb-5 flex flex-wrap gap-2">
                  {property.surrounding_area.map((item: string) => (
                    <span key={item} className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3.5 py-1.5 text-sm text-yellow-700">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mb-5 text-muted-foreground">{property.parish || property.municipality || 'Portugal'}</p>
              )}
              {/* Map */}
              <div className="aspect-video overflow-hidden rounded-2xl bg-gray-100">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                    `${property.address || ''} ${property.municipality || ''} ${property.district || ''} Portugal`
                  )}`}
                  className="h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Video & Virtual Tour */}
            {(property.video_url || property.virtual_tour_url) && (
              <div className={card}>
                <SectionTitle icon={Play} title="Vídeo e Tour Virtual" />
                <div className="space-y-4">
                  {property.video_url && (
                    <div className="aspect-video overflow-hidden rounded-2xl bg-gray-100">
                      <iframe
                        src={property.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="h-full w-full border-0"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  )}
                  {property.virtual_tour_url && (
                    <a
                      href={property.virtual_tour_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-6 py-3 font-medium text-white transition-colors hover:bg-yellow-600"
                    >
                      Ver Tour Virtual 360º
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.22)] md:p-7">
              {/* Favorite & Schedule Visit Buttons */}
              <PropertyActions
                propertyId={property.id}
                propertyTitle={property.title}
                propertyReference={property.slug}
              />

              <h3 className="mb-6 text-2xl font-medium text-foreground">Pedido de Contacto</h3>
              <PropertyContactForm
                propertyId={property.id}
                propertyTitle={property.title}
                propertyRef={property.reference}
              />

            </div>
          </div>
        </div>
      </section>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="mb-8 text-3xl font-light tracking-tight text-foreground">Imóveis Semelhantes</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {similarProperties.map((prop: any) => {
                const propCover = prop.property_images?.find((img: any) => img.is_cover) ||
                  prop.property_images?.[0];
                const propSold = prop.construction_status === 'sold' || prop.construction_status === 'sold_100';

                return (
                  <article
                    key={prop.id}
                    className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)]"
                  >
                    <Link href={`/imoveis/${prop.slug}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {propCover ? (
                          <TrimmedImage
                            src={propCover.url}
                            alt={prop.title}
                            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${propSold ? 'grayscale' : ''}`}
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary">
                            <Building2 className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        {propSold && (
                          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                            <span className="rounded-2xl bg-red-600 px-6 py-2.5 text-base font-bold tracking-wide text-white shadow-lg">
                              {prop.construction_status === 'sold' ? 'Vendido' : '100% Vendido'}
                            </span>
                          </div>
                        )}
                        <span className="absolute bottom-4 left-4 z-20 rounded-full bg-white/95 px-4 py-1.5 text-sm font-semibold text-gray-900 shadow-sm">
                          {prop.price_on_request ? 'Sob Consulta' : formatPrice(prop.price)}
                        </span>
                        {natureLabels[prop.nature] && (
                          <span className="absolute bottom-4 right-4 z-20 rounded-full bg-yellow-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm">
                            {natureLabels[prop.nature]}
                          </span>
                        )}
                      </div>
                      <div className="px-5 pb-5 pt-5">
                        <h3 className="line-clamp-1 text-xl font-normal text-gray-900 transition-colors group-hover:text-yellow-600">
                          {prop.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {prop.municipality || 'Portugal'}
                        </p>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
    </>
  );
}

// ---------------------------------------------------------------------------
// Small presentation helpers
// ---------------------------------------------------------------------------

const docLink =
  'flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md';
const docIcon =
  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-600';

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="text-xl font-medium text-foreground">{title}</h2>
    </div>
  );
}

// Plain titles and lists (no icons): the items are different for every property
function SimpleTitle({ title }: { title: string }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 text-xl font-medium text-foreground">
      <span className="h-6 w-1 rounded-full bg-yellow-500" aria-hidden="true" />
      {title}
    </h2>
  );
}

function SimpleList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-muted-foreground">-</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-muted-foreground">
          <span className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-500" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function energyColor(value: string) {
  const letter = value.trim().toUpperCase().charAt(0);
  if (letter === 'A') return 'bg-green-100 text-green-700';
  if (letter === 'B') return 'bg-lime-100 text-lime-700';
  if (letter === 'C') return 'bg-yellow-100 text-yellow-700';
  if (letter === 'D') return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

function energyText(value: string) {
  const letter = value.trim().toUpperCase().charAt(0);
  if (letter === 'A') return 'text-green-600';
  if (letter === 'B') return 'text-lime-600';
  if (letter === 'C') return 'text-yellow-600';
  if (letter === 'D') return 'text-orange-600';
  return 'text-red-600';
}
