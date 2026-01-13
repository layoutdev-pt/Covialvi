const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllProperties() {
  console.log('Starting deletion of all properties...\n');

  try {
    // First, get count of properties
    const { count: propertyCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    console.log(`Found ${propertyCount} properties to delete.\n`);

    if (propertyCount === 0) {
      console.log('No properties to delete.');
      return;
    }

    // Delete all property images first (cascade should handle this, but being explicit)
    const { error: imagesError } = await supabase
      .from('property_images')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (imagesError) {
      console.error('Error deleting property images:', imagesError.message);
    } else {
      console.log('✓ Deleted all property images');
    }

    // Delete all property floor plans
    const { error: floorPlansError } = await supabase
      .from('property_floor_plans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (floorPlansError) {
      console.error('Error deleting floor plans:', floorPlansError.message);
    } else {
      console.log('✓ Deleted all floor plans');
    }

    // Delete all favorites related to properties
    const { error: favoritesError } = await supabase
      .from('favorites')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (favoritesError) {
      console.error('Error deleting favorites:', favoritesError.message);
    } else {
      console.log('✓ Deleted all favorites');
    }

    // Delete all visits related to properties
    const { error: visitsError } = await supabase
      .from('visits')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (visitsError) {
      console.error('Error deleting visits:', visitsError.message);
    } else {
      console.log('✓ Deleted all visits');
    }

    // Finally delete all properties
    const { error: propertiesError } = await supabase
      .from('properties')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (propertiesError) {
      console.error('Error deleting properties:', propertiesError.message);
    } else {
      console.log('✓ Deleted all properties');
    }

    console.log('\n✅ All properties and related data have been deleted!');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

deleteAllProperties();
