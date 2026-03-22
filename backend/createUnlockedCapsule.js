const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
  console.log('Fetching user tester2@example.com...');
  const { data: user } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'tester2@example.com')
    .single();

  if (!user) return console.error('User not found');

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  const { data, error } = await supabase
    .from('capsules')
    .insert({
      sender_id: user.id,
      recipient_type: 'student',
      unlock_date: pastDate.toISOString(),
      content_text: "My dearest friend,\n\nI hope when this capsule unlocks, you are doing wonderfully. This note is designed to be elegant, simple, and clean—like a letter preserved across the years.\n\nKeep shining!",
      is_collaborative: true,
      is_unlocked: true,
      is_public: false
    })
    .select();
    
  if (error) {
    console.error('Database Error:', error.message);
  } else {
    console.log('Successfully created beautiful unlocked capsule test data.');
  }
}

run();
