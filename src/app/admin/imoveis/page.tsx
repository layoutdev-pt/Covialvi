import { createClient, createServiceClient } from '@/lib/supabase/server';
import { PropertiesClient } from './properties-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProperties(): Promise<any[]> {
  const supabase = createServiceClient();
  
  // Fetch properties
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (propError) {
    console.error('Error fetching properties:', propError);
    return [];
  }

  if (!properties || properties.length === 0) {
    return [];
  }

  // Fetch all images
  const { data: images, error: imgError } = await supabase
    .from('property_images')
    .select('*');

  if (imgError) {
    console.error('Error fetching images:', imgError);
  }

  // Merge images into properties
  const propertiesWithImages = properties.map((property: any) => ({
    ...property,
    property_images: images?.filter((img: any) => img.property_id === property.id) || []
  }));

  return propertiesWithImages;
}

export default async function AdminPropertiesPage() {
  const properties = await getProperties();

  return <PropertiesClient properties={properties} />;
}
