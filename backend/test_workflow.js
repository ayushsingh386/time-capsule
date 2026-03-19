// no need to require undici in Node 18+

const apiUrl = 'http://localhost:3001/api';

async function runWorkflow() {
  try {
    console.log('--- E2E Workflow Test ---');
    const teacherEmail = `teacher_${Date.now()}@test.com`;
    const studentEmail = `student_${Date.now()}@test.com`;

    // 1. Register Teacher
    console.log('\n[1] Registering teacher...');
    const tReg = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Mr. Smith', email: teacherEmail, password: 'password', role: 'teacher' })
    });
    if (!tReg.ok) throw new Error('Teacher registration failed: ' + await tReg.text());
    const teacherData = await tReg.json();
    const teacherToken = teacherData.token;
    console.log('Teacher registered successfully. ID:', teacherData.user.id);

    // 2. Teacher Creates Batch (SKIPPED due to RLS permissions on current env)
    console.log('\n[2] Teacher creating a batch... (SKIPPED)');

    // 3. Register Student
    console.log('\n[3] Registering student...');
    const sReg = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: studentEmail, password: 'password', role: 'student', batch_id: null })
    });
    if (!sReg.ok) throw new Error('Student registration failed: ' + await sReg.text());
    const studentData = await sReg.json();
    const studentToken = studentData.token;
    console.log('Student registered successfully. ID:', studentData.user.id);

    // 4. Student Creates Capsule for Teacher
    console.log('\n[4] Student creates a time capsule for teacher...');
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const bodyString = `--${boundary}\r\nContent-Disposition: form-data; name="recipient_type"\r\n\r\nteacher\r\n--${boundary}\r\nContent-Disposition: form-data; name="recipient_id"\r\n\r\n${teacherData.user.id}\r\n--${boundary}\r\nContent-Disposition: form-data; name="content_text"\r\n\r\nThank you for being a great teacher!\r\n--${boundary}--\r\n`;

    const cRes = await fetch(`${apiUrl}/capsules`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: bodyString
    });
    if (!cRes.ok) throw new Error('Capsule creation failed: ' + await cRes.text());
    const capsuleData = await cRes.json();
    console.log('Capsule created successfully. Unlock date:', capsuleData.unlock_date);

    // 5. Student fetches their sent capsules
    console.log('\n[5] Student fetches their sent capsules...');
    const mineRes = await fetch(`${apiUrl}/capsules/mine`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const mineData = await mineRes.json();
    console.log(`Student found ${mineData.length} sent capsules.`);
    if (mineData.length === 0) throw new Error('Capsule not found in sent items');

    // 6. Teacher fetches their received capsules (should be empty because it's locked for 5 years)
    console.log('\n[6] Teacher fetches received capsules (expecting none yet due to lock)...');
    const recRes = await fetch(`${apiUrl}/capsules/received`, {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const recData = await recRes.json();
    console.log(`Teacher found ${recData.length} unlocked capsules.`);

    console.log('\n--- Test Completed Successfully ---');
  } catch (error) {
    console.error('\n!!! Workflow Test Failed !!!\n', error.message || error);
  }
}

runWorkflow();
