const apiUrl = 'http://localhost:3001/api/auth';
const testUser = {
  name: 'Test User ' + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  role: 'student'
};

async function testAuth() {
  console.log('Testing /register...');
  try {
    const regRes = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regData = await regRes.json();
    console.log('Register Response:', regRes.status, regData);

    if (regRes.status !== 201) {
      console.log('Registration failed, we continue with error.');
    }

    console.log('\nTesting /login...');
    const loginRes = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginRes.status, loginData);

    console.log('\nTesting /forgot-password...');
    const fpRes = await fetch(`${apiUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    const fpData = await fpRes.json();
    console.log('Forgot Password Response:', fpRes.status, fpData);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuth();
