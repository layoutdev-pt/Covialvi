/**
 * Property Scraper for covialvi.com
 * 
 * This script scrapes property listings from the old covialvi.com website
 * and exports them to a CSV file for import into the new database.
 * 
 * Usage: node scripts/scrape-properties.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://www.covialvi.com';
const SITEMAP_URL = `${BASE_URL}/sitemap-pt-pt.xml`;
const OUTPUT_FILE = path.join(__dirname, 'properties-export.csv');

// Helper to make HTTP requests
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Parse property links from sitemap XML
function parsePropertyLinks(xml) {
  const propertyLinks = [];
  const linkRegex = /<loc>(http:\/\/www\.covialvi\.com\/imovel\/[^<]+)<\/loc>/g;
  let match;
  
  while ((match = linkRegex.exec(xml)) !== null) {
    const url = match[1].split('?')[0]; // Remove query params
    if (!propertyLinks.includes(url)) {
      propertyLinks.push(url);
    }
  }
  
  return propertyLinks;
}

// Parse property data from URL slug (fallback when page fetch fails)
function parsePropertyFromUrl(url) {
  const property = {
    url: url,
    title: '',
    reference: '',
    nature: 'apartment',
    business_type: 'sale',
    price: null,
    price_on_request: true,
    district: '',
    municipality: '',
    parish: '',
    bedrooms: null,
    bathrooms: null,
    gross_area: null,
    useful_area: null,
    description: '',
    construction_status: 'new',
    energy_certificate: '',
    images: []
  };

  // Extract slug from URL
  const slugMatch = url.match(/\/imovel\/([^\/\?]+)/);
  if (!slugMatch) return property;
  
  const slug = slugMatch[1];
  
  // Parse title from slug
  property.title = slug
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Extract reference (last part after last dash with letters)
  const refMatch = slug.match(/([a-z]+-\d+)$/i);
  if (refMatch) {
    property.reference = refMatch[1].toUpperCase();
  }

  // Extract bedrooms (T1, T2, T3, etc.)
  const bedroomsMatch = slug.match(/t(\d+)/i);
  if (bedroomsMatch) {
    property.bedrooms = parseInt(bedroomsMatch[1]);
  }

  // Extract nature from slug
  const naturePatterns = [
    { pattern: /apartamento/i, value: 'apartment' },
    { pattern: /moradia/i, value: 'house' },
    { pattern: /terreno/i, value: 'land' },
    { pattern: /loja/i, value: 'shop' },
    { pattern: /armazem|armazém/i, value: 'warehouse' },
    { pattern: /escritorio|escritório/i, value: 'office' },
    { pattern: /garagem/i, value: 'garage' },
    { pattern: /hotel/i, value: 'commercial' },
    { pattern: /edificio|edifício/i, value: 'commercial' },
    { pattern: /espaco-comercial|espaço-comercial/i, value: 'commercial' },
    { pattern: /quinta/i, value: 'land' },
    { pattern: /centro-negocios/i, value: 'commercial' },
  ];
  
  for (const { pattern, value } of naturePatterns) {
    if (pattern.test(slug)) {
      property.nature = value;
      break;
    }
  }

  // Extract location from slug
  const locationPatterns = [
    { pattern: /covilha/i, district: 'Castelo Branco', municipality: 'Covilhã' },
    { pattern: /castelo-branco/i, district: 'Castelo Branco', municipality: 'Castelo Branco' },
    { pattern: /fundao/i, district: 'Castelo Branco', municipality: 'Fundão' },
    { pattern: /lagos/i, district: 'Faro', municipality: 'Lagos' },
    { pattern: /portimao/i, district: 'Faro', municipality: 'Portimão' },
    { pattern: /faro/i, district: 'Faro', municipality: 'Faro' },
    { pattern: /tomar/i, district: 'Santarém', municipality: 'Tomar' },
    { pattern: /vila-do-bispo/i, district: 'Faro', municipality: 'Vila do Bispo' },
  ];
  
  for (const { pattern, district, municipality } of locationPatterns) {
    if (pattern.test(slug)) {
      property.district = district;
      property.municipality = municipality;
      break;
    }
  }

  // Extract business type
  if (slug.includes('arrenda') || slug.includes('arrendamento')) {
    property.business_type = 'rent';
  } else if (slug.includes('trespasse')) {
    property.business_type = 'transfer';
  }

  // Check construction status
  if (slug.includes('construcao') || slug.includes('novo')) {
    property.construction_status = 'under_construction';
  } else if (slug.includes('remodelad')) {
    property.construction_status = 'renovated';
  }

  return property;
}

// Parse individual property page
function parsePropertyPage(html, url) {
  // First try to parse from URL
  const property = parsePropertyFromUrl(url);
  
  // If HTML is available, try to extract more data
  if (html && html.length > 100) {
    // Extract title
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch && titleMatch[1].trim()) {
      property.title = titleMatch[1].trim();
    }

    // Extract reference
    const refMatch = html.match(/Refer[êe]ncia[:\s]*([A-Z0-9-]+)/i);
    if (refMatch) {
      property.reference = refMatch[1].trim();
    }

    // Extract price
    const priceMatch = html.match(/(\d[\d\s.,]*)\s*€/);
    if (priceMatch) {
      const priceStr = priceMatch[1].replace(/\s/g, '').replace(',', '.');
      property.price = parseFloat(priceStr);
      property.price_on_request = false;
    }
    
    if (html.includes('Sob Consulta') || html.includes('sob consulta')) {
      property.price_on_request = true;
      property.price = null;
    }

    // Extract area
    const areaMatch = html.match(/(\d+[,.]?\d*)\s*m²/i);
    if (areaMatch) {
      property.gross_area = parseFloat(areaMatch[1].replace(',', '.'));
    }

    // Extract images
    const imageRegex = /src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi;
    let imgMatch;
    while ((imgMatch = imageRegex.exec(html)) !== null) {
      if (!property.images.includes(imgMatch[1]) && !imgMatch[1].includes('logo')) {
        property.images.push(imgMatch[1]);
      }
    }

    // Extract description
    const descMatch = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (descMatch) {
      property.description = descMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000);
    }
  }

  return property;
}

// Convert properties to CSV
function toCSV(properties) {
  const headers = [
    'title',
    'reference',
    'nature',
    'business_type',
    'price',
    'price_on_request',
    'district',
    'municipality',
    'parish',
    'bedrooms',
    'bathrooms',
    'gross_area',
    'useful_area',
    'description',
    'construction_status',
    'energy_certificate',
    'images',
    'source_url'
  ];

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = properties.map(prop => [
    escapeCSV(prop.title),
    escapeCSV(prop.reference),
    escapeCSV(prop.nature),
    escapeCSV(prop.business_type),
    escapeCSV(prop.price),
    escapeCSV(prop.price_on_request),
    escapeCSV(prop.district),
    escapeCSV(prop.municipality),
    escapeCSV(prop.parish),
    escapeCSV(prop.bedrooms),
    escapeCSV(prop.bathrooms),
    escapeCSV(prop.gross_area),
    escapeCSV(prop.useful_area),
    escapeCSV(prop.description),
    escapeCSV(prop.construction_status),
    escapeCSV(prop.energy_certificate),
    escapeCSV(prop.images.join('|')),
    escapeCSV(prop.url)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

// Main scraping function
async function scrapeProperties() {
  console.log('🏠 Starting property scraper for covialvi.com...\n');
  
  try {
    // Fetch sitemap
    console.log('📄 Fetching sitemap...');
    const sitemapXml = await fetchUrl(SITEMAP_URL);
    
    // Extract property links
    const propertyLinks = parsePropertyLinks(sitemapXml);
    console.log(`✅ Found ${propertyLinks.length} property links\n`);
    
    if (propertyLinks.length === 0) {
      console.log('⚠️  No properties found. The website structure may have changed.');
      console.log('    You may need to manually export the data or update the scraper.');
      return;
    }
    
    // Scrape each property
    const properties = [];
    for (let i = 0; i < propertyLinks.length; i++) {
      const url = propertyLinks[i];
      console.log(`📥 Scraping property ${i + 1}/${propertyLinks.length}: ${url}`);
      
      try {
        const propertyHtml = await fetchUrl(url);
        const property = parsePropertyPage(propertyHtml, url);
        properties.push(property);
        console.log(`   ✓ ${property.title || 'Unknown'}`);
        
        // Small delay to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.log(`   ✗ Error: ${err.message}`);
      }
    }
    
    // Export to CSV
    console.log('\n📊 Exporting to CSV...');
    const csv = toCSV(properties);
    fs.writeFileSync(OUTPUT_FILE, csv, 'utf8');
    console.log(`✅ Exported ${properties.length} properties to: ${OUTPUT_FILE}`);
    
    // Also save as JSON for easier import
    const jsonFile = OUTPUT_FILE.replace('.csv', '.json');
    fs.writeFileSync(jsonFile, JSON.stringify(properties, null, 2), 'utf8');
    console.log(`✅ Also saved as JSON: ${jsonFile}`);
    
    console.log('\n🎉 Scraping complete!');
    console.log('\nNext steps:');
    console.log('1. Review the exported data in the CSV/JSON files');
    console.log('2. Run: node scripts/import-properties.js to import to database');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the scraper
scrapeProperties();
