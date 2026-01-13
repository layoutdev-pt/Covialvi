#!/usr/bin/env node

/**
 * Script to scrape images from covialvi.com and import them to Supabase
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    });
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Fetch URL content
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
      },
      timeout: 30000
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return fetchUrl(response.headers.location).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Extract images from property page HTML
function extractImages(html, propertyUrl) {
  const images = [];
  
  // Look for image URLs - images.egorealestate.com domain
  const patterns = [
    // images.egorealestate.com URLs (the actual image host)
    /(https?:\/\/images\.egorealestate\.com[^"'\s<>]+\.(?:jpg|jpeg|png|webp))/gi,
    // media.egorealestate.com URLs
    /(https?:\/\/media\.egorealestate\.com[^"'\s<>]+\.(?:jpg|jpeg|png|webp))/gi,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      // Clean up URL - remove everything after the extension
      url = url.replace(/\.(jpg|jpeg|png|webp).*/i, '.$1');
      if (!images.includes(url) && !url.includes('logo') && !url.includes('icon') && !url.includes('marker')) {
        images.push(url);
      }
    }
  }
  
  return images;
}

// Supabase API call
async function supabaseRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SUPABASE_URL);
    const options = {
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
      },
    };
    
    const client = url.protocol === 'https:' ? https : http;
    const request = client.request(url, options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(data ? JSON.parse(data) : null);
        } else {
          reject(new Error(`API Error ${response.statusCode}: ${data}`));
        }
      });
    });
    
    request.on('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });
}

// Get all properties from database
async function getProperties() {
  const data = await supabaseRequest('/rest/v1/properties?select=id,reference,title,slug');
  return data;
}

// Get existing images for a property
async function getPropertyImages(propertyId) {
  const data = await supabaseRequest(`/rest/v1/property_images?property_id=eq.${propertyId}&select=url`);
  return data.map(img => img.url);
}

// Add image to database
async function addImage(propertyId, url, order, isCover = false) {
  const body = {
    property_id: propertyId,
    url: url,
    alt: null,
    order: order,
    is_cover: isCover,
  };
  
  return supabaseRequest('/rest/v1/property_images', 'POST', body);
}

// Build property URL from reference
function buildPropertyUrl(reference, title) {
  // The URL pattern is: /imovel/{slug}/
  // Slug is derived from title
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `http://www.covialvi.com/imovel/${slug}/`;
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch sitemap and extract property URLs
async function getSitemapUrls() {
  console.log('🌐 Fetching sitemap...');
  const sitemapXml = await fetchUrl('http://www.covialvi.com/sitemap-pt-pt.xml');
  
  const urls = [];
  const regex = /<loc>(http:\/\/www\.covialvi\.com\/imovel\/[^<]+)<\/loc>/g;
  let match;
  
  while ((match = regex.exec(sitemapXml)) !== null) {
    urls.push(match[1]);
  }
  
  console.log(`📦 Found ${urls.length} property URLs in sitemap`);
  return urls;
}

// Extract reference from URL (e.g., "apa-237" from the URL)
function extractRefFromUrl(url) {
  // Match patterns like "apa-237", "cas-133", "hab-219", etc.
  const match = url.match(/([a-z]{2,4})-(\d+)/i);
  if (match) {
    return `${match[1].toUpperCase()}-${match[2]}`;
  }
  return null;
}

// Main function
async function main() {
  console.log('🔍 Fetching properties from database...');
  
  const properties = await getProperties();
  console.log(`📦 Found ${properties.length} properties in database\n`);
  
  // Create a map of reference -> property
  const propertyMap = {};
  for (const prop of properties) {
    if (prop.reference) {
      propertyMap[prop.reference.toUpperCase()] = prop;
    }
  }
  
  // Get sitemap URLs
  const sitemapUrls = await getSitemapUrls();
  
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;
  
  for (let i = 0; i < sitemapUrls.length; i++) {
    const propertyUrl = sitemapUrls[i];
    const ref = extractRefFromUrl(propertyUrl);
    
    console.log(`\n📥 Processing ${i + 1}/${sitemapUrls.length}: ${ref || 'Unknown'}`);
    
    if (!ref) {
      console.log(`   ⚠️  Could not extract reference from URL`);
      notFoundCount++;
      continue;
    }
    
    const property = propertyMap[ref];
    if (!property) {
      console.log(`   ⚠️  Property ${ref} not found in database`);
      notFoundCount++;
      continue;
    }
    
    try {
      // Check if property already has images
      const existingImages = await getPropertyImages(property.id);
      if (existingImages.length > 0) {
        console.log(`   ⏭️  Already has ${existingImages.length} images, skipping`);
        skippedCount++;
        continue;
      }
      
      console.log(`   🌐 Fetching: ${propertyUrl.substring(0, 80)}...`);
      
      // Fetch the property page
      let html;
      try {
        html = await fetchUrl(propertyUrl);
      } catch (err) {
        console.log(`   ❌ Failed to fetch page: ${err.message}`);
        failCount++;
        continue;
      }
      
      // Extract images
      const images = extractImages(html, propertyUrl);
      
      if (images.length === 0) {
        console.log(`   ⚠️  No images found`);
        failCount++;
        continue;
      }
      
      console.log(`   📸 Found ${images.length} images`);
      
      // Add images to database
      for (let j = 0; j < images.length; j++) {
        const isCover = j === 0;
        try {
          await addImage(property.id, images[j], j, isCover);
          process.stdout.write('.');
        } catch (err) {
          process.stdout.write('x');
        }
      }
      console.log(` ✓`);
      successCount++;
      
      // Rate limiting
      await sleep(800);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n=====================================');
  console.log('📊 Import Summary');
  console.log('=====================================');
  console.log(`✅ Successfully processed: ${successCount}`);
  console.log(`⏭️  Skipped (already have images): ${skippedCount}`);
  console.log(`⚠️  Not found in database: ${notFoundCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('\n🎉 Image import complete!');
}

main().catch(console.error);
