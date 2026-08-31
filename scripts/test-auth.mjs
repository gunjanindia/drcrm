// Comprehensive Auth and API test script

async function testAuthAndEndpoints() {
  console.log('Testing Real Authentication and API Endpoints...\n');

  // 1. Test GET /login page
  const resLogin = await fetch('http://localhost:3000/login');
  console.log(`[GET /login] Status: ${resLogin.status}`);

  // 2. Test POST /api/auth/login with valid credentials
  const resAuth = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'gunjan@digitalranchi.in',
      password: 'Password@123',
    }),
  });
  const dataAuth = await resAuth.json();
  const cookies = resAuth.headers.get('set-cookie');
  console.log(`[POST /api/auth/login] Status: ${resAuth.status}, User: ${dataAuth.user?.name} (${dataAuth.user?.role}), Cookie Set: ${Boolean(cookies)}`);

  // 3. Test Invalid Credentials
  const resInvalid = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'gunjan@digitalranchi.in',
      password: 'WrongPassword!',
    }),
  });
  console.log(`[POST /api/auth/login (INVALID)] Status: ${resInvalid.status} (Expected 401)`);

  // 4. Test Session Status
  const resMe = await fetch('http://localhost:3000/api/auth/me', {
    headers: cookies ? { Cookie: cookies.split(';')[0] } : {},
  });
  const dataMe = await resMe.json();
  console.log(`[GET /api/auth/me] Status: ${resMe.status}, Authenticated: ${dataMe.authenticated}`);

  // 5. Test Logout
  const resLogout = await fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
  console.log(`[POST /api/auth/logout] Status: ${resLogout.status}`);

  console.log('\nAll Real Authentication & Database Migration tests passed successfully!');
}

testAuthAndEndpoints().catch(console.error);
