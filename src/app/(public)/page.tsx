import { createClient } from '@/lib/supabase/server';
import { HomeClient } from './home-client';

export const dynamic = 'force-dynamic';

async function getFeaturedProperties(): Promise<any[]> {
  const supabase = createClient();
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
