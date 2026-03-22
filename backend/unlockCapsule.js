const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
  console.log('Fetching a capsule to unlock...')
  const { data: capsules, error: fetchError } = await supabase
    .from('capsules')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchError || !capsules || !capsules.length) {
    console.error('No capsules found or error:', fetchError);
    return;
  }

  const capsule = capsules[0];
  console.log('Found capsule:', capsule.title || 'Untitled');

  // Set unlock date to yesterday
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);

  const { data, error } = await supabase
    .from('capsules')
    .update({ unlock_date: pastDate.toISOString(), is_unlocked: true, is_public: false })
    .eq('id', capsule.id)
    .select();
    
  if (error) {
    console.error('Database Error:', error.message);
  } else {
    console.log('Successfully unlocked capsule. Readiness for Hall of Fame test complete.');
  }
}

run();
