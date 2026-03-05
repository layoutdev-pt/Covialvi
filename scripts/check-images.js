const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
  const slug = 'edificio-habitacional-c-piscina-condominio-fechado-praia-da-luz-lagos-1769091760884';
  
  console.log(`\nFinding property by slug: ${slug}\n`);
  
  // First find the property by slug
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('id, title, slug')
    .eq('slug', slug)
    .single();
  
  if (propError) {
    console.error('Property Error:', propError);
    return;
  }
  
  console.log('Property found:', property);
  console.log(`\nChecking images for property ID: ${property.id}\n`);
  
  // Check property_images table
  const { data: images, error } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', property.id);
  
  if (error) {
    console.error('Images Error:', error);
    return;
  }
  
  console.log(`Found ${images?.length || 0} images:`);
  console.log(JSON.stringify(images, null, 2));
}

checkImages();
