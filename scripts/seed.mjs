// scripts/seed.mjs
// Povoamento inicial idempotente (upsert) para o Banco de Dados KulimaTech (SDAE Nhamatanda)
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient, UserRole, UserStatus, TipoSolo, SeveridadePraga } = pkgPrisma;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  console.log('===========================================================');
  console.log(' INICIANDO POVOAMENTO DE DADOS (SEED) - SISTEMA iMUNDA');
  console.log('===========================================================\n');

  // 1. Criar Administrador Padrao (admin@kulimatech.mz / Admin123)
  console.log('1. Criando Administrador Geral...');
  const saltRounds = 12;
  const adminPasswordHash = await bcrypt.hash('Admin123', saltRounds);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@kulimatech.mz' },
    update: {
      nome: 'Administrador do Sistema',
      role: UserRole.ADMIN,
      status: UserStatus.ATIVO,
    },
    create: {
      nome: 'Administrador do Sistema',
      email: 'admin@kulimatech.mz',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ATIVO,
      telefone: '+258840000000',
      zonaAtuacao: 'Sede Distrital de Nhamatanda',
    },
  });
  console.log(`   [OK] Administrador: ${admin.email} (ID: ${admin.id})`);

  // 2. Criar Tecnico do SDAE de Teste (tecnico@kulimatech.mz / Tecnico123)
  console.log('\n2. Criando Tecnico do SDAE de Teste...');
  const tecnicoPasswordHash = await bcrypt.hash('Tecnico123', saltRounds);

  const tecnico = await prisma.user.upsert({
    where: { email: 'tecnico@kulimatech.mz' },
    update: {
      nome: 'Tecnico Arnaldo (SDAE)',
      role: UserRole.TECNICO,
      status: UserStatus.ATIVO,
    },
    create: {
      nome: 'Tecnico Arnaldo (SDAE)',
      email: 'tecnico@kulimatech.mz',
      passwordHash: tecnicoPasswordHash,
      role: UserRole.TECNICO,
      status: UserStatus.ATIVO,
      telefone: '+258841112233',
      zonaAtuacao: 'Posto Administrativo de Tica / Lamego',
    },
  });
  console.log(`   [OK] Tecnico: ${tecnico.email} (ID: ${tecnico.id})`);

  // 3. Criar Agricultor de Teste (agricultor@kulimatech.mz / Agricultor123)
  console.log('\n3. Criando Agricultor de Teste...');
  const agricultorPasswordHash = await bcrypt.hash('Agricultor123', saltRounds);

  const agricultor = await prisma.user.upsert({
    where: { email: 'agricultor@kulimatech.mz' },
    update: {
      nome: 'Mateus Chimoio',
      role: UserRole.AGRICULTOR,
      status: UserStatus.ATIVO,
    },
    create: {
      nome: 'Mateus Fernando Tivane',
      email: 'agricultor@kulimatech.mz',
      passwordHash: agricultorPasswordHash,
      role: UserRole.AGRICULTOR,
      status: UserStatus.ATIVO,
      telefone: '+258847778899',
      zonaAtuacao: 'Comunidade de Metuchira - Nhamatanda',
    },
  });
  console.log(`   [OK] Agricultor: ${agricultor.email} (ID: ${agricultor.id})`);

  // 4. Vincular Tecnico ao Agricultor (TecnicoAgricultor)
  console.log('\n4. Vinculando Tecnico ao Agricultor...');
  await prisma.tecnicoAgricultor.upsert({
    where: {
      tecnicoId_agricultorId: {
        tecnicoId: tecnico.id,
        agricultorId: agricultor.id,
      },
    },
    update: {},
    create: {
      tecnicoId: tecnico.id,
      agricultorId: agricultor.id,
    },
  });
  console.log('   [OK] Vinculo estabelecido com sucesso.');

  // 5. Criar Parcela de Teste para o Agricultor
  console.log('\n5. Criando Parcela Piloto para o Agricultor...');
  const parcela = await prisma.parcela.upsert({
    where: { id: 'parcela-piloto-01' },
    update: {},
    create: {
      id: 'parcela-piloto-01',
      nome: 'Talhao das Mangueiras - Metuchira',
      areaHectares: 2.5,
      tipoSolo: TipoSolo.FRANCO,
      localizacao: 'Margem do Rio Metuchira, Nhamatanda',
      latitude: -19.2667,
      longitude: 34.2167,
      agricultorId: agricultor.id,
    },
  });
  console.log(`   [OK] Parcela: ${parcela.nome} (${parcela.areaHectares} ha)`);

  // 5.1 Criar Contas Demo KulimaTech para o Frontend
  console.log('\n5.1. Criando Contas Demo KulimaTech (Frontend)...');
  const adminKulimaHash = await bcrypt.hash('Admin@2026', saltRounds);
  const adminKulima = await prisma.user.upsert({
    where: { email: 'admin@kulimatech.gov.mz' },
    update: { passwordHash: adminKulimaHash, status: UserStatus.ATIVO },
    create: {
      nome: 'Alberto Nhantumbo (Admin)',
      email: 'admin@kulimatech.gov.mz',
      passwordHash: adminKulimaHash,
      role: UserRole.ADMIN,
      status: UserStatus.ATIVO,
      telefone: '+258840009999',
      zonaAtuacao: 'Distrito de Nhamatanda',
    },
  });

  const techKulimaHash = await bcrypt.hash('Tecnico@2026', saltRounds);
  const techKulima = await prisma.user.upsert({
    where: { email: 'tecnico.nhamatanda@sdae.gov.mz' },
    update: { passwordHash: techKulimaHash, status: UserStatus.ATIVO },
    create: {
      nome: 'Eng. António Langa',
      email: 'tecnico.nhamatanda@sdae.gov.mz',
      passwordHash: techKulimaHash,
      role: UserRole.TECNICO,
      status: UserStatus.ATIVO,
      telefone: '+258843334444',
      zonaAtuacao: 'Posto Agrário de Tica / Nhamatanda',
    },
  });

  const agriKulimaHash = await bcrypt.hash('Agri@2026', saltRounds);
  const agriKulima = await prisma.user.upsert({
    where: { email: 'agricultor.lamego@kulimatech.mz' },
    update: { passwordHash: agriKulimaHash, status: UserStatus.ATIVO },
    create: {
      nome: 'Mateus Cossa',
      email: 'agricultor.lamego@kulimatech.mz',
      passwordHash: agriKulimaHash,
      role: UserRole.AGRICULTOR,
      status: UserStatus.ATIVO,
      telefone: '+258841234567',
      zonaAtuacao: 'Posto de Lamego - Nhamatanda',
    },
  });

  // Vincular Tecnico ao Agricultor do KulimaTech
  await prisma.tecnicoAgricultor.upsert({
    where: {
      tecnicoId_agricultorId: {
        tecnicoId: techKulima.id,
        agricultorId: agriKulima.id,
      },
    },
    update: {},
    create: {
      tecnicoId: techKulima.id,
      agricultorId: agriKulima.id,
    },
  });

  // Parcela KulimaTech para Mateus Cossa
  await prisma.parcela.upsert({
    where: { id: 'parcela-lamego-01' },
    update: {
      agricultorId: agriKulima.id,
    },
    create: {
      id: 'parcela-lamego-01',
      nome: 'Parcela Lamego 1 — Tomate e Hortícolas',
      areaHectares: 2.5,
      tipoSolo: TipoSolo.FRANCO,
      localizacao: 'Posto de Lamego, Talhão Sul, Junto ao Canal',
      latitude: -19.2345,
      longitude: 34.2189,
      agricultorId: agriKulima.id,
    },
  });
  console.log(`   [OK] Contas KulimaTech criadas com sucesso.`);

  // 6. Catalogo de Culturas Prioritarias do SDAE Nhamatanda
  console.log('\n6. Povoando Catalogo de Culturas...');
  const culturas = [
    {
      nome: 'Milho (Zea mays)',
      nomeCientifico: 'Zea mays L.',
      descricao: 'Principal cereal cultivado no distrito de Nhamatanda para seguranca alimentar e comercializacao.',
      humidadeMin: 50.0,
      humidadeMax: 75.0,
      cicloDias: 120,
      epocaPlantio: 'Outubro a Dezembro (Epoca das chuvas)',
      cuidados: 'Monitorar humidade na fase de florescimento e controlar a Lagarta do Cartucho.',
    },
    {
      nome: 'Feijao Boer (Cajanus cajan)',
      nomeCientifico: 'Cajanus cajan (L.) Millsp.',
      descricao: 'Leguminosa rustica e tolerante a seca, fundamental para recuperacao da fertilidade do solo.',
      humidadeMin: 35.0,
      humidadeMax: 65.0,
      cicloDias: 180,
      epocaPlantio: 'Novembro a Janeiro',
      cuidados: 'Excelente para consorciacao com milho ou em faixas de protecao contra erosao.',
    },
    {
      nome: 'Feijao Nhemba (Vigna unguiculata)',
      nomeCientifico: 'Vigna unguiculata (L.) Walp.',
      descricao: 'Cultura de ciclo rapido, rica em proteinas, amplamente consumida na provincia de Sofala.',
      humidadeMin: 40.0,
      humidadeMax: 70.0,
      cicloDias: 75,
      epocaPlantio: 'Novembro a Janeiro / Segunda epoca em Fevereiro',
      cuidados: 'Exige boa drenagem para evitar apodrecimento radicular.',
    },
    {
      nome: 'Mandioca (Manihot esculenta)',
      nomeCientifico: 'Manihot esculenta Crantz',
      descricao: 'Cultura de raiz tuberosa com elevada tolerancia a estiagem e grande importancia de subsistencia.',
      humidadeMin: 30.0,
      humidadeMax: 60.0,
      cicloDias: 300,
      epocaPlantio: 'Outubro a Janeiro',
      cuidados: 'Utilizar estacas saudaveis e livres de virus do mosaico da mandioca.',
    },
    {
      nome: 'Gergelim (Sesamum indicum)',
      nomeCientifico: 'Sesamum indicum L.',
      descricao: 'Cultura de rendimento com alta demanda comercial para exportacao na regiao centro de Mocambique.',
      humidadeMin: 35.0,
      humidadeMax: 60.0,
      cicloDias: 100,
      epocaPlantio: 'Dezembro a Janeiro',
      cuidados: 'Sensivel ao excesso de agua; semear em solos bem drenados.',
    },
  ];

  for (const c of culturas) {
    await prisma.cultura.upsert({
      where: { nome: c.nome },
      update: c,
      create: c,
    });
    console.log(`   [OK] Cultura: ${c.nome}`);
  }

  // 7. Catalogo de Pragas Comuns de Nhamatanda
  console.log('\n7. Povoando Catalogo de Pragas...');
  const pragas = [
    {
      nome: 'Lagarta do Cartucho',
      nomeCientifico: 'Spodoptera frugiperda',
      descricao: 'Principal praga do milho, ataca as folhas jovens e o cartucho destruindo a planta antes da espigagem.',
      sintomas: 'Folhas perfuradas no interior do cartucho e presenca de excrementos humidos tipo serradura.',
      metodosCombate: 'Catar manual em pequenas parcelas; bioinseticidas a base de Bacillus thuringiensis ou inseticidas recomendados pelo SDAE.',
      severidadePadrao: SeveridadePraga.CRITICA,
    },
    {
      nome: 'Broca do Colmo',
      nomeCientifico: 'Busseola fusca',
      descricao: 'Lagartas que perfuram o caule do milho e sorgo, impedindo a circulacao de seiva.',
      sintomas: 'Furos no colmo com saida de serradura, secamento do ponteiro central da planta.',
      metodosCombate: 'Destruicao dos restos culturais apos a colheita e rotacao de culturas com leguminosas.',
      severidadePadrao: SeveridadePraga.ALTA,
    },
    {
      nome: 'Pulgao do Feijao',
      nomeCientifico: 'Aphis craccivora',
      descricao: 'Insetos sugadores que formam colonias densas nos brotos e vagens de leguminosas.',
      sintomas: 'Enrolamento das folhas novas, deformacao dos brotos e secrecao de liquido adocicado.',
      metodosCombate: 'Pulverizacao com solucao de cinza/sabao neutro ou produtos fitossanitarios orientados pelo SDAE.',
      severidadePadrao: SeveridadePraga.MEDIA,
    },
  ];

  for (const p of pragas) {
    await prisma.praga.upsert({
      where: { nome: p.nome },
      update: p,
      create: p,
    });
    console.log(`   [OK] Praga: ${p.nome}`);
  }

  console.log('\n===========================================================');
  console.log(' SEED CONCLUIDO COM SUCESSO! DADOS INICIAIS PRONTOS!');
  console.log('===========================================================\n');
}

main()
  .catch((e) => {
    console.error('\n✖ Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
