// scripts/create-user.mjs
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient, UserRole, UserStatus, TipoSolo } = pkgPrisma;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  const email = 'ptivane73@gmail.com';
  const password = 'Password@2026';
  const nome = 'Paulo Tivane';
  const telefone = '+258 84 777 8899';
  const zonaAtuacao = 'Lamego - Nhamatanda';
  const role = UserRole.AGRICULTOR;

  console.log('===========================================================');
  console.log(' CRIANDO CONTA DE AGRICULTOR FAMILIAR VIA SCRIPT');
  console.log('===========================================================\n');
  console.log(`E-mail: ${email}`);
  console.log(`Palavra-passe: ${password}`);
  console.log(`Perfil: ${role}`);
  console.log(`Nome: ${nome}\n`);

  // 1. Criar / Atualizar no PostgreSQL via Prisma
  console.log('1. Gravando utilizador no PostgreSQL (Prisma)...');
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      nome,
      passwordHash,
      role,
      status: UserStatus.ATIVO,
      telefone,
      zonaAtuacao,
    },
    create: {
      nome,
      email,
      passwordHash,
      role,
      status: UserStatus.ATIVO,
      telefone,
      zonaAtuacao,
    },
  });
  console.log(`   [OK] Utilizador Prisma ID: ${user.id}`);

  // 2. Vincular Parcela de Teste para o Agricultor
  console.log('\n2. Criando Parcela Agrícola associada...');
  const parcela = await prisma.parcela.upsert({
    where: { id: `parc-ptivane-${user.id.slice(-6)}` },
    update: {
      agricultorId: user.id,
    },
    create: {
      id: `parc-ptivane-${user.id.slice(-6)}`,
      nome: 'Talhão Lamego — Culturas Mistas',
      areaHectares: 3.5,
      tipoSolo: TipoSolo.FRANCO,
      localizacao: 'Posto de Lamego, Nhamatanda',
      latitude: -19.2389,
      longitude: 34.2215,
      agricultorId: user.id,
    },
  });
  console.log(`   [OK] Parcela "${parcela.nome}" criada com sucesso.`);

  // 3. Criar / Atualizar no Supabase Auth (com e-mail confirmado)
  console.log('\n3. Sincronizando com o Supabase Auth...');
  if (supabaseUrl && supabaseServiceKey) {
    try {
      // Criar usuário via Supabase Admin API
      const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            nome,
            role: 'AGRICULTOR',
            telefone,
            zonaAtuacao,
          },
        }),
      });

      const data = await res.json();
      if (res.status === 200 || res.status === 201) {
        console.log('   [OK] Conta confirmada no Supabase Auth.');
      } else if (data.message?.includes('already registered') || data.msg?.includes('already registered')) {
        // Se já existe, atualizar a senha e confirmar
        console.log('   [INFO] Conta já existia no Supabase. Atualizando senha e confirmação...');
        // Buscar usuário para pegar o id
        const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
        });
        const listData = await listRes.json();
        const existing = listData.users?.find((u) => u.email === email);
        if (existing?.id) {
          await fetch(`${supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
            method: 'PUT',
            headers: {
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              password,
              email_confirm: true,
            }),
          });
          console.log('   [OK] Conta existente atualizada com sucesso no Supabase.');
        }
      } else {
        console.log('   [INFO] Resposta Supabase:', data);
      }
    } catch (sbErr) {
      console.warn('   [AVISO] Erro na chamada do Supabase:', sbErr);
    }
  }

  console.log('\n===========================================================');
  console.log(' CONTA CRIADA E PRONTA PARA USO!');
  console.log('===========================================================');
  console.log(`URL de Acesso:  http://localhost:3000/auth`);
  console.log(`E-mail:         ${email}`);
  console.log(`Palavra-passe:  ${password}`);
  console.log(`Perfil:         Agricultor Familiar`);
  console.log('===========================================================\n');
}

main()
  .catch((e) => {
    console.error('Erro ao criar conta:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
