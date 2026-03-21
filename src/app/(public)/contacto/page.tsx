import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Smartphone, Building2, Bed, Maximize, ArrowRight } from 'lucide-react';
import { company } from '@/lib/company';
import { ContactForm } from './contact-form';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCondominiums() {
  const supabase = createServiceClient();

  // Lote 26 - Quinta do Pinheiro, Covilhã
  const { data: lote26 } = await supabase
    .from('properties')
    .select('id, title, slug, price, price_on_request, bedrooms, gross_area, construction_status, property_images(*)')
    .ilike('address', '%QUINTA DO PINHEIRO LOTE 26%')
    .eq('status', 'published')
    .order('title');

  // Junto à Faculdade de Medicina
  const { data: faculdade } = await supabase
    .from('properties')
    .select('id, title, slug, price, price_on_request, bedrooms, gross_area, construction_status, property_images(*)')
    .ilike('title', '%faculdade de medicina%')
    .eq('status', 'published')
    .order('title');

  // Edifício Trindade - Lagos
  const { data: trindade } = await supabase
    .from('properties')
    .select('id, title, slug, price, price_on_request, bedrooms, gross_area, construction_status, property_images(*)')
    .ilike('title', '%Trindade%')
    .eq('status', 'published')
    .order('title');

  return [
    {
      name: 'Lote 26 - Quinta do Pinheiro',
      location: 'Cidade Nova, Covilhã',
      properties: lote26 || [],
    },
    {
      name: 'Edifício Junto à Faculdade de Medicina',
      location: 'Covilhã',
      properties: faculdade || [],
    },
    {
      name: 'Edifício Trindade',
      location: 'Torraltinha, Lagos',
      properties: trindade || [],
    },
  ];
}

function formatPrice(price: number | null) {
  if (price === null) return 'Sob Consulta';
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' €';
}

export default async function ContactPage() {
  const condominiums = await getCondominiums();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="container-wide relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Mail className="h-4 w-4" />
            Fale Connosco
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">Contacte-nos</h1>
          <p className="text-gray-300 text-lg max-w-2xl">Estamos aqui para ajudar. A nossa equipa está pronta para responder às suas questões e acompanhá-lo em cada passo.</p>
        </div>
      </div>

      {/* Condomínios em Destaque */}
      <div className="container-wide py-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Building2 className="h-4 w-4" />
            Condomínios em Destaque
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Explore os Nossos Condomínios
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Encontre o apartamento ideal dentro dos nossos condomínios. Todos os imóveis organizados para facilitar a sua procura.
          </p>
        </div>

        <div className="grid gap-10">
          {condominiums.map((condo) => (
            <div key={condo.name} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">{condo.name}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {condo.location}
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {condo.properties.length} imóve{condo.properties.length === 1 ? 'l' : 'is'} disponíve{condo.properties.length === 1 ? 'l' : 'is'}
                </p>
              </div>
              
              {condo.properties.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                  {condo.properties.map((property: any) => {
                    const coverImage = property.property_images?.find((img: any) => img.is_cover) || property.property_images?.[0];
                    const isSold = property.construction_status === 'sold';
                    
                    return (
                      <Link key={property.id} href={`/imoveis/${property.slug}`} className="group">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-yellow-500/50 hover:shadow-lg transition-all duration-300">
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {coverImage ? (
                              <Image
                                src={coverImage.url}
                                alt={property.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Building2 className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            {isSold && (
                              <div className="absolute top-0 left-0 z-10 overflow-hidden w-24 h-24 pointer-events-none">
                                <div className="absolute top-[12px] left-[-22px] w-[130px] text-center transform -rotate-45 bg-red-600 text-white text-[10px] font-bold py-1 shadow-lg">
                                  Vendido
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-yellow-600 transition-colors mb-2">
                              {property.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                              {property.bedrooms !== null && (
                                <span className="flex items-center gap-1">
                                  <Bed className="h-3.5 w-3.5" />
                                  {property.bedrooms}
                                </span>
                              )}
                              {property.gross_area !== null && (
                                <span className="flex items-center gap-1">
                                  <Maximize className="h-3.5 w-3.5" />
                                  {property.gross_area} m²
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Nenhum imóvel disponível de momento.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="container-wide py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <ContactForm />

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Covialvi - Construções, Lda.
              </h2>
              <p className="text-gray-500 dark:text-gray-400">Empresa especializada em construção e mediação imobiliária.</p>
            </div>

            <div className="grid gap-3">
              {/* Address */}
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Morada</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {company.address.street},<br />
                    {company.address.detail}, {company.address.postalCode} {company.address.locality}
                  </p>
                </div>
              </div>

              {/* Phone & Mobile in a row */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Telefone</h3>
                    <a href={`tel:${company.landlineTel}`} className="text-gray-600 dark:text-gray-400 text-sm hover:text-yellow-600 transition-colors">
                      {company.landline}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Telemóvel</h3>
                    <a href={`tel:${company.phoneTel}`} className="text-gray-600 dark:text-gray-400 text-sm hover:text-yellow-600 transition-colors">
                      {company.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">E-mail</h3>
                  <a href={`mailto:${company.email}`} className="text-gray-600 dark:text-gray-400 text-sm hover:text-yellow-600 transition-colors">
                    {company.email}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Horário</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {company.hours}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="mt-8 rounded-xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1521.5!2d-7.508579!3d40.2268017!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd3d3d8a2b44f8a7%3A0xb87b2a0de875d062!2sFRENTE%20PRINCIPAL!5e0!3m2!1spt-PT!2spt!4v1704900000000!5m2!1spt-PT!2spt"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

      </div>

      {/* QR Code Section - Full Width Dark Background */}
      <div className="bg-gray-900 dark:bg-gray-800 py-16 mt-16">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-shrink-0">
              <Image
                src="https://image-charts.com/chart?chs=300x300&cht=qr&chld=L%7C0&chl=BEGIN%253AVCARD%250AVERSION%253A3.0%250AFN%253ACovialvi+-+Constru%25C3%25A7%25C3%25B5es%252C+Lda.%250ATEL%253BTYPE%253DCELL%252CVOICE%253A%252B351+967+138+116%250ATEL%253BTYPE%253DWORK%252CVOICE%253A%252B351+275+971+394%250AEMAIL%253BTYPE%253DPREF%252CINTERNET%253Acovialvi%2540gmail.com%250AURL%253Ahttp%253A%252F%252Fwww.covialvi.com%250AADR%253AParque+Industrial+do+Tortosendo%252C+Lote+75+-+Rua+E%252C+6200-683+Tortosendo%250AEND%253AVCARD"
                alt="QR Code - Contactos Covialvi"
                width={180}
                height={180}
                className="rounded-lg bg-white p-3"
              />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">Guarde os nossos contactos</h3>
              <p className="text-gray-300 max-w-lg">
                Descarregue os nossos contactos para o seu smartphone. Basta apontar a câmara do seu telemóvel para o código QR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
