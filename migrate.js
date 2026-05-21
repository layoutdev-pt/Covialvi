const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env if running locally
const envConfig = dotenv.parse(fs.readFileSync('.env'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

async function migrate() {
  const supabaseUrl = process.env.covialvi_SUPABASE_URL;
  const supabaseServiceKey = process.env.covialvi_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Starting migration...');

  // Update properties
  const { data, error } = await supabase
    .from('properties')
    .update({ construction_status: 'sold_100' })
    .eq('construction_status', 'sold')
    .select();

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log(`Migration completed successfully. Updated ${data.length} properties.`);
}

migrate();
