import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MapPin, ChevronDown, Building2, FileDown, FileText, LayoutGrid, ClipboardList } from 'lucide-react';
import { PropertyActions } from './property-actions';
import { PropertyGallery } from './property-gallery';

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
  name: 'Covialvi - Construções, Lda.',
  url: 'https://covialvi.com',
  logo: 'https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png',
  telephone: '+351967138116',
  email: 'covialvi@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Covilhã',
    addressCountry: 'PT',
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
    new: 'Novo',
    used: 'Usado',
    under_construction: 'Em Construção',
    to_recover: 'Para Recuperar',
    renovated: 'Renovado',
  };

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
      
    <main className="min-h-screen bg-background pt-20">
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
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                {property.parish && `${property.parish} - `}
                {property.municipality}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {property.title}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-3xl md:text-4xl font-bold text-foreground">
              {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
            </p>
            {property.business_type === 'rent' && (
              <span className="text-muted-foreground">/mês</span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Details Table */}
            <div className="space-y-4">
              <DetailRow label={businessTypeLabels[property.business_type] || 'Venda'} value={property.price ? formatPrice(property.price) : 'Sob Consulta'} />
              <DetailRow label="Distrito" value={property.district || '-'} />
              <DetailRow label="Concelho" value={property.municipality || '-'} />
              <DetailRow label="Freguesia" value={property.parish || '-'} />
              <DetailRow label="Estado do imóvel" value={property.construction_status ? (constructionStatusLabels[property.construction_status] || property.construction_status) : '-'} />
              <DetailRow label="Natureza" value={natureLabels[property.nature] || '-'} />
              <DetailRow label="Área Bruta" value={property.gross_area ? `${property.gross_area} m²` : '-'} />
              <DetailRow label="Tipologia" value={property.typology || '-'} />
              <DetailRow label="Pisos" value={property.floors ? String(property.floors) : '-'} />
              <DetailRow label="Ano Construção" value={property.construction_year ? String(property.construction_year) : '-'} />
              <DetailRow label="Categoria Energética" value={property.energy_certificate || '-'} />
              <DetailRow label="Referência" value={property.reference || '-'} />
            </div>

            {/* Description */}
            {property.description && (
              <div className="pt-8 border-t border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">Descrição</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

            {/* Divisões */}
            <div className="pt-8 border-t border-border">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Divisões</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    {property.bathrooms && <li>Casa(s) de Banho: {property.bathrooms}</li>}
                    {property.bedrooms && <li>Quarto(s): {property.bedrooms}</li>}
                    {property.divisions && typeof property.divisions === 'object' && 
                      Object.entries(property.divisions).map(([name, area]) => (
                        <li key={name}>{name}: {String(area)} m²</li>
                      ))
                    }
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Equipamento</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    {property.equipment?.map((item: string) => (
                      <li key={item}>{item}</li>
                    )) || <li>-</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Áreas & Extras */}
            <div className="pt-8 border-t border-border">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Áreas</h2>
                  <p className="text-muted-foreground">
                    {property.gross_area ? `${property.gross_area} M²` : '-'}
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Extras</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    {property.extras?.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Documentos - Downloads Section */}
            <div className="pt-8 border-t border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Documentos</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Ficha Técnica */}
                <a
                  href={`/api/properties/${property.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-background hover:bg-secondary transition-colors text-sm font-medium text-foreground"
                >
                  <ClipboardList className="h-4 w-4" />
                  Ficha Técnica
                </a>
                
                {/* Brochura */}
                {property.brochure_url ? (
                  <a
                    href={property.brochure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-background hover:bg-secondary transition-colors text-sm font-medium text-foreground"
                  >
                    <FileText className="h-4 w-4" />
                    Brochura
                  </a>
                ) : (
                  <span className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50">
                    <FileText className="h-4 w-4" />
                    Brochura
                  </span>
                )}
                
                {/* Planta */}
                {property.property_floor_plans?.length > 0 ? (
                  <a
                    href={property.property_floor_plans[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-background hover:bg-secondary transition-colors text-sm font-medium text-foreground"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Planta
                  </a>
                ) : (
                  <span className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50">
                    <LayoutGrid className="h-4 w-4" />
                    Planta
                  </span>
                )}
              </div>
            </div>

            {/* Zona Envolvente */}
            <div className="pt-8 border-t border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Zona Envolvente</h2>
              {property.surrounding_area && property.surrounding_area.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.surrounding_area.map((item: string) => (
                    <span key={item} className="px-3 py-1.5 rounded-full text-sm bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">{property.parish || property.municipality || 'Portugal'}</p>
              )}
              {/* Map */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                    `${property.address || ''} ${property.municipality || ''} ${property.district || ''} Portugal`
                  )}`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Video & Virtual Tour */}
            {(property.video_url || property.virtual_tour_url) && (
              <div className="pt-8 border-t border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">Vídeo e Tour Virtual</h2>
                <div className="space-y-4">
                  {property.video_url && (
                    <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
                      <iframe
                        src={property.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="w-full h-full border-0"
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
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors"
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
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 shadow-sm">
              {/* Favorite & Schedule Visit Buttons */}
              <PropertyActions 
                propertyId={property.id}
                propertyTitle={property.title}
                propertyReference={property.slug}
              />
              
              <h3 className="text-2xl font-bold text-foreground mb-6">Pedido de Contacto</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                  <input
                    type="tel"
                    placeholder="+351 912345678"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="nome@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mensagem</label>
                  <textarea
                    rows={4}
                    placeholder="Desejo ser contactado a fim de obter mais informações sobre o referido imóvel."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 rounded-full transition-colors shadow-lg shadow-yellow-500/25"
                >
                  Enviar
                </button>
              </form>
              
            </div>
          </div>
        </div>
      </section>
      
      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className="bg-secondary/50 py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-8">Imóveis Semelhantes</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {similarProperties.map((prop: any) => {
                const propCover = prop.property_images?.find((img: any) => img.is_cover) ||
                  prop.property_images?.[0];

                return (
                  <article
                    key={prop.id}
                    className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-yellow-500/50 hover:shadow-xl transition-all"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Link href={`/imoveis/${prop.slug}`}>
                        {propCover ? (
                          <Image
                            src={propCover.url}
                            alt={prop.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <Building2 className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </Link>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 text-yellow-500" />
                        <span>{prop.municipality || 'Portugal'}</span>
                      </div>
                      <Link href={`/imoveis/${prop.slug}`}>
                        <h3 className="font-semibold text-foreground text-lg mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                          {prop.title}
                        </h3>
                      </Link>
                      <p className="text-xl font-bold text-foreground">
                        {prop.price_on_request ? 'Sob Consulta' : formatPrice(prop.price)}
                      </p>
                    </div>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-border">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
