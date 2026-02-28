/**
 * Script to create the profile trigger in Supabase
 * This ensures all new user registrations create a profile record
 * so they appear in the admin users page
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupProfileTrigger() {
  try {
    console.log('🔧 Setting up profile trigger for user registration...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create-profile-trigger.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📝 Executing SQL script...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      console.log('⚠️ exec_sql function not found, trying alternative method...');
      
      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`🔨 Executing: ${statement.substring(0, 50)}...`);
          
          // Try using raw SQL execution
          const { error: stmtError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1); // Test connection first
          
          if (stmtError && !stmtError.message.includes('does not exist')) {
            console.error('❌ Database connection error:', stmtError);
            throw stmtError;
          }
          
          // For now, we'll provide manual instructions
          console.log('⚠️ Auto-execution not available. Please run the SQL manually.');
          break;
        }
      }
    } else {
      console.log('✅ Profile trigger created successfully!');
    }
    
    console.log('\n📋 Manual Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of: scripts/create-profile-trigger.sql');
    console.log('4. Run the SQL script');
    console.log('5. Test by creating a new user account');
    console.log('6. Check the admin users page to verify the new user appears');
    
  } catch (error) {
    console.error('❌ Error setting up profile trigger:', error);
    process.exit(1);
  }
}

// Test existing profiles
async function checkExistingUsers() {
  try {
    console.log('\n🔍 Checking existing users...');
    
    // Check auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    console.log(`📊 Found ${authUsers.users.length} users in auth.users`);
    
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      console.log('⚠️ Profiles table might not exist yet');
      return;
    }
    
    console.log(`📊 Found ${profiles.length} users in profiles table`);
    
    // Find users in auth but not in profiles
    const authUserIds = new Set(authUsers.users.map(u => u.id));
    const profileUserIds = new Set(profiles.map(p => p.id));
    
    const missingProfiles = authUsers.users.filter(u => !profileUserIds.has(u.id));
    
    if (missingProfiles.length > 0) {
      console.log(`⚠️ Found ${missingProfiles.length} users without profiles:`);
      missingProfiles.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
      
      console.log('\n🔧 Creating missing profiles...');
      
      for (const user of missingProfiles) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            phone: user.user_metadata?.phone || '',
            role: 'user',
            is_active: true,
            created_at: user.created_at,
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`❌ Error creating profile for ${user.email}:`, insertError);
        } else {
          console.log(`✅ Created profile for ${user.email}`);
        }
      }
    } else {
      console.log('✅ All users have profiles');
    }
    
  } catch (error) {
    console.error('❌ Error checking existing users:', error);
  }
}

// Main execution
async function main() {
  await checkExistingUsers();
  await setupProfileTrigger();
}

main().catch(console.error);
