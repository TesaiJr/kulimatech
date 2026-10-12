# Plano Detalhado de Implementação — Fase 1

## Informações do Documento
* Módulo: Infraestrutura e Modelo de Dados Relacional
* Projeto: KulimaTech (SDAE Nhamatanda / UniZambeze)
* Alvo: Fase 1 do Plano Geral de Engenharia (doc/plano.md)
* Pilha Tecnológica: Prisma ORM 7.x, PostgreSQL (Supabase), TypeScript, Next.js
* Versão: 1.0.0
* Data de Elaboração: Outubro de 2026

---

## 1. Escopo e Objetivos da Fase 1

O objetivo desta fase é ajustar e homologar o modelo de dados em `prisma/schema.prisma` e aplicá-lo ao banco de dados PostgreSQL hospedado no Supabase. Essas alterações são o alicerce indispensável para desbloquear os requisitos funcionais das fases subsequentes:
* RF04 e RF05: Deteção de anomalias e validação técnica de humidade do solo por técnicos do SDAE.
* RF09: Consulta ao catálogo de pragas com filtro por cultura associada.
* RF10 e RF11: Reporte de ocorrências fitossanitárias e resolução técnica com parecer de campo.
* RF14: Governança de utilizadores e atribuição de carteiras técnicas.

Ao concluir esta fase, o banco de dados e os tipos gerados do Prisma Client estarão 100% preparados para suportar a lógica das APIs e telas.

---

## 2. Diagnóstico das Entidades a Modificar

### 2.1 Modelo `LeituraSolo`
* Estado Atual:
  - Possui `id`, `parcelaId`, `humidade`, `temperatura`, `statusHumidade`, `observacoes`, `dataLeitura`, `createdAt`.
* Deficiência:
  - Não possui indicador de validação técnica agronómica nem registo do técnico responsável pela homologação da leitura (exigido por RF05).
* Alterações Requeridas:
  - Adicionar `validadoPorTecnico` (Boolean, default false).
  - Adicionar `tecnicoValidadorId` (String opcional, chave estrangeira para `User`).
  - Adicionar `dataValidacao` (DateTime opcional).
  - Adicionar `observacoesTecnicas` (String opcional).
  - Adicionar relação formal com `User` (`tecnicoValidador`).
  - Criar índice composto para consultas rápidas de pendências de validação.

### 2.2 Modelo `Praga`
* Estado Atual:
  - Possui `id`, `nome`, `nomeCientifico`, `descricao`, `sintomas`, `metodosCombate`, `severidadePadrao`, `createdAt`, `updatedAt`.
* Deficiência:
  - Não possui vínculo relacional com `Cultura`. Na monografia e no RF09, o catálogo de pragas deve permitir filtrar pragas pela cultura afetada (ex: Milho -> Lagarta do Funil).
* Alterações Requeridas:
  - Adicionar `culturaId` (String opcional, chave estrangeira para `Cultura`, onDelete: SetNull).
  - Adicionar relação com o modelo `Cultura`.
  - Criar índice para o campo `culturaId`.

### 2.3 Modelo `Cultura`
* Estado Atual:
  - Possui apenas a relação reversa `recomendacoes Recomendacao[]`.
* Alterações Requeridas:
  - Adicionar a relação reversa `pragas Praga[]` para possibilitar consultas bidirecionais (ex: consultar cultura e trazer suas pragas comuns).

### 2.4 Modelo `OcorrenciaPraga`
* Estado Atual:
  - Possui `id`, `parcelaId`, `pragaId`, `agricultorId`, `descricao`, `severidade`, `status`, `fotoUrl`, `dataReporte`, `parecerTecnico`, `createdAt`, `updatedAt`.
* Deficiência:
  - Não identifica formalmente qual o técnico que resolveu a ocorrência nem a data de encerramento do caso.
* Alterações Requeridas:
  - Adicionar `acaoRecomendada` (String opcional, para detalhar medidas corretivas recomendadas).
  - Adicionar `tecnicoResolutorId` (String opcional, chave estrangeira para `User`).
  - Adicionar `dataResolucao` (DateTime opcional).
  - Adicionar relação formal com `User` (`tecnicoResolutor`).

### 2.5 Modelo `User`
* Estado Atual:
  - Possui relações para parcelas, recomendações, mensagens, alertas e vínculos com agricultores.
* Alterações Requeridas:
  - Adicionar relação reversa `leiturasValidadas LeituraSolo[] @relation("TecnicoValidador")`.
  - Adicionar relação reversa `ocorrenciasResolvidas OcorrenciaPraga[] @relation("TecnicoResolutor")`.

---

## 3. Especificação do Código Prisma (Antes e Depois)

### 3.1 Modelo `User`
```prisma
// Adições no modelo User em prisma/schema.prisma
model User {
  // ... campos existentes inalterados ...

  // Relacionamentos operacionais existentes:
  parcelas              Parcela[]
  recomendacoesEmitidas Recomendacao[]    @relation("TecnicoRecomendacao")
  ocorrenciasReportadas OcorrenciaPraga[] @relation("AgricultorOcorrencia")
  mensagensEnviadas     Mensagem[]        @relation("RemetenteMensagem")
  mensagensRecebidas    Mensagem[]        @relation("DestinatarioMensagem")
  alertas               Alerta[]

  // Associacoes Tecnico <-> Agricultores acompanhados
  agricultoresAcompanhados TecnicoAgricultor[] @relation("TecnicoVinculo")
  tecnicosResponsaveis     TecnicoAgricultor[] @relation("AgricultorVinculo")

  // NOVOS RELACIONAMENTOS (Fase 1):
  leiturasValidadas    LeituraSolo[]     @relation("TecnicoValidador")
  ocorrenciasResolvidas OcorrenciaPraga[] @relation("TecnicoResolutor")

  @@index([email])
  @@index([role, status])
}
```

### 3.2 Modelo `LeituraSolo`
```prisma
model LeituraSolo {
  id                  String    @id @default(cuid())
  parcelaId           String
  parcela             Parcela   @relation(fields: [parcelaId], references: [id], onDelete: Cascade)
  humidade            Float     // Valor medido em percentual (0 a 100)
  temperatura         Float?    // Temperatura medida (opcional)
  statusHumidade      String?   // "CRITICA", "BAIXA", "OPTIMA", "EXCESSIVA"
  observacoes         String?
  dataLeitura         DateTime  @default(now())
  
  // NOVOS CAMPOS DE VALIDACAO TECNICA (RF05):
  validadoPorTecnico  Boolean   @default(false)
  tecnicoValidadorId  String?
  tecnicoValidador    User?     @relation("TecnicoValidador", fields: [tecnicoValidadorId], references: [id], onDelete: SetNull)
  dataValidacao       DateTime?
  observacoesTecnicas String?

  createdAt           DateTime  @default(now())

  @@index([parcelaId, dataLeitura])
  @@index([validadoPorTecnico])
  @@index([tecnicoValidadorId])
}
```

### 3.3 Modelo `Cultura`
```prisma
model Cultura {
  id             String         @id @default(cuid())
  nome           String         @unique
  nomeCientifico String?
  descricao      String
  humidadeMin    Float
  humidadeMax    Float
  cicloDias      Int?
  epocaPlantio   String?
  cuidados       String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  recomendacoes  Recomendacao[]
  // NOVO RELACIONAMENTO (Fase 1):
  pragas         Praga[]
}
```

### 3.4 Modelo `Praga`
```prisma
model Praga {
  id               String          @id @default(cuid())
  nome             String          @unique
  nomeCientifico   String?
  descricao        String
  sintomas         String
  metodosCombate   String
  severidadePadrao SeveridadePraga @default(MEDIA)
  
  // NOVO VINCULO COM CULTURA (RF09):
  culturaId        String?
  cultura          Cultura?        @relation(fields: [culturaId], references: [id], onDelete: SetNull)

  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  ocorrencias      OcorrenciaPraga[]

  @@index([culturaId])
}
```

### 3.5 Modelo `OcorrenciaPraga`
```prisma
model OcorrenciaPraga {
  id                 String           @id @default(cuid())
  parcelaId          String
  parcela            Parcela          @relation(fields: [parcelaId], references: [id], onDelete: Cascade)
  pragaId            String?
  praga              Praga?           @relation(fields: [pragaId], references: [id], onDelete: SetNull)
  agricultorId       String
  agricultor         User             @relation("AgricultorOcorrencia", fields: [agricultorId], references: [id], onDelete: Cascade)
  descricao          String
  severidade         SeveridadePraga  @default(MEDIA)
  status             StatusOcorrencia @default(ABERTA)
  fotoUrl            String?
  dataReporte        DateTime         @default(now())
  
  // CAMPOS DE RESOLUCAO E PARECER TECNICO (RF11):
  parecerTecnico     String?
  acaoRecomendada    String?
  tecnicoResolutorId String?
  tecnicoResolutor   User?            @relation("TecnicoResolutor", fields: [tecnicoResolutorId], references: [id], onDelete: SetNull)
  dataResolucao      DateTime?

  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  @@index([parcelaId])
  @@index([agricultorId])
  @@index([status])
  @@index([tecnicoResolutorId])
}
```

---

## 4. Passo a Passo Sequencial de Execução

### Passo 1: Atualização do Ficheiro de Esquema
1. Abrir `prisma/schema.prisma`.
2. Aplicar as adições descritas na Seção 3.
3. Verificar a sintaxe e integridade referencial com o utilitário do Prisma:
   ```bash
   npx prisma validate
   ```

### Passo 2: Sincronização com o PostgreSQL (Supabase)
1. Aplicar a atualização na base de dados de desenvolvimento/produção:
   ```bash
   npx prisma db push
   ```
2. Garantir que a sincronização executa com sucesso sem exigir perda de dados existentes (todas as novas colunas são opcionais ou possuem valor default).

### Passo 3: Geração dos Artefatos Tipados do Prisma Client
1. Executar a compilação do cliente do Prisma:
   ```bash
   npx prisma generate
   ```
2. Confirmar a criação dos novos tipos dentro de `node_modules/@prisma/client`.

### Passo 4: Atualização dos Tipos Centrais TypeScript da Aplicação
1. Atualizar `src/features/leituras/types.ts`:
   * Adicionar campos de validação: `validadoPorTecnico`, `tecnicoValidadorId`, `dataValidacao`, `observacoesTecnicas`.
   * Adicionar tipo DTO para o payload de validação: `ValidarLeituraDTO`.
2. Atualizar `src/features/pragas/types.ts`:
   * Adicionar campo `culturaId` e objeto aninhado opcional `cultura`.
   * Adicionar campos de resolução em `OcorrenciaPragaDTO`: `acaoRecomendada`, `dataResolucao`, `tecnicoResolutorId`.
   * Adicionar tipo DTO para o payload de resolução: `ResolverOcorrenciaDTO`.

### Passo 5: Atualização e Criação dos Schemas Zod de Validação
1. Criar ou atualizar `src/features/leituras/schemas/leituraSchemas.ts`:
   * Esquema de registo de leitura (`createLeituraSchema`).
   * Esquema de validação técnica (`validarLeituraSchema`).
2. Criar ou atualizar `src/features/pragas/schemas/pragaSchemas.ts`:
   * Esquema de criação de praga (`createPragaSchema`) com suporte a `culturaId`.
   * Esquema de reporte de ocorrência (`createOcorrenciaSchema`).
   * Esquema de resolução de ocorrência (`resolverOcorrenciaSchema`).

### Passo 6: Criação do Script de Validação da Fase 1
1. Criar o ficheiro de teste automatizado `scripts/verify-fase1-schema.mjs`:
   * Conectar via `@prisma/adapter-pg`.
   * Inserir e consultar registos de teste utilizando os novos campos.
   * Assegurar que consultas filtradas por `validadoPorTecnico` e `culturaId` executam sem erros.
   * Limpar os dados de teste ao final do script.
2. Executar o script:
   ```bash
   node scripts/verify-fase1-schema.mjs
   ```

### Passo 7: Verificação Estática de Tipagem (Typecheck)
1. Executar o verificador estático do TypeScript no projeto:
   ```bash
   npx tsc --noEmit
   ```
2. Resolver qualquer eventual incompatibilidade de tipos introduzida nas interfaces.

---

## 5. Matriz de Ficheiros Impactados

| Caminho do Ficheiro | Natureza | Ação a Realizar |
| :--- | :--- | :--- |
| `prisma/schema.prisma` | Banco de Dados | Inclusão de campos, relações e índices |
| `src/features/leituras/types.ts` | Frontend/Backend | Tipagem completa de Leitura e Validação |
| `src/features/pragas/types.ts` | Frontend/Backend | Tipagem completa de Pragas e Ocorrências |
| `src/features/leituras/schemas/leituraSchemas.ts` | Validação | Definição de esquemas Zod para validação |
| `src/features/pragas/schemas/pragaSchemas.ts` | Validação | Definição de esquemas Zod para pragas e ocorrências |
| `scripts/verify-fase1-schema.mjs` | Teste | Script de homologação automatizada da Fase 1 |

---

## 6. Critérios de Aceitação e Homologação

A Fase 1 será considerada homologada e concluída quando todos os itens abaixo forem satisfeitos:
1. Validação Sintática: O comando `npx prisma validate` retorna sucesso sem advertências.
2. Sincronização de Banco: O comando `npx prisma db push` atualiza o PostgreSQL no Supabase sem erros.
3. Geração de Tipos: O comando `npx prisma generate` compila o cliente tipado.
4. Integridade TypeScript: O comando `npx tsc --noEmit` executa com zero erros em todo o repositório.
5. Teste Funcional: O script `scripts/verify-fase1-schema.mjs` executa e valida a persistência e consulta dos novos campos.

---

## 7. Plano de Contingência e Reversão

* Risco: Falha de conexão com a porta do Supabase durante a execução do comando `prisma db push`.
  - Mitigação: O arquivo `prisma.config.ts` já contempla chave primária direta (`DIRECT_URL`) e conexão via pooler (`DATABASE_URL`). Em caso de timeout no pooler (porta 6543), o comando utilizará a porta direta (5432).
* Risco: Quebra de compatibilidade em dados já persistidos.
  - Mitigação: Nenhum campo obrigatório existente foi alterado ou removido. Todos os novos campos foram declarados como opcionais (`?`) ou receberam valores padrão (`@default(false)`), garantindo total retrocompatibilidade.
