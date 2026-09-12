const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// List of directories to create
const directories = [
  // App routes - (auth)
  path.join(SRC_DIR, 'app', '(auth)', 'login'),
  path.join(SRC_DIR, 'app', '(auth)', 'registo'),
  path.join(SRC_DIR, 'app', '(auth)', 'recuperar-senha'),

  // App routes - (dashboard)
  path.join(SRC_DIR, 'app', '(dashboard)', 'dashboard'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'utilizadores', '[id]'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'parcelas', 'novo'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'parcelas', '[id]'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'leituras', 'nova'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'leituras', 'historico'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'culturas', 'recomendacoes'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'pragas', 'ocorrencias'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'mensagens', 'alertas'),

  // Features
  path.join(SRC_DIR, 'features', 'auth', 'components'),
  path.join(SRC_DIR, 'features', 'auth', 'hooks'),
  path.join(SRC_DIR, 'features', 'auth', 'services'),
  path.join(SRC_DIR, 'features', 'auth', 'schemas'),

  path.join(SRC_DIR, 'features', 'users', 'components'),
  path.join(SRC_DIR, 'features', 'users', 'hooks'),
  path.join(SRC_DIR, 'features', 'users', 'services'),

  path.join(SRC_DIR, 'features', 'parcelas', 'components'),
  path.join(SRC_DIR, 'features', 'parcelas', 'hooks'),
  path.join(SRC_DIR, 'features', 'parcelas', 'services'),

  path.join(SRC_DIR, 'features', 'leituras', 'components'),
  path.join(SRC_DIR, 'features', 'leituras', 'hooks'),
  path.join(SRC_DIR, 'features', 'leituras', 'services'),

  path.join(SRC_DIR, 'features', 'culturas', 'components'),
  path.join(SRC_DIR, 'features', 'culturas', 'hooks'),
  path.join(SRC_DIR, 'features', 'culturas', 'services'),

  path.join(SRC_DIR, 'features', 'pragas', 'components'),
  path.join(SRC_DIR, 'features', 'pragas', 'hooks'),
  path.join(SRC_DIR, 'features', 'pragas', 'services'),

  path.join(SRC_DIR, 'features', 'comunicacao', 'components'),
  path.join(SRC_DIR, 'features', 'comunicacao', 'hooks'),
  path.join(SRC_DIR, 'features', 'comunicacao', 'services'),

  // Lib infrastructure
  path.join(SRC_DIR, 'lib', 'api'),
  path.join(SRC_DIR, 'lib', 'auth'),
  path.join(SRC_DIR, 'lib', 'rbac'),

  // Types & Utils
  path.join(SRC_DIR, 'types'),
  path.join(SRC_DIR, 'utils'),
];

// List of empty files to create (if not already existing)
const emptyFiles = [
  // App routes - (auth)
  path.join(SRC_DIR, 'app', '(auth)', 'login', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(auth)', 'registo', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(auth)', 'recuperar-senha', 'page.tsx'),

  // App routes - (dashboard)
  path.join(SRC_DIR, 'app', '(dashboard)', 'utilizadores', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'utilizadores', '[id]', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'parcelas', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'parcelas', 'novo', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'parcelas', '[id]', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'leituras', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'leituras', 'nova', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'leituras', 'historico', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'culturas', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'culturas', 'recomendacoes', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'pragas', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'pragas', 'ocorrencias', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'mensagens', 'page.tsx'),
  path.join(SRC_DIR, 'app', '(dashboard)', 'mensagens', 'alertas', 'page.tsx'),

  // Feature types
  path.join(SRC_DIR, 'features', 'auth', 'types.ts'),
  path.join(SRC_DIR, 'features', 'users', 'types.ts'),
  path.join(SRC_DIR, 'features', 'parcelas', 'types.ts'),
  path.join(SRC_DIR, 'features', 'leituras', 'types.ts'),
  path.join(SRC_DIR, 'features', 'culturas', 'types.ts'),
  path.join(SRC_DIR, 'features', 'pragas', 'types.ts'),
  path.join(SRC_DIR, 'features', 'comunicacao', 'types.ts'),

  // Lib infrastructure
  path.join(SRC_DIR, 'lib', 'api', 'client.ts'),
  path.join(SRC_DIR, 'lib', 'api', 'endpoints.ts'),
  path.join(SRC_DIR, 'lib', 'auth', 'jwt.ts'),
  path.join(SRC_DIR, 'lib', 'auth', 'session.ts'),
  path.join(SRC_DIR, 'lib', 'rbac', 'permissions.ts'),

  // Global types & middleware
  path.join(SRC_DIR, 'types', 'roles.ts'),
  path.join(SRC_DIR, 'middleware.ts'),
];

console.log('🚀 Iniciando organização do projeto...');

// 1. Create directories
for (const dir of directories) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[DIR] Criado: ${path.relative(ROOT_DIR, dir)}`);
    // Ensure git tracks empty feature folders
    const gitkeep = path.join(dir, '.gitkeep');
    if (!fs.existsSync(gitkeep) && dir.includes('features')) {
      fs.writeFileSync(gitkeep, '');
    }
  }
}

// 2. Move existing dashboard to (dashboard)/dashboard if needed
const oldDashboardPage = path.join(SRC_DIR, 'app', 'dashboard', 'page.tsx');
const newDashboardDir = path.join(SRC_DIR, 'app', '(dashboard)', 'dashboard');
const newDashboardPage = path.join(newDashboardDir, 'page.tsx');

if (fs.existsSync(oldDashboardPage) && !fs.existsSync(newDashboardPage)) {
  fs.mkdirSync(newDashboardDir, { recursive: true });
  fs.renameSync(oldDashboardPage, newDashboardPage);
  console.log(`[MOVE] Movido com sucesso: src/app/dashboard/page.tsx -> src/app/(dashboard)/dashboard/page.tsx`);

  // Remove old folder if empty
  const oldDashboardDir = path.join(SRC_DIR, 'app', 'dashboard');
  try {
    const remainingFiles = fs.readdirSync(oldDashboardDir);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(oldDashboardDir);
      console.log(`[CLEANUP] Pasta antiga removida: src/app/dashboard`);
    }
  } catch (err) {
    // ignore
  }
}

// 3. Create empty files (leaving existing ones completely untouched)
for (const file of emptyFiles) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '', 'utf8');
    console.log(`[FILE] Criado (vazio): ${path.relative(ROOT_DIR, file)}`);
  } else {
    console.log(`[SKIP] Arquivo já existe, mantido intacto: ${path.relative(ROOT_DIR, file)}`);
  }
}

console.log('\n✅ Estrutura criada e organizada com sucesso!');
