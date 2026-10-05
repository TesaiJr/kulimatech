// scripts/replace-kulimatech-kulimatech.js
import fs from 'fs';
import path from 'path';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.gemini',
  'dist',
  'build',
  '.system_generated',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.js',
  '.mjs',
  '.ts',
  '.tsx',
  '.json',
  '.md',
  '.html',
  '.css',
  '.prisma',
  '.txt',
  '.env',
  '.example',
]);

let totalReplacements = 0;
const modifiedFiles = [];

function replaceInText(content) {
  let modified = content;

  // 1. KulimaTech / KulimaTech -> KulimaTech
  modified = modified.replace(/KulimaTech/g, 'KulimaTech');
  modified = modified.replace(/KulimaTech/g, 'KulimaTech');
  modified = modified.replace(/KulimaTech/g, 'KulimaTech');
  modified = modified.replace(/KulimaTech/g, 'KulimaTech');

  // 2. KULIMATECH / KULIMATECH -> KULIMATECH
  modified = modified.replace(/KULIMATECH/g, 'KULIMATECH');
  modified = modified.replace(/KULIMATECH/g, 'KULIMATECH');

  // 3. kulimatech / kulimatech -> kulimatech
  modified = modified.replace(/kulimatech/g, 'kulimatech');
  modified = modified.replace(/kulimatech/g, 'kulimatech');

  return modified;
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Also include files like .env.example
      const isCandidate = ALLOWED_EXTENSIONS.has(ext) || entry.name.startsWith('.env');

      if (isCandidate) {
        try {
          const originalContent = fs.readFileSync(fullPath, 'utf8');
          const newContent = replaceInText(originalContent);

          if (originalContent !== newContent) {
            fs.writeFileSync(fullPath, newContent, 'utf8');
            modifiedFiles.push(fullPath);
            totalReplacements++;
          }
        } catch (err) {
          console.error(`Erro ao processar ficheiro ${fullPath}:`, err.message);
        }
      }
    }
  }
}

const rootDir = process.cwd();
console.log(`Iniciando substituição de KulimaTech/kulimatech por KulimaTech em: ${rootDir}\n`);

processDirectory(rootDir);

console.log('===========================================================');
console.log(` CONCLUÍDO: ${totalReplacements} ficheiros atualizados.`);
console.log('===========================================================');
for (const file of modifiedFiles) {
  console.log(` - ${path.relative(rootDir, file)}`);
}
