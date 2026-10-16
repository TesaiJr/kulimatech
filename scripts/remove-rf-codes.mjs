#!/usr/bin/env node
/**
 * remove-rf-codes.mjs
 *
 * Procura e remove referências a requisitos (RF01, RF1, RF-01, RNF01, RNF2, ...)
 * no código-fonte do projeto.
 *
 * Uso:
 *   node scripts/remove-rf-codes.mjs            -> simulação (dry-run), não altera nada
 *   node scripts/remove-rf-codes.mjs --apply    -> aplica as alterações nos ficheiros
 *   node scripts/remove-rf-codes.mjs --root ./src --apply
 *
 * Pastas ignoradas: doc, node_modules, .next, .git, public, prisma/migrations, ...
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const rootIdx = args.indexOf('--root');
const ROOT = path.resolve(rootIdx !== -1 ? args[rootIdx + 1] : process.cwd());
const SELF = fileURLToPath(import.meta.url);

/** Nomes de pastas ignoradas em qualquer nível */
const IGNORE_DIRS = new Set([
  'doc',
  'docs',
  'node_modules',
  '.next',
  '.git',
  '.vercel',
  '.turbo',
  'dist',
  'build',
  'coverage',
  'public',
]);

/** Caminhos relativos (a partir da raiz) ignorados */
const IGNORE_PATHS = ['prisma/migrations'];

/** Ficheiros ignorados pelo nome */
const IGNORE_FILES = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'tsconfig.tsbuildinfo',
  'next-env.d.ts',
]);

/** Extensões analisadas */
const EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.md', '.mdx', '.css', '.scss',
  '.prisma', '.sql', '.txt', '.ps1', '.yml', '.yaml',
]);

// ---------------------------------------------------------------------------
// Expressões regulares
// ---------------------------------------------------------------------------

// RF1, RF01, RF-01, RNF1, RNF02, RNF_03 ...
const TOKEN = String.raw`(?:RNF|RF)[-_]?\d{1,3}`;
// Separadores entre códigos: "RF01, RF02", "RF01/RF02", "RF01 e RF02", "RF01-RF05"
const SEP = String.raw`(?:\s*[,/;&–—-]\s*|\s+(?:e|a|and|to)\s+)`;
// Um código ou uma lista de códigos
const GROUP = String.raw`\b${TOKEN}\b(?:${SEP}\b${TOKEN}\b)*`;

const DETECT = new RegExp(String.raw`\b${TOKEN}\b`);
// (RF01), [RF01, RF02] -> remove também o espaço antes
const WRAPPED = new RegExp(String.raw`[ \t]*[(\[]\s*${GROUP}\s*[)\]]`, 'g');
// RF01: texto | RF01 - texto | RF01 texto
const PLAIN = new RegExp(String.raw`${GROUP}(?:[ \t]*[:–—-]+[ \t]*|[ \t]+)?`, 'g');
// Linhas que ficaram apenas com marcadores de comentário vazios
const EMPTY_COMMENT =
  /^\s*(?:\/\/+|\*+|#+|\/\*+\s*\*+\/|\{\/\*\s*\*\/\}|<!--\s*-->)?\s*$/;

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = toPosix(path.relative(ROOT, full));

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      if (IGNORE_PATHS.some((p) => rel === p || rel.startsWith(p + '/'))) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      if (IGNORE_FILES.has(entry.name)) continue;
      if (path.resolve(full) === SELF) continue;
      if (!EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
      yield full;
    }
  }
}

function cleanLine(line) {
  let out = line.replace(WRAPPED, '').replace(PLAIN, '');
  out = out.replace(/[ \t]+([.,;])/g, '$1').replace(/[ \t]+$/, '');
  return out;
}

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------

let filesChanged = 0;
let occurrences = 0;
let linesRemoved = 0;

console.log(`Raiz: ${ROOT}`);
console.log(APPLY ? 'Modo: APLICAR alterações\n' : 'Modo: SIMULAÇÃO (use --apply para alterar)\n');

for (const file of walk(ROOT)) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (text.includes('\0') || !DETECT.test(text)) continue;

  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const result = [];
  const report = [];

  lines.forEach((line, i) => {
    if (!DETECT.test(line)) {
      result.push(line);
      return;
    }

    const count = (line.match(new RegExp(String.raw`\b${TOKEN}\b`, 'g')) || []).length;
    occurrences += count;

    const cleaned = cleanLine(line);

    if (EMPTY_COMMENT.test(cleaned)) {
      linesRemoved++;
      report.push(`  L${i + 1}: - ${line.trim()}\n         (linha removida)`);
      return;
    }

    report.push(`  L${i + 1}: - ${line.trim()}\n         + ${cleaned.trim()}`);
    result.push(cleaned);
  });

  if (report.length === 0) continue;

  filesChanged++;
  console.log(toPosix(path.relative(ROOT, file)));
  console.log(report.join('\n'));
  console.log('');

  if (APPLY) {
    fs.writeFileSync(file, result.join(eol), 'utf8');
  }
}

console.log('-----------------------------------------');
console.log(`Ficheiros ${APPLY ? 'alterados' : 'a alterar'}: ${filesChanged}`);
console.log(`Ocorrências encontradas: ${occurrences}`);
console.log(`Linhas removidas (comentários vazios): ${linesRemoved}`);
if (!APPLY && filesChanged > 0) {
  console.log('\nNada foi alterado. Reveja o resultado e execute com --apply.');
}
