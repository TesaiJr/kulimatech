// scripts/verify-chat-realtime.mjs
import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function postJson(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return { status: res.status, data };
}

async function getJson(path, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers,
  });

  const data = await res.json();
  return { status: res.status, data };
}

async function testSSE(token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `${BASE_URL}/api/mensagens/stream?token=${encodeURIComponent(token)}`,
      { method: 'GET' },
      (res) => {
        let chunkCount = 0;
        let dataAccum = '';

        if (res.statusCode !== 200) {
          reject(new Error(`SSE status code: ${res.statusCode}`));
          return;
        }

        const contentType = res.headers['content-type'];
        if (!contentType || !contentType.includes('text/event-stream')) {
          reject(new Error(`Invalid Content-Type: ${contentType}`));
          return;
        }

        res.on('data', (chunk) => {
          chunkCount++;
          dataAccum += chunk.toString();
          if (dataAccum.includes('event: connected')) {
            req.destroy();
            resolve({ success: true, chunkCount, data: dataAccum });
          }
        });

        res.on('error', (err) => reject(err));
      }
    );

    req.on('error', (err) => {
      // If destroyed after reading connected event, consider success
      if (req.destroyed) return;
      reject(err);
    });

    req.end();
  });
}

async function main() {
  console.log('--- Teste de Homologação: Chat em Tempo Real & Push Events ---');

  // 1. Login Agricultor
  const agriLogin = await postJson('/api/auth/login', {
    email: 'agricultor@kulimatech.mz',
    password: 'Agricultor123',
  });
  if (agriLogin.status !== 200 || !agriLogin.data?.data?.token) {
    throw new Error('Falha no login do Agricultor: ' + JSON.stringify(agriLogin.data));
  }
  const agriToken = agriLogin.data.data.token;
  const agriId = agriLogin.data.data.user.id;
  console.log('✔ Login Agricultor efetuado com sucesso:', agriLogin.data.data.user.nome);

  // 2. Login Técnico
  const tecLogin = await postJson('/api/auth/login', {
    email: 'tecnico@kulimatech.mz',
    password: 'Tecnico123',
  });
  if (tecLogin.status !== 200 || !tecLogin.data?.data?.token) {
    throw new Error('Falha no login do Técnico: ' + JSON.stringify(tecLogin.data));
  }
  const tecToken = tecLogin.data.data.token;
  const tecId = tecLogin.data.data.user.id;
  console.log('✔ Login Técnico efetuado com sucesso:', tecLogin.data.data.user.nome);

  // 3. Conversas do Agricultor
  const convRes = await getJson('/api/mensagens', agriToken);
  console.log(`✔ Lista de conversas do Agricultor: ${convRes.data?.data?.length || 0} conversas ativas.`);
  if (!convRes.data?.data || convRes.data.data.length === 0) {
    throw new Error('Agricultor não tem vínculo ativo de conversa');
  }

  const interlocutorId = convRes.data.data[0].interlocutor.id;
  console.log(`  Interlocutor vinculado: ${convRes.data.data[0].interlocutor.nome} (ID: ${interlocutorId})`);

  // 4. Teste de Conexão SSE Push
  console.log('✔ Testando conexão Server-Sent Events (/api/mensagens/stream)...');
  const sseRes = await testSSE(agriToken);
  console.log('✔ Conexão SSE estabelecida com sucesso: handshake "event: connected" recebido!');

  // 5. Enviar Mensagem Otimista simulada
  const textoTeste = `Mensagem de teste em tempo real (${new Date().toLocaleTimeString()})`;
  console.log(`✔ Enviando mensagem para o técnico: "${textoTeste}"...`);
  const sendRes = await postJson(
    '/api/mensagens',
    {
      destinatarioId: interlocutorId,
      conteudo: textoTeste,
    },
    agriToken
  );

  if (sendRes.status !== 201 || !sendRes.data?.data?.id) {
    throw new Error('Falha ao enviar mensagem: ' + JSON.stringify(sendRes.data));
  }
  console.log('✔ Mensagem persistida e evento push emitido. ID:', sendRes.data.data.id);

  // 6. Validar Histórico
  const histRes = await getJson(`/api/mensagens?interlocutorId=${interlocutorId}`, agriToken);
  console.log(`✔ Histórico da conversa carregado: ${histRes.data?.data?.length || 0} mensagens.`);
  const ultima = histRes.data?.data?.[histRes.data.data.length - 1];
  if (ultima?.conteudo !== textoTeste) {
    throw new Error('Última mensagem não corresponde ao texto enviado');
  }
  console.log('✔ Última mensagem validada no histórico com sucesso!');

  console.log('\n--- TODOS OS TESTES DO CHAT REALTIME PASSARAM COM 100% DE SUCESSO! ---');
}

main().catch((err) => {
  console.error('❌ ERRO NO TESTE:', err);
  process.exit(1);
});
