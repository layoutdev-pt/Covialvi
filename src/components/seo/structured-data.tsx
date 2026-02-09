/**
 * Structured Data Components for SEO
 * JSON-LD schema.org markup for better search engine visibility
 */

import { company } from '@/lib/company';

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  '@id': 'https://covialvi.com/#organization',
  name: 'Covialvi - Construções, Lda.',
  alternateName: 'Covialvi Imobiliária',
  url: 'https://covialvi.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://covialvi.com/logo.png',
    width: 200,
    height: 60,
  },
  image: 'https://covialvi.com/og-image.jpg',
  description: 'Imobiliária de referência em Portugal, especializada em compra, venda e arrendamento de imóveis. Apartamentos, moradias e imóveis comerciais na Covilhã e região.',
  telephone: company.phoneTel,
  email: company.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${company.address.street}, ${company.address.detail}`,
    addressLocality: company.address.locality,
    addressRegion: company.address.district,
    postalCode: company.address.postalCode,
    addressCountry: company.address.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.2268,
    longitude: -7.5086,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '13:00',
    },
  ],
  sameAs: [
    'https://www.facebook.com/covialvi',
    'https://www.instagram.com/covialvi',
  ],
  priceRange: '€€',
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 40.2833,
      longitude: -7.5,
    },
    geoRadius: '100000',
  },
};

// Local Business Schema
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://covialvi.com/#localbusiness',
  name: 'Covialvi Imobiliária',
  image: 'https://covialvi.com/og-image.jpg',
  telephone: company.phoneTel,
  email: company.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${company.address.street}, ${company.address.detail}`,
    addressLocality: company.address.locality,
    addressRegion: company.address.district,
    postalCode: company.address.postalCode,
    addressCountry: company.address.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.2268,
    longitude: -7.5086,
  },
  url: company.website,
  priceRange: '€€',
};

// Website Schema
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://covialvi.com/#website',
  url: 'https://covialvi.com',
  name: 'Covialvi - Imobiliária de Confiança em Portugal',
  description: 'Encontre o seu imóvel ideal em Portugal. Apartamentos, moradias e imóveis comerciais para comprar, vender ou arrendar.',
  publisher: {
    '@id': 'https://covialvi.com/#organization',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://covialvi.com/imoveis?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'pt-PT',
};

// Generate Breadcrumb Schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Generate Property Schema
export function generatePropertySchema(property: {
  title: string;
  description?: string;
  slug: string;
  price?: number;
  price_on_request?: boolean;
  business_type: string;
  nature: string;
  municipality?: string;
  district?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  gross_area?: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
  coverImage?: string;
}) {
  const baseUrl = 'https://covialvi.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${baseUrl}/imoveis/${property.slug}#listing`,
    name: property.title,
    description: property.description,
    url: `${baseUrl}/imoveis/${property.slug}`,
    datePosted: property.created_at,
    image: property.coverImage,
    offers: !property.price_on_request && property.price ? {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      unitText: 'm²',
    } : undefined,
    broker: {
      '@id': 'https://covialvi.com/#organization',
    },
  };
}

// Generate FAQ Schema
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Structured Data Script Component
export function StructuredData({ data }: { data: object | object[] }) {
  const jsonLd = Array.isArray(data) ? data : [data];
  
  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
