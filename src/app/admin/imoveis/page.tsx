import { createClient, createServiceClient } from '@/lib/supabase/server';
import { PropertiesClient } from './properties-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProperties(): Promise<any[]> {
  const supabase = createServiceClient();
  
  // Fetch properties with images in a single query for better performance
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (*)
    `)
    .order('created_at', { ascending: false });

  if (propError) {
    console.error('Error fetching properties:', propError);
    return [];
  }

  return properties || [];
}

export default async function AdminPropertiesPage() {
  const properties = await getProperties();

  return <PropertiesClient properties={properties} />;
}
