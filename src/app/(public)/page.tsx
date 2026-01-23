import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { HomeClient } from './home-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Covialvi | Imobiliária de Confiança em Portugal - Comprar, Vender e Arrendar Imóveis',
  description: 'A Covialvi é a sua imobiliária de referência em Portugal. Encontre apartamentos, moradias, terrenos e imóveis comerciais para comprar, vender ou arrendar. Serviço personalizado e de confiança na Covilhã e região.',
  keywords: [
    'imobiliária Portugal',
    'comprar casa Portugal',
    'vender imóvel',
    'arrendar apartamento',
    'moradias Covilhã',
    'apartamentos Portugal',
    'imóveis comerciais',
    'terrenos para construção',
    'avaliação imóveis',
    'mediação imobiliária',
  ],
  openGraph: {
    title: 'Covialvi | Imobiliária de Confiança em Portugal',
    description: 'Encontre o seu imóvel ideal em Portugal. Apartamentos, moradias e imóveis comerciais para comprar, vender ou arrendar.',
    type: 'website',
    locale: 'pt_PT',
    url: 'https://covialvi.com',
    siteName: 'Covialvi',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Covialvi - Imobiliária de Confiança em Portugal',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Covialvi | Imobiliária de Confiança em Portugal',
    description: 'Encontre o seu imóvel ideal em Portugal com a Covialvi.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://covialvi.com',
  },
};

async function getFeaturedProperties(): Promise<any[]> {
  const supabase = createClient();
  // First try to get featured properties
  const { data: featuredData } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (*)
    `)
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  
  // If no featured properties, fall back to latest published
  if (featuredData && featuredData.length > 0) {
    return featuredData;
  }
  
  const { data } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}

async function getMostViewedProperty(): Promise<any | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (*)
    `)
    .eq('status', 'published')
    .order('views_count', { ascending: false })
    .limit(1)
    .single();
  return data || null;
}

async function getStats() {
  const supabase = createClient();
  const { count: propertiesCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');
  
  return {
    properties: propertiesCount || 0,
    projects: 80,
    clients: 50,
    value: '10M',
  };
}

export default async function HomePage() {
  const [properties, stats, heroProperty] = await Promise.all([
    getFeaturedProperties(),
    getStats(),
    getMostViewedProperty(),
  ]);

  return (
    <HomeClient 
      properties={properties} 
      stats={stats} 
      heroProperty={heroProperty} 
    />
  );
}
