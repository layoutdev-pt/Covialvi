/**
 * Property Importer for Supabase
 * 
 * This script imports properties from the scraped JSON file into the Supabase database.
 * 
 * Usage: node scripts/import-properties.js
 * 
 * Requirements:
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 * - properties-export.json file from the scraper
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INPUT_FILE = path.join(__dirname, 'properties-export.json');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Make sure your .env.local file contains these variables.');
  process.exit(1);
}

// Helper to make Supabase API requests
function supabaseRequest(endpoint, method, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SUPABASE_URL);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = body ? JSON.parse(body) : {};
          if (res.statusCode >= 400) {
            reject(new Error(`API Error ${res.statusCode}: ${JSON.stringify(result)}`));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Generate a URL-friendly slug
function generateSlug(title, reference) {
  const base = title || reference || 'property';
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100) + '-' + Date.now().toString(36);
}

// Map scraped data to database schema
function mapToDbSchema(property) {
  return {
    title: property.title || 'Imóvel sem título',
    slug: generateSlug(property.title, property.reference),
    reference: property.reference || `REF-${Date.now()}`,
    description: property.description || null,
    nature: property.nature || 'apartment',
    business_type: property.business_type || 'sale',
    status: 'published',
    price: property.price,
    price_on_request: property.price_on_request || false,
    district: property.district || null,
    municipality: property.municipality || null,
    parish: property.parish || null,
    address: null,
    postal_code: null,
    latitude: null,
    longitude: null,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    gross_area: property.gross_area,
    useful_area: property.useful_area,
    land_area: null,
    floors: null,
    construction_year: null,
    construction_status: property.construction_status || 'used',
    energy_certificate: property.energy_certificate || null,
    typology: property.bedrooms ? `T${property.bedrooms}` : null,
    equipment: null,
    extras: null,
    surrounding_area: null,
    video_url: null,
    virtual_tour_url: null,
    brochure_url: null,
    featured: false,
    views_count: 0
  };
}

// Import a single property with its images
async function importProperty(property, index, total) {
  console.log(`\n📥 Importing ${index + 1}/${total}: ${property.title || 'Unknown'}`);
  
  try {
    // Map to database schema
    const dbProperty = mapToDbSchema(property);
    
    // Insert property
    const result = await supabaseRequest('/rest/v1/properties', 'POST', dbProperty);
    
    if (!result || !result[0]) {
      throw new Error('No result returned from insert');
    }
    
    const propertyId = result[0].id;
    console.log(`   ✓ Property created with ID: ${propertyId}`);
    
    // Import images
    if (property.images && property.images.length > 0) {
      console.log(`   📷 Importing ${property.images.length} images...`);
      
      for (let i = 0; i < property.images.length; i++) {
        const imageUrl = property.images[i];
        const imageData = {
          property_id: propertyId,
          url: imageUrl,
          is_cover: i === 0,
          order: i,
          created_at: new Date().toISOString()
        };
        
        try {
          await supabaseRequest('/rest/v1/property_images', 'POST', imageData);
        } catch (imgErr) {
          console.log(`   ⚠️  Failed to import image ${i + 1}: ${imgErr.message}`);
        }
      }
      
      console.log(`   ✓ Images imported`);
    }
    
    return { success: true, id: propertyId };
    
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main import function
async function importProperties() {
  console.log('🏠 Starting property import to Supabase...\n');
  
  // Check if input file exists
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Input file not found: ${INPUT_FILE}`);
    console.error('   Run the scraper first: node scripts/scrape-properties.js');
    process.exit(1);
  }
  
  // Load properties
  const properties = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`📄 Loaded ${properties.length} properties from JSON file`);
  
  // Import each property
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (let i = 0; i < properties.length; i++) {
    const result = await importProperty(properties[i], i, properties.length);
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({
        property: properties[i].title,
        error: result.error
      });
    }
    
    // Small delay between imports
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Import Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully imported: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(err => {
      console.log(`  - ${err.property}: ${err.error}`);
    });
  }
  
  console.log('\n🎉 Import complete!');
}

// Run the importer
importProperties().catch(console.error);
