const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
  console.log('Clearing all capsules...');
  const { error } = await supabase
    .from('capsules')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
    
  if (error) {
    console.error('Error clearing capsules:', error.message);
  } else {
    console.log('Successfully cleared all capsules.');
  }
}

run();
