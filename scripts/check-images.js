const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && !key.startsWith('#')) {
    process.env[key.trim()] = vals.join('=').trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadHeroVideo() {
  const videoPath = path.join(__dirname, '..', 'src', 'video', 'video site covialvi.mp4');
  const fileBuffer = fs.readFileSync(videoPath);
  
  console.log('Uploading hero video to Supabase storage...');
  console.log('File size:', (fileBuffer.length / 1024 / 1024).toFixed(1), 'MB');

  const { data, error } = await supabase.storage
    .from('property-images')
    .upload('site/hero.mp4', fileBuffer, {
      contentType: 'video/mp4',
      upsert: true,
    });

  if (error) {
    console.error('Upload error:', error);
    return;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl('site/hero.mp4');

  console.log('Upload successful!');
  console.log('Public URL:', publicUrl);
}

uploadHeroVideo();
