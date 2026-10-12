// scripts/test-alertas.mjs
const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('Testing /api/alertas...');

  // Login as agricultor
  const resLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'agricultor@kulimatech.mz',
      password: 'Agricultor123',
    }),
  });
  const dataLogin = await resLogin.json();
  console.log('Login status:', resLogin.status);
  const token = dataLogin?.data?.token;

  if (!token) {
    console.error('No token returned:', dataLogin);
    return;
  }

  // GET /api/alertas
  const resAlertas = await fetch(`${BASE_URL}/api/alertas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('GET /api/alertas status:', resAlertas.status);
  const dataAlertas = await resAlertas.json();
  console.log('GET /api/alertas response:', JSON.stringify(dataAlertas, null, 2));

  // GET /api/alertas?lido=false
  const resAlertasUnread = await fetch(`${BASE_URL}/api/alertas?lido=false`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('GET /api/alertas?lido=false status:', resAlertasUnread.status);
  const dataAlertasUnread = await resAlertasUnread.json();
  console.log('GET /api/alertas?lido=false response:', JSON.stringify(dataAlertasUnread, null, 2));

  // Test tecnico as well
  const resTecLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tecnico@kulimatech.mz',
      password: 'Tecnico123',
    }),
  });
  const tecData = await resTecLogin.json();
  const tecToken = tecData?.data?.token;
  const resTecAlertas = await fetch(`${BASE_URL}/api/alertas`, {
    headers: { Authorization: `Bearer ${tecToken}` },
  });
  console.log('GET /api/alertas (Tecnico) status:', resTecAlertas.status);
  const tecAlertasData = await resTecAlertas.json();
  console.log('GET /api/alertas (Tecnico) count:', tecAlertasData?.data?.alertas?.length);
}

main().catch(console.error);
