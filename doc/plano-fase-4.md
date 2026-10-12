# Plano Detalhado de Implementação — Fase 4

## Informações do Documento
* Módulo: Administração de Utilizadores e Carteiras Técnicas
* Requisitos Atendidos: RF14 (gestão administrativa de contas e vínculos Técnico ↔ Agricultor), RF01 (RBAC / estado de conta)
* Projeto: KulimaTech (SDAE Nhamatanda / UniZambeze)
* Alvo: Fase 4 do Plano Geral de Engenharia (`doc/plano.md`)
* Pilha Tecnológica: Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma ORM 7.x, PostgreSQL (Supabase), Zod, bcryptjs, Lucide React
* Versão: 1.0.0
* Data de Elaboração: Outubro de 2026
* Estado: **Aguarda aprovação**

---

## 1. Escopo e Objetivos da Fase 4

A **Fase 4** dá ao Administrador o controlo sobre quem acede ao sistema e sobre a estrutura de supervisão técnica. Sem vínculos `TecnicoAgricultor`, o chat, a validação de leituras (RF05) e a resolução de ocorrências (RF11) não funcionam para novos utilizadores — hoje esses vínculos só existem via `npm run db:seed`.

### Objetivos Centrais
1. **Criação de contas pelo Administrador:** registar Técnicos SDAE (e outros Administradores) com senha inicial em hash bcrypt.
2. **Gestão de estado de contas:** ativar, desativar ou bloquear utilizadores e editar dados básicos (nome, telefone, zona).
3. **Carteiras técnicas:** criar e remover vínculos Técnico ↔ Agricultor na tabela `TecnicoAgricultor`.
4. **Vista do Técnico:** "Agricultores Acompanhados" mostra apenas os agricultores da sua carteira (só leitura).
5. **Substituição da página provisória:** `/utilizadores` passa a painel administrativo completo com abas.

---

## 2. Diagnóstico do Estado Atual

| Item | Estado | Observação |
| :--- | :--- | :--- |
| Modelo `User` (role, status `ATIVO/INATIVO/BLOQUEADO`) | Existe | Não precisa de migração |
| Modelo `TecnicoAgricultor` (PK composta) | Existe | Não precisa de migração |
| `GET /api/users` | Existe | ADMIN e TECNICO; **porém o Técnico vê todos os agricultores**, não só a sua carteira (falha de RBAC a corrigir) |
| `POST /api/users`, `PATCH /api/users/[id]` | Em falta | — |
| `/api/users/atribuicoes` | Em falta | — |
| Login bloqueia contas não `ATIVO` | Existe | `src/app/api/auth/login/route.ts` |
| `src/features/users/` | Vazio | Apenas `.gitkeep` e `types.ts` vazio |
| `/utilizadores` | Parcial | Lista simples em cartões, sem criação, estado ou atribuições |

Nota: nenhuma alteração ao `schema.prisma` é necessária nesta fase.

---

## 3. Arquitetura das APIs REST (Backend)

### 3.1 Utilizadores
* **`GET /api/users`** (modificar)
  - `ADMIN`: todos os utilizadores; filtros `role`, `status`, `search`.
  - `TECNICO`: **apenas agricultores vinculados** à sua carteira (correção de RBAC).
  - Inclui no retorno: contagem de parcelas; para agricultores, o técnico responsável; para técnicos, o número de agricultores na carteira.

* **`POST /api/users`** (novo — apenas `ADMIN`)
  - Payload `createUserAdminSchema`: `nome`, `email`, `telefone` (+258), `zonaAtuacao`, `role` (`TECNICO` | `ADMIN` | `AGRICULTOR`), `senhaInicial` (mín. 8 caracteres).
  - Regras: e-mail único (409 se duplicado); senha com bcrypt; resposta sem `passwordHash`.
  - Cria `Alerta` do tipo `SISTEMA` de boas-vindas para a nova conta.

* **`GET /api/users/[id]`** (novo — `ADMIN`)
  - Detalhe da conta com vínculos e métricas (parcelas, leituras, ocorrências).

* **`PATCH /api/users/[id]`** (novo — apenas `ADMIN`)
  - Payload `updateUserAdminSchema`: `nome?`, `telefone?`, `zonaAtuacao?`, `status?`, `role?`.
  - Proteções:
    - O Administrador não pode desativar/bloquear nem rebaixar a **própria** conta.
    - Não é permitido deixar o sistema **sem nenhum ADMIN ativo**.
    - Mudar o papel de um Técnico com carteira ativa exige remover os vínculos primeiro (409 com mensagem clara).

**Importante:** não haverá `DELETE` físico de utilizadores. As relações usam `onDelete: Cascade` e apagar uma conta apagaria parcelas, leituras e mensagens. A "remoção" é feita por `status = INATIVO`.

### 3.2 Carteiras Técnicas
* **`GET /api/users/atribuicoes`** (novo — `ADMIN`)
  - Lista de técnicos com os respetivos agricultores vinculados e `dataVinculo`.
  - Lista auxiliar de **agricultores sem técnico** (para destacar casos pendentes).

* **`POST /api/users/atribuicoes`** (novo — `ADMIN`)
  - Payload: `tecnicoId`, `agricultorIds: string[]` (atribuição em lote).
  - Validações: `tecnicoId` tem papel `TECNICO` e está `ATIVO`; cada id tem papel `AGRICULTOR`.
  - Transação: cria os vínculos e envia `Alerta` ao agricultor ("Foi atribuído ao técnico X") e ao técnico ("N novos agricultores na sua carteira").

* **`DELETE /api/users/atribuicoes`** (novo — `ADMIN`)
  - Payload: `tecnicoId`, `agricultorId`. Remove o vínculo; o histórico de mensagens é preservado.

---

## 4. Arquitetura Frontend (`src/features/users`)

### 4.1 Serviços, Tipos e Hooks
1. **`types.ts`**: `UserListItem`, `UserDetail`, `CarteiraTecnica`, `CreateUserAdminInput`, `UpdateUserAdminInput`.
2. **`schemas/userAdminSchemas.ts`**: schemas Zod partilhados entre API e formulários.
3. **`services/userService.ts`**: `listar`, `obter`, `criar`, `atualizar`, `alterarEstado`, `listarAtribuicoes`, `atribuir`, `removerAtribuicao` (via `api` de `src/lib/api/client.ts`, sem `fetch` manual).
4. **`hooks/useUsers.ts`** e **`hooks/useAtribuicoes.ts`**: estado, filtros e mutações **otimistas** (mesmo padrão do chat e dos alertas — sem ecrãs de loading a cada ação).

### 4.2 Componentes Visuais
* **`UserStatsCards.tsx`**: Total de contas, Técnicos ativos, Agricultores, Agricultores sem técnico.
* **`UserFilters.tsx`**: pesquisa, papel e estado.
* **`UserTable.tsx`**: tabela com badges de papel/estado, técnico responsável e menu de ações (editar, ativar/desativar/bloquear).
* **`CreateUserModal.tsx`**: formulário de criação (Nome, E-mail, Telefone, Zona de Nhamatanda, Papel, Senha inicial com indicador de força).
* **`EditUserModal.tsx`**: edição de dados e estado, com confirmação para bloqueio.
* **`CarteiraTecnicaPanel.tsx`**: lista de técnicos à esquerda; agricultores da carteira à direita, com remoção.
* **`AtribuicaoModal.tsx`**: seleção múltipla de agricultores (pesquisa + checkboxes) para atribuir ao técnico selecionado.

### 4.3 Página `src/app/(dashboard)/utilizadores/page.tsx`
* **ADMIN** — três abas:
  1. *Todos os Utilizadores* (tabela + criar/editar/estado)
  2. *Técnicos SDAE* (tabela filtrada com tamanho da carteira)
  3. *Atribuição de Carteiras* (`CarteiraTecnicaPanel`)
* **TECNICO** — vista só de leitura "Agricultores Acompanhados": cartões com contacto, zona, nº de parcelas e atalho para o chat (`/mensagens?interlocutorId=...`).
* **AGRICULTOR** — redireccionado para `/dashboard` (não tem entrada no menu).

---

## 5. Matriz de Ficheiros Impactados e Criados

| Ficheiro | Camada | Ação | Descrição |
| :--- | :--- | :--- | :--- |
| `src/app/api/users/route.ts` | Backend API | Modificar | RBAC do Técnico + `POST` de criação |
| `src/app/api/users/[id]/route.ts` | Backend API | Criar | `GET` detalhe e `PATCH` de dados/estado |
| `src/app/api/users/atribuicoes/route.ts` | Backend API | Criar | `GET`/`POST`/`DELETE` de vínculos |
| `src/features/users/types.ts` | Frontend Types | Modificar | Tipos da feature |
| `src/features/users/schemas/userAdminSchemas.ts` | Validação | Criar | Schemas Zod |
| `src/features/users/services/userService.ts` | Frontend Service | Criar | Integração HTTP |
| `src/features/users/hooks/useUsers.ts` | Frontend Hook | Criar | Gestão de utilizadores |
| `src/features/users/hooks/useAtribuicoes.ts` | Frontend Hook | Criar | Gestão de carteiras |
| `src/features/users/components/*.tsx` | Frontend UI | Criar | 7 componentes listados em 4.2 |
| `src/features/users/index.ts` | Core Feature | Criar | Barrel export |
| `src/app/(dashboard)/utilizadores/page.tsx` | Frontend Page | Reescrever | Painel com abas (ADMIN) e vista do Técnico |
| `scripts/verify-fase4-users.mjs` | Testes / QA | Criar | Testes automatizados de API e RBAC |
| `doc/guia-testes-frontend.md` | Documentação | Modificar | Secção de testes da Fase 4 |

---

## 6. Roteiro Passo a Passo

### Passo 1: Backend
1. Schemas Zod em `userAdminSchemas.ts`.
2. Corrigir `GET /api/users` (carteira do Técnico) e adicionar `POST`.
3. Criar `/api/users/[id]` com as proteções de auto-bloqueio e último ADMIN.
4. Criar `/api/users/atribuicoes` com transações e alertas.

### Passo 2: Camada Frontend
1. Tipos, serviço e hooks com mutações otimistas.
2. Componentes visuais e barrel export.

### Passo 3: Página
1. Reescrever `/utilizadores` com abas por papel.

### Passo 4: Homologação
1. `scripts/verify-fase4-users.mjs` cobrindo:
   - ADMIN cria Técnico → login do novo Técnico funciona.
   - ADMIN atribui agricultor → Técnico passa a vê-lo em `GET /api/users` e no chat.
   - ADMIN bloqueia conta → login devolve 403.
   - TECNICO/AGRICULTOR recebem 403 em `POST`, `PATCH` e atribuições.
   - ADMIN não consegue bloquear a própria conta.
2. `npx tsc --noEmit` sem erros.
3. Atualizar `doc/guia-testes-frontend.md`.

---

## 7. Critérios de Aceitação da Fase 4

1. O Administrador cria uma conta de Técnico e esta consegue autenticar-se.
2. O Administrador associa e remove agricultores da carteira de um Técnico.
3. Após a atribuição, o Técnico vê o agricultor em "Agricultores Acompanhados", pode validar as suas leituras, responder às suas ocorrências e conversar no chat.
4. Contas `INATIVO`/`BLOQUEADO` não conseguem iniciar sessão.
5. RBAC: apenas `ADMIN` cria, edita e atribui; o Técnico só lê a própria carteira.
6. `/utilizadores` renderiza sem placeholders e com dados reais.
7. `scripts/verify-fase4-users.mjs` e `npx tsc --noEmit` passam a 100%.

---

## 8. Decisões para Aprovação

| # | Questão | Proposta |
| :---: | :--- | :--- |
| 1 | Um agricultor pode ter **mais de um técnico**? O modelo permite N:N. | **Um técnico por agricultor.** Ao atribuir a um novo técnico, o vínculo anterior é substituído (com aviso no modal). Simplifica o chat e a responsabilidade de validação. |
| 2 | O Técnico pode aceder a `/utilizadores`? O `plano.md` diz "apenas administradores", mas o menu do Técnico (Fig. 15) tem "Agricultores Acompanhados". | **Sim, só leitura e apenas a sua carteira.** Toda a escrita continua exclusiva do ADMIN. |
| 3 | O ADMIN pode criar contas de **Agricultor**? | **Sim** (útil para agricultores sem e-mail próprio ou com baixa literacia digital, registados no terreno pelo SDAE). |
| 4 | Sessões já abertas de uma conta bloqueada: o JWT continua válido até expirar (8 h). | **Verificar o estado da conta nas rotas sensíveis** (consulta leve a `User.status` em `requireAuth`). Alternativa mais simples: aceitar o atraso até à expiração do token. |
| 5 | Redefinição de senha pelo ADMIN. | **Fora do âmbito desta fase** (já existe recuperação por e-mail). Pode ser acrescentada se desejar. |

Após a aprovação (e respostas às decisões acima), executo os Passos 1 a 4 e entrego o relatório de homologação.
