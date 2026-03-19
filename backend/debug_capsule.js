require('dotenv').config({ path: './.env' });
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testCapsuleCreation() {
  console.log('Testing capsule creation...');
  try {
    // 1. Login as student
    let { data, error } = await supabase.auth.signInWithPassword({
      email: 'student1@test.com', // Assuming a test student exists, or we create one
      password: 'password123'
    });
    
    if (error) {
      console.log('Login failed, registering new test student...');
      const reg = await axios.post('http://localhost:3000/api/auth/register', {
        name: 'Debug Student',
        email: 'debug_student_' + Date.now() + '@test.com',
        password: 'password123',
        role: 'student'
      });
      data = { session: { access_token: reg.data.token } };
    }

    const token = data.session.access_token;
    console.log('Got token. Attempting to create capsule...');

    const res = await axios.post('http://localhost:3000/api/capsules', {
      recipient_type: 'teacher',
      content_text: 'Debug test message'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.error('FAILED TO CREATE CAPSULE:');
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testCapsuleCreation();
