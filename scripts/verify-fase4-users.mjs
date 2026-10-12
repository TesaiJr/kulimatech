// scripts/verify-fase4-users.mjs
// Utiliza fetch nativo do Node.js v18+

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function logStep(title, fn) {
  process.stdout.write(`🔹 ${title}... `);
  try {
    const res = await fn();
    console.log(`✅ OK`);
    return res;
  } catch (err) {
    console.log(`❌ FALHOU`);
    console.error(`   Erro:`, err.message);
    throw err;
  }
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`🚀 TESTE DE HOMOLOGAÇÃO DA FASE 4 — UTILIZADORES E CARTEIRAS`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let adminToken = '';
  let adminId = '';
  let novoTecnicoId = '';
  let novoTecnicoToken = '';
  const testTecnicoEmail = `tecnico.fase4.${Date.now()}@kulimatech.mz`;
  let agricultorTestId = '';

  // 1. Login como Administrador
  await logStep('Autenticar como Administrador Central (admin@kulimatech.mz)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@kulimatech.mz',
        password: 'Admin123',
      }),
    });
    const body = await res.json();
    if (!res.ok || !body.data?.token) {
      throw new Error(body.error?.message || 'Falha no login do Administrador');
    }
    adminToken = body.data.token;
    adminId = body.data.user.id;
  });

  // 2. Listar utilizadores como Admin
  await logStep('Listar utilizadores via GET /api/users (ADMIN)', async () => {
    const res = await fetch(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await res.json();
    if (!res.ok || !Array.isArray(body.data)) {
      throw new Error(body.error?.message || 'Erro ao listar utilizadores');
    }
    const agricultor = body.data.find((u) => u.role === 'AGRICULTOR');
    if (agricultor) {
      agricultorTestId = agricultor.id;
    }
    if (body.data.length === 0) {
      throw new Error('Nenhum utilizador retornado na listagem');
    }
  });

  // 3. Cadastrar novo Técnico SDAE institucionalmente (POST /api/users)
  await logStep(`Criar novo Técnico SDAE institucional (${testTecnicoEmail})`, async () => {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        nome: 'Técnico de Campo Homologação',
        email: testTecnicoEmail,
        password: 'Tecnico123',
        role: 'TECNICO',
        status: 'ATIVO',
        telefone: '+258 84 999 8888',
        zonaAtuacao: 'Posto Administrativo de Tica',
      }),
    });
    const body = await res.json();
    if (!res.ok || !body.data?.id) {
      throw new Error(body.error?.message || 'Erro ao criar técnico');
    }
    novoTecnicoId = body.data.id;
  });

  // 4. Testar login imediato do novo Técnico
  await logStep('Efetuar login imediato com a nova conta de Técnico', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testTecnicoEmail,
        password: 'Tecnico123',
      }),
    });
    const body = await res.json();
    if (!res.ok || !body.data?.token) {
      throw new Error(body.error?.message || 'Falha ao logar com o novo técnico');
    }
    novoTecnicoToken = body.data.token;
  });

  // 5. Testar proteção RBAC: Técnico tentando criar utilizadores (deve falhar com 403)
  await logStep('Validar RBAC: Impedir Técnico de criar utilizadores (403 esperado)', async () => {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${novoTecnicoToken}`,
      },
      body: JSON.stringify({
        nome: 'Tentativa Ilegal',
        email: 'hacker@kulimatech.mz',
        password: 'Senha123',
        role: 'ADMIN',
      }),
    });
    if (res.status !== 403) {
      throw new Error(`Esperado status 403 Forbidden, obtido ${res.status}`);
    }
  });

  // 6. Consultar carteiras técnicas via GET /api/users/atribuicoes
  await logStep('Consultar carteiras técnicas e pendências (GET /api/users/atribuicoes)', async () => {
    const res = await fetch(`${BASE_URL}/api/users/atribuicoes`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await res.json();
    if (!res.ok || !body.data?.tecnicos) {
      throw new Error(body.error?.message || 'Falha ao carregar carteiras');
    }
  });

  // 7. Atribuir agricultor à carteira do novo Técnico
  if (agricultorTestId) {
    await logStep(`Atribuir agricultor à carteira do novo técnico (POST /api/users/atribuicoes)`, async () => {
      const res = await fetch(`${BASE_URL}/api/users/atribuicoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          tecnicoId: novoTecnicoId,
          agricultorIds: [agricultorTestId],
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || 'Falha ao atribuir agricultor');
      }
    });

    // 8. Como Técnico, listar utilizadores -> deve ver estritamente o agricultor atribuído
    await logStep('Verificar isolamento de carteira do Técnico (GET /api/users como TECNICO)', async () => {
      const res = await fetch(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${novoTecnicoToken}` },
      });
      const body = await res.json();
      if (!res.ok || !Array.isArray(body.data)) {
        throw new Error(body.error?.message || 'Erro ao listar como técnico');
      }
      const hasOnlyAssigned = body.data.every((u) => u.id === agricultorTestId);
      if (!hasOnlyAssigned) {
        throw new Error('Falha no isolamento: Técnico visualizou utilizadores fora da sua carteira!');
      }
    });
  }

  // 9. Prevenção de Auto-Bloqueio do Administrador
  await logStep('Testar prevenção de auto-bloqueio do Administrador logado (400 esperado)', async () => {
    const res = await fetch(`${BASE_URL}/api/users/${adminId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'BLOQUEADO',
      }),
    });
    if (res.status !== 400) {
      throw new Error(`Esperado status 400 Bad Request ao tentar auto-bloqueio, obtido ${res.status}`);
    }
  });

  // 10. Bloquear conta do novo Técnico (PATCH /api/users/[id])
  await logStep('Bloquear conta do Técnico pelo Administrador', async () => {
    const res = await fetch(`${BASE_URL}/api/users/${novoTecnicoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'BLOQUEADO',
      }),
    });
    const body = await res.json();
    if (!res.ok || body.data?.status !== 'BLOQUEADO') {
      throw new Error(body.error?.message || 'Falha ao bloquear conta');
    }
  });

  // 11. Testar se login do Técnico bloqueado é rejeitado com 403
  await logStep('Verificar rejeição de login para conta bloqueada (403 esperado)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testTecnicoEmail,
        password: 'Tecnico123',
      }),
    });
    if (res.status !== 403) {
      throw new Error(`Esperado status 403 Forbidden para conta bloqueada, obtido ${res.status}`);
    }
  });

  // 12. Reativar Técnico
  await logStep('Reativar conta do Técnico para status ATIVO', async () => {
    const res = await fetch(`${BASE_URL}/api/users/${novoTecnicoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'ATIVO',
      }),
    });
    const body = await res.json();
    if (!res.ok || body.data?.status !== 'ATIVO') {
      throw new Error(body.error?.message || 'Falha ao reativar conta');
    }
  });

  // 13. Testar desvinculação da carteira (DELETE /api/users/atribuicoes)
  if (agricultorTestId) {
    await logStep('Remover agricultor da carteira técnica (DELETE /api/users/atribuicoes)', async () => {
      const res = await fetch(
        `${BASE_URL}/api/users/atribuicoes?tecnicoId=${novoTecnicoId}&agricultorId=${agricultorTestId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || 'Falha ao remover vínculo');
      }
    });
  }

  console.log(`\n======================================================`);
  console.log(`🎉 TODOS OS TESTES DA FASE 4 FORAM HOMOLOGADOS COM SUCESSO (100%)!`);
  console.log(`======================================================\n`);
}

run().catch((err) => {
  console.error('\n❌ Erro durante a execução dos testes:', err);
  process.exit(1);
});
