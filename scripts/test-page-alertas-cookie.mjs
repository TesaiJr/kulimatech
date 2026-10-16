// scripts/test-page-alertas-cookie.mjs
const BASE_URL = 'http://localhost:3000';

async function test() {
  const resLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'agricultor@kulimatech.mz',
      password: 'Agricultor123',
    }),
  });
  const cookie = resLogin.headers.get('set-cookie');
  console.log('Got cookie:', Boolean(cookie));

  const resPage = await fetch(`${BASE_URL}/mensagens/alertas`, {
    headers: {
      Cookie: cookie || '',
    },
  });
  console.log('Status /mensagens/alertas with cookie:', resPage.status);
  const html = await resPage.text();
  console.log('HTML length:', html.length);
  console.log('Contains "Painel de Alertas & Notificações":', html.includes('Painel de Alertas & Notificações'));
  console.log('Contains "A sincronizar alertas":', html.includes('A sincronizar alertas'));
  console.log('Contains "Leitura de Solo Validada":', html.includes('Leitura de Solo Validada'));
}

test().catch(console.error);
