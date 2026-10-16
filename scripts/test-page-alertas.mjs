// scripts/test-page-alertas.mjs
async function test() {
  const res = await fetch('http://localhost:3000/mensagens/alertas');
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Length:', text.length);
  if (text.includes('Error') || text.includes('error')) {
    console.log('Contains error snippet:');
    const idx = text.indexOf('error');
    console.log(text.substring(Math.max(0, idx - 100), Math.min(text.length, idx + 200)));
  }
  console.log('Preview first 400 chars:');
  console.log(text.substring(0, 400));
}
test().catch(console.error);
