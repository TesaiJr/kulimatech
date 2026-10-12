// scripts/test-patch-alerta.mjs
const BASE_URL = 'http://localhost:3000';

async function main() {
  const resLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'agricultor@kulimatech.mz',
      password: 'Agricultor123',
    }),
  });
  const dataLogin = await resLogin.json();
  const token = dataLogin.data.token;

  // List alerts
  const resAlertas = await fetch(`${BASE_URL}/api/alertas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dataAlertas = await resAlertas.json();
  const alertId = dataAlertas.data.alertas[0]?.id;
  console.log('Testing alertId:', alertId);

  if (alertId) {
    const patchRes = await fetch(`${BASE_URL}/api/alertas/${alertId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lido: true }),
    });
    console.log('PATCH /api/alertas/[id] status:', patchRes.status);
    const patchData = await patchRes.json();
    console.log('PATCH response:', patchData);
  }

  // Test PATCH /api/alertas (all)
  const patchAllRes = await fetch(`${BASE_URL}/api/alertas`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  console.log('PATCH /api/alertas (all) status:', patchAllRes.status);
  const patchAllData = await patchAllRes.json();
  console.log('PATCH all response:', patchAllData);
}

main().catch(console.error);
