const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
  console.log('Checking database connection and applying admin role...')
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin', is_verified: true })
    .eq('email', 'tester2@example.com')
    .select();
    
  if (error) {
    console.error('Database Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Successfully made tester2@example.com an admin.');
  } else {
    console.log('User not found. Try creating the user first.');
  }
}

run();
