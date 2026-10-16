# Plano Detalhado de Implementação — Fase 5

## Informações do Documento
* Módulo: Recomendações Técnicas Agronómicas e Catálogo Mestre de Culturas
* Requisitos Atendidos: RF06 (Catálogo de Culturas com parâmetros climáticos e ciclo), RF07 (Emissão de recomendações técnicas por parcela e cultura), RF08 (Consulta e acompanhamento de recomendações pelo agricultor com ciclo de vida PENDENTE ➔ APLICADA ➔ ARQUIVADA), RF14 (Manutenção administrativa de catálogos mestres — CRUD completo com proteção de integridade referencial)
* Projeto: KulimaTech (SDAE Nhamatanda / UniZambeze)
* Alvo: Fase 5 do Plano Geral de Engenharia (`doc/plano.md`)
* Pilha Tecnológica: Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma ORM 7.x, PostgreSQL (Supabase), Zod, Lucide React
* Versão: 1.0.0
* Data de Elaboração: Outubro de 2026
* Estado: **Aguarda aprovação**

---

## 1. Escopo e Objetivos da Fase 5

A **Fase 5** fecha o ciclo central de apoio à tomada de decisão agronómica do KulimaTech em Nhamatanda. É o elo direto entre o conhecimento agronómico dos extensionistas do SDAE e as práticas de campo dos agricultores familiares.

Enquanto as Fases 1 a 4 estruturaram os modelos de dados, as leituras de solo, o reporte fitossanitário e a gestão de contas e carteiras técnicas, a **Fase 5** operacionaliza:
1. A **emissão e gestão de recomendações técnicas** (fertilização, rega, consociação, tratamentos, época ideal de sementeira) orientadas a parcelas específicas e fundamentadas nas culturas prioritárias do distrito.
2. O **ciclo de aplicação no terreno**: o agricultor notificado recebe a orientação no telemóvel/computador e marca formalmente quando a recomendação foi executada no solo (`APLICADA`), fechando o fluxo de monitoria agronómica com notificação de retorno ao técnico.
3. A **administração completa dos catálogos mestres** de culturas pelo Administrador do SDAE, permitindo cadastrar novas culturas, calibrar intervalos de humidade do solo (mínima e máxima), ajustar ciclos vegetativos em dias e orientações de maneio, garantindo integridade referencial estrita (impedindo a remoção acidental de culturas vinculadas a recomendações históricas ou pragas cadastradas).
4. A **centralização da navegação**: disponibilizar uma página dedicada e intuitiva de Recomendações (`/recomendacoes`), além de aprimorar os pontos de entrada em `/culturas` e `/parcelas/[id]`.

---

## 2. Diagnóstico do Estado Atual

| Componente | Estado Atual | Diagnóstico / Necessidade na Fase 5 |
| :--- | :--- | :--- |
| **Modelos Prisma** (`Cultura`, `Recomendacao`) | Existentes | Esquema completo e consistente; enum `StatusRecomendacao` (`PENDENTE`, `APLICADA`, `ARQUIVADA`) pronto. Nenhuma migração necessária no banco. |
| **`GET /api/culturas`** | Existente | Funcional com busca textual e filtro por humidade. |
| **`POST /api/culturas`** | Existente | Restrito a `ADMIN`, mas requer validações refinadas de duplicidade e valores numéricos coerentes. |
| **`PUT /api/culturas/[id]`** | Existente (básico) | Precisa de validação Zod refinada, checagem de concorrência e retorno limpo. |
| **`DELETE /api/culturas/[id]`** | Parcial | Verifica vínculo com `recomendacoes`, mas não verifica vínculo com `pragas` (modelo `Praga` possui `culturaId`). Deve validar ambas as tabelas para integridade referencial. |
| **`GET /api/recomendacoes`** | Existente | Filtra por papel (`AGRICULTOR`, `TECNICO`, `ADMIN`). Necessita de filtros adicionais (busca textual no parecer e contagem agregada de status). |
| **`POST /api/recomendacoes`** | Existente | Valida carteira do Técnico (`TecnicoAgricultor`) e cria `Alerta` do tipo `NOVA_RECOMENDACAO`. |
| **`PATCH /api/recomendacoes/[id]`** | Parcial | Permite alterar status para `APLICADA` ou `ARQUIVADA`, mas **não notifica o técnico** quando o agricultor aplica a orientação, quebrando o ciclo de retroalimentação. |
| **`GET /api/recomendacoes/estatisticas`** | Em falta | Rota agregada para cards de métricas (Total, Pendentes, Aplicadas, Arquivadas). |
| **Página `/culturas`** | Parcial | Exibe catálogo em cartões e busca, mas **não possui botões ou modais para o ADMIN** criar, editar ou excluir culturas. |
| **Página `/recomendacoes`** | Em falta | O menu lateral aponta para `/parcelas`. Falta uma central dedicada para agricultores e técnicos acompanharem todo o histórico de orientações com abas e filtros rápidos. |
| **Componentes de Recomendações** | Dispersos | `EmitirRecomendacaoModal` só funciona com `parcelaId` pré-definido no detalhe da parcela. Falta modal versátil (com seleção de agricultor/parcela quando chamado da central) e falta `RecomendacaoCard` desacoplado. |

---

## 3. Arquitetura das APIs REST (Backend)

### 3.1 Módulo de Catálogo de Culturas (`/api/culturas`)

* **`GET /api/culturas`** (refinamento)
  - **Acesso:** Todos os utilizadores autenticados (`ADMIN`, `TECNICO`, `AGRICULTOR`).
  - **Query Params:** `search` (nome comum, nome científico, descrição), `humidade` (filtra culturas cuja faixa ideal abranja o valor), `sort` (`nome`, `cicloDias`).
  - **Retorno:** Lista ordenada com contadores de dependências (`_count: { recomendacoes: true, pragas: true }`).

* **`POST /api/culturas`** (validação estrita)
  - **Acesso:** Apenas perfil `ADMIN`.
  - **Validação:** `createCulturaSchema` (Zod):
    - `nome`: obrigatório (mín. 2 carateres, único no banco, case-insensitive).
    - `nomeCientifico`: opcional (formatação botânica em itálico).
    - `descricao`: obrigatório (mín. 10 carateres).
    - `humidadeMin` e `humidadeMax`: percentuais válidos entre 0% e 100%, com regra cruzada `humidadeMin <= humidadeMax`.
    - `cicloDias`: inteiro positivo em dias (ex: 90 a 120 dias).
    - `epocaPlantio`: texto descritivo (ex: "Outubro a Dezembro — Época das Primeiras Chuvas").
    - `cuidados`: orientações de preparação de canteiros, adubação de fundo e compasso.

* **`PUT /api/culturas/[id]`** (atualização segura)
  - **Acesso:** Apenas perfil `ADMIN`.
  - **Validação:** `updateCulturaSchema` com verificação de não colisão com outros registos no campo `nome`.

* **`DELETE /api/culturas/[id]`** (proteção de integridade referencial)
  - **Acesso:** Apenas perfil `ADMIN`.
  - **Regra de Integridade:**
    1. Verifica se existem recomendações associadas: se `_count.recomendacoes > 0`, rejeita com status 400 (`CULTURA_HAS_RECOMMENDATIONS`).
    2. Verifica se existem pragas cadastradas associadas a esta cultura: se `_count.pragas > 0`, rejeita com status 400 (`CULTURA_HAS_PESTS`).
    3. Só permite a eliminação física caso ambos os contadores sejam zero. Mensagem amigável com indicação exata do motivo do bloqueio.

---

### 3.2 Módulo de Recomendações Técnicas (`/api/recomendacoes`)

* **`GET /api/recomendacoes`** (expansão)
  - **Acesso:** Filtrado por RBAC:
    - `AGRICULTOR`: apenas recomendações das suas parcelas (`parcela.agricultorId === session.userId`).
    - `TECNICO`: recomendações emitidas por ele ou pertencentes aos agricultores sob sua supervisão (`TecnicoAgricultor`).
    - `ADMIN`: todas as recomendações do distrito de Nhamatanda.
  - **Query Params:**
    - `status`: `PENDENTE`, `APLICADA`, `ARQUIVADA`.
    - `parcelaId`: ID da parcela específica.
    - `culturaId`: ID da cultura orientada.
    - `search`: busca textual no parecer técnico ou no nome da parcela.
  - **Relações Carregadas:** `tecnico` (id, nome, email, telefone), `cultura` (id, nome, humidadeMin, humidadeMax), `parcela` (id, nome, areaHectares, tipoSolo, agricultor).

* **`POST /api/recomendacoes`** (emissão técnica)
  - **Acesso:** `TECNICO` e `ADMIN`.
  - **Regra de Negócio e Segurança:**
    - Se for `TECNICO`, valida se o agricultor titular da parcela está na sua carteira (`TecnicoAgricultor`). Se não estiver, devolve 403 (`NOT_SUPERVISING_FARMER`).
  - **Transação:**
    1. Insere registo com status inicial `PENDENTE`.
    2. Gera automaticamente um `Alerta` para o Agricultor:
       - Tipo: `NOVA_RECOMENDACAO`.
       - Título: `Nova Orientação Técnica: [Nome da Parcela]`.
       - Mensagem: resumo do parecer do técnico.
       - Link: `/recomendacoes?id=[recomendacaoId]`.

* **`PATCH /api/recomendacoes/[id]`** (mudança de estado e ciclo de retorno)
  - **Acesso:** RBAC contextual:
    - `AGRICULTOR`: só pode agir sobre recomendações das suas parcelas e **apenas transitar para `APLICADA`**.
    - `TECNICO`: pode editar parecer ou transitar para `ARQUIVADA`.
    - `ADMIN`: controlo total.
  - **Transação no retorno de aplicação:**
    - Quando o agricultor altera para `APLICADA`:
      1. Atualiza o status em `Recomendacao`.
      2. Dispara automaticamente um `Alerta` para o Técnico emissor (`AlertaTipo.SISTEMA`):
         - Título: `Recomendação Aplicada no Campo`.
         - Mensagem: `O agricultor [Nome] confirmou a aplicação da recomendação técnica na parcela [Parcela].`
         - Link: `/parcelas/[parcelaId]`.

* **`GET /api/recomendacoes/estatisticas`** (novo)
  - **Acesso:** Autenticado, respeitando o isolamento RBAC.
  - **Retorno:**
    ```json
    {
      "total": 24,
      "pendentes": 5,
      "aplicadas": 17,
      "arquivadas": 2
    }
    ```

---

## 4. Arquitetura Frontend (`src/features/culturas` e Recomendações)

A organização das features no KulimaTech agrupa o conhecimento fitotécnico e as recomendações associadas no domínio agronómico (`src/features/culturas`).

### 4.1 Serviços, Tipos e Schemas

1. **`src/features/culturas/types.ts`**:
   - `Cultura`, `CulturaListItem`, `CreateCulturaInput`, `UpdateCulturaInput`.
   - `Recomendacao`, `RecomendacaoListItem`, `CreateRecomendacaoInput`, `UpdateStatusRecomendacaoInput`.
   - `RecomendacaoStats` (`total`, `pendentes`, `aplicadas`, `arquivadas`).
   - `GetRecomendacoesFilters` e `GetCulturasFilters`.

2. **`src/features/culturas/schemas/culturaSchemas.ts`**:
   - `culturaFormSchema`: validação Zod rigorosa com mensagens em português moçambicano.
   - `createRecomendacaoSchema`: validação do formulário com seleção de parcela, cultura e parecer (mínimo 10 carateres explicativos).
   - `updateStatusRecomendacaoSchema`: validação da transição de estados.

3. **`src/features/culturas/services/culturaService.ts`**:
   - `getCulturas`, `getCulturaById`, `createCultura`, `updateCultura`, `deleteCultura`.

4. **`src/features/culturas/services/recomendacaoService.ts`**:
   - `getRecomendacoes`, `getRecomendacaoById`, `createRecomendacao`, `updateStatus`, `getEstatisticas`.

5. **`src/features/culturas/hooks/useCulturas.ts`**:
   - Hook de gestão do catálogo de culturas: carregamento, filtros de humidade, busca instantânea e mutações otimistas com tratamento de erros.

6. **`src/features/culturas/hooks/useRecomendacoes.ts`**:
   - Hook de gestão de recomendações: carregamento, filtros por status/parcela/cultura/busca, emissão de parecer e atualização de status para `APLICADA` com feedback imediato (otimista).

---

### 4.2 Componentes de Interface

#### Catálogo de Culturas
* **`CulturaCard.tsx`**:
  - Exibição visual da cultura com ícone representativo, nome vulgar, nome científico, badge de humidade ideal, ciclo vegetativo em dias e época de sementeira em Nhamatanda.
  - Para `ADMIN`: menu contextual ou botões discretos "Editar" e "Eliminar".
* **`CulturaFormModal.tsx`**:
  - Modal unificado para criação ou edição de cultura (preenchido com dados existentes em modo edição).
  - Validação Zod com feedback visual nos inputs (bordas vermelhas e mensagens de erro contextuais).
* **`CulturaDeleteDialog.tsx`**:
  - Diálogo de confirmação de exclusão que apresenta aviso sobre impacto agronómico e trata erros de dependência (recomendações/pragas) com mensagens claras.
* **`CulturaFilters.tsx`**:
  - Barra de busca e seletor rápido por faixa de humidade (ex: Todas, Baixa <40%, Média 40-70%, Alta >70%).

#### Recomendações Técnicas
* **`RecomendacaoCard.tsx`**:
  - Cartão visual responsivo contendo:
    - Cabeçalho: identificador da parcela, data de emissão e badge de status (`PENDENTE` em amarelo/âmbar, `APLICADA` em verde-esmeralda, `ARQUIVADA` em cinzento).
    - Corpo: texto do parecer agronómico em destaque, cultura recomendada com sua faixa de humidade de referência.
    - Rodapé: identificação do técnico emissor (nome e contacto) e do agricultor responsável.
    - Ações contextuais:
      - Para o `AGRICULTOR`: botão "Marcar como Aplicada na Parcela" quando `PENDENTE`, com animação de sucesso.
      - Para o `TECNICO`/`ADMIN`: botão para arquivar ou visualizar detalhes da parcela.
* **`RecomendacaoFormModal.tsx`**:
  - Modal versátil para emissão técnica:
    - Se chamado com `parcelaId` fixo (ex: dentro da página da parcela), fixa o talhão e bloqueia o campo.
    - Se chamado na página geral `/recomendacoes`, exibe um seletor pesquisável das parcelas dos agricultores sob responsabilidade do técnico.
    - Dropdown com busca para selecionar a cultura do catálogo (opcional, pode ser recomendação geral de manejo de solo).
    - Campo de parecer com contagem de caracteres e dicas de boas práticas agronómicas.
* **`RecomendacaoFilters.tsx`**:
  - Filtro por abas de status (`Todas`, `Pendentes`, `Aplicadas`, `Arquivadas`), seletor de parcela e busca por texto.
* **`RecomendacaoStatsCards.tsx`**:
  - 4 cartões de indicadores: Total de Orientações, Pendentes de Aplicação, Aplicadas com Sucesso e Taxa de Adoção Técnica (%).

---

### 4.3 Páginas de Navegação

1. **`src/app/(dashboard)/culturas/page.tsx`** (modernização completa)
   - Adição do botão de destaque **"Nova Cultura Agronómica"** visível exclusivamente para o perfil `ADMIN`.
   - Cartões com ações de edição e eliminação para o administrador.
   - Integração com `CulturaFormModal` e `CulturaDeleteDialog`.
   - Atualização em tempo real após inserção/atualização/remoção sem necessidade de recarregar a página (F5).

2. **`src/app/(dashboard)/recomendacoes/page.tsx`** (nova central dedicada)
   - Central unificada de Recomendações Técnicas para o distrito de Nhamatanda.
   - **Visão do Agricultor:** foco nas orientações recebidas para as suas terras, com destaque para as recomendações que aguardam aplicação prática.
   - **Visão do Técnico:** lista de recomendações emitidas, acompanhamento de quais agricultores já aplicaram as orientações e botão principal para emitir nova orientação técnica.
   - **Visão do Administrador:** vista consolidada para monitoria da extensão agrária distrital.

3. **`src/app/(dashboard)/parcelas/[id]/page.tsx`** (integração)
   - Substituição dos blocos ad-hoc da seção de recomendações pelo componente `RecomendacaoCard`.
   - Mantém o botão "Emitir Recomendação" chamando o modal com o talhão pré-selecionado.

4. **`src/components/layout/AppSidebar.tsx`** (ajuste de rotas)
   - Ajustar os itens de menu:
     - Técnico: `id: 'recommendations'` ➔ `href: '/recomendacoes'`.
     - Agricultor: `id: 'received-recommendations'` ➔ `href: '/recomendacoes'`.
     - Administrador: adicionar atalho em Governança ou manter acesso direto.

---

## 5. Matriz de Ficheiros Impactados e Criados

| Ficheiro | Camada | Ação | Descrição Técnica |
| :--- | :--- | :--- | :--- |
| `src/app/api/culturas/[id]/route.ts` | Backend API | Modificar | Verificação estrita de vínculos com `pragas` e `recomendacoes` no `DELETE`; PUT robusto |
| `src/app/api/recomendacoes/route.ts` | Backend API | Modificar | Filtro por busca textual e enriquecimento dos metadados de parcelas e agricultores |
| `src/app/api/recomendacoes/[id]/route.ts` | Backend API | Modificar | Notificação automática (`Alerta`) ao técnico quando o agricultor marca como `APLICADA` |
| `src/app/api/recomendacoes/estatisticas/route.ts` | Backend API | Criar | Métricas agregadas por perfil (total, pendentes, aplicadas, arquivadas) |
| `src/features/culturas/types.ts` | Types | Modificar | Adição de tipos para estatísticas, filtros avançados e detalhes |
| `src/features/culturas/schemas/culturaSchemas.ts` | Validação | Modificar | Refinamento de schemas Zod e mensagens de erro |
| `src/features/culturas/services/culturaService.ts` | Frontend Service | Modificar | Garantir contratos com novos métodos e tratamento de exceções tipadas |
| `src/features/culturas/services/recomendacaoService.ts` | Frontend Service | Modificar | Adição de `getEstatisticas` e filtros completos |
| `src/features/culturas/hooks/useCulturas.ts` | Hook | Criar | Hook de gestão do catálogo de culturas com mutações otimistas |
| `src/features/culturas/hooks/useRecomendacoes.ts` | Hook | Criar | Hook de gestão de recomendações com filtros e transições otimistas |
| `src/features/culturas/components/CulturaCard.tsx` | Componente | Criar | Card da cultura com ações de edição/eliminação para `ADMIN` |
| `src/features/culturas/components/CulturaFormModal.tsx` | Componente | Criar | Modal Zod de cadastro e edição de culturas |
| `src/features/culturas/components/CulturaDeleteDialog.tsx` | Componente | Criar | Diálogo de confirmação de exclusão com checagem de bloqueios |
| `src/features/culturas/components/RecomendacaoCard.tsx` | Componente | Criar | Card padronizado de recomendação com botão "Marcar Aplicada" |
| `src/features/culturas/components/RecomendacaoFormModal.tsx` | Componente | Criar | Modal versátil para emissão técnica (com ou sem parcela pré-selecionada) |
| `src/features/culturas/components/RecomendacaoFilters.tsx` | Componente | Criar | Abas de status e filtros rápidos |
| `src/features/culturas/components/RecomendacaoStatsCards.tsx` | Componente | Criar | Cards de indicadores agregados da extensão agrária |
| `src/features/culturas/components/index.ts` | Barrel | Modificar | Exportação consolidada de todos os novos componentes |
| `src/features/culturas/index.ts` | Barrel | Modificar | Exportação geral da feature |
| `src/app/(dashboard)/culturas/page.tsx` | Página | Modificar | Integração dos modais de gestão para ADMIN e novos cards |
| `src/app/(dashboard)/recomendacoes/page.tsx` | Página | Criar | Central dedicada de recomendações técnicas com filtros e estatísticas |
| `src/app/(dashboard)/parcelas/[id]/page.tsx` | Página | Modificar | Uso do `RecomendacaoCard` unificado e fluxo refinado |
| `src/components/layout/AppSidebar.tsx` | Layout | Modificar | Correção das rotas de Recomendações para `/recomendacoes` |
| `scripts/verify-fase5-recomendacoes-culturas.mjs` | Testes / QA | Criar | Script de teste automatizado de ponta a ponta (API, RBAC, integridade) |
| `doc/guia-testes-frontend.md` | Documentação | Modificar | Inclusão do roteiro de testes e homologação da Fase 5 |

---

## 6. Roteiro Passo a Passo de Execução

### Passo 1: Backend & Integridade Referencial
1. **Refinar `DELETE /api/culturas/[id]`**: incluir validação se a cultura possui pragas vinculadas em `prisma.praga.count({ where: { culturaId: id } })`. Bloquear com status 400 e mensagem explicativa caso possua pragas ou recomendações.
2. **Atualizar `PATCH /api/recomendacoes/[id]`**: quando o agricultor transitar para `status = 'APLICADA'`, disparar automaticamente um `Alerta` para o `tecnicoId` informando da aplicação da orientação na parcela.
3. **Criar `GET /api/recomendacoes/estatisticas`**: retornar os contadores agrupados conforme o perfil (`AGRICULTOR`, `TECNICO`, `ADMIN`).
4. **Refinar `GET /api/recomendacoes`**: adicionar suporte a busca textual por termos no campo `parecer`.

### Passo 2: Camada de Serviços, Schemas e Hooks Frontend
1. Atualizar `types.ts`, `culturaSchemas.ts`, `culturaService.ts` e `recomendacaoService.ts`.
2. Implementar `useCulturas.ts` com busca, filtros de humidade e mutações com feedback em tempo real.
3. Implementar `useRecomendacoes.ts` com mutações otimistas para a transição para `APLICADA` (o card atualiza instantaneamente na interface sem travamentos).

### Passo 3: Componentes Visuais do Catálogo de Culturas
1. Criar `CulturaCard.tsx` com visual institucional, indicadores de humidade e botões de ação para ADMIN.
2. Criar `CulturaFormModal.tsx` suportando modo criação e modo edição.
3. Criar `CulturaDeleteDialog.tsx` com feedback de erro em caso de bloqueio por integridade referencial.
4. Atualizar a página `src/app/(dashboard)/culturas/page.tsx`.

### Passo 4: Componentes Visuais e Central de Recomendações
1. Criar `RecomendacaoCard.tsx` com visual moderno, badges de status e botão "Marcar Aplicada".
2. Criar `RecomendacaoFormModal.tsx` com seleção inteligente de parcela (carrega as parcelas dos agricultores da carteira do técnico caso nenhuma esteja pré-definida).
3. Criar `RecomendacaoFilters.tsx` e `RecomendacaoStatsCards.tsx`.
4. Criar a nova página central `src/app/(dashboard)/recomendacoes/page.tsx`.
5. Atualizar a rota `/parcelas/[id]` para utilizar o novo `RecomendacaoCard`.
6. Atualizar os links no `AppSidebar.tsx` direcionando para `/recomendacoes`.

### Passo 5: Homologação e Verificação Automatizada
1. Criar `scripts/verify-fase5-recomendacoes-culturas.mjs` cobrindo:
   - Login como ADMIN, criação de nova cultura e edição de limiares.
   - Tentativa de criação por Técnico ou Agricultor ➔ 403 Forbidden.
   - Emissão de recomendação pelo Técnico para parcela da sua carteira ➔ 201 Created + Alerta gerado para o Agricultor.
   - Tentativa de emissão para agricultor fora da carteira ➔ 403 Forbidden.
   - Agricultor visualiza recomendação e marca como `APLICADA` ➔ 200 OK + Alerta gerado para o Técnico.
   - Tentativa de apagar cultura vinculada a recomendação ➔ 400 Bad Request com integridade protegida.
   - Apagar cultura avulsa sem dependências ➔ 200 OK.
2. Executar `npx tsc --noEmit` para garantir ausência de erros de compilação estática.
3. Atualizar o `doc/guia-testes-frontend.md`.

---

## 7. Critérios de Aceitação da Fase 5

1. **Gestão de Culturas pelo Administrador:**
   - O Administrador consegue criar uma nova espécie agrícola com nome, nome científico, humidade mínima, humidade máxima, ciclo e cuidados de cultivo.
   - O Administrador consegue editar qualquer parâmetro de uma cultura existente diretamente na interface de `/culturas`.
   - O Administrador não consegue excluir uma cultura que esteja associada a recomendações emitidas ou pragas cadastradas, recebendo feedback visual explicativo.
   - Usuários com papéis `TECNICO` e `AGRICULTOR` não visualizam botões de criação, edição ou exclusão de culturas.
2. **Emissão de Pareceres pelo Técnico:**
   - O Técnico consegue emitir recomendações a partir de `/parcelas/[id]` ou a partir da central `/recomendacoes`, selecionando a parcela de um agricultor sob sua supervisão.
   - Ao emitir a recomendação, o sistema gera instantaneamente uma notificação na Central de Alertas do agricultor titular da parcela.
3. **Ciclo de Aplicação pelo Agricultor:**
   - O agricultor visualiza suas recomendações em `/recomendacoes` e no detalhe de suas parcelas.
   - Recomendações pendentes exibem o botão "Marcar como Aplicada".
   - Ao clicar, o estado muda para `APLICADA` imediatamente e o técnico supervisor recebe um alerta de confirmação.
4. **Página Central de Recomendações (`/recomendacoes`):**
   - Página plenamente operacional, responsiva, com filtros por status (`PENDENTE`, `APLICADA`, `ARQUIVADA`), busca textual e estatísticas consolidadas.
5. **Qualidade e Estabilidade:**
   - `scripts/verify-fase5-recomendacoes-culturas.mjs` passa com 100% de sucesso.
   - `npx tsc --noEmit` passa sem nenhum erro de tipagem.

---

## 8. Decisões Técnicas para Homologação

| # | Ponto em Análise | Proposta de Engenharia |
| :---: | :--- | :--- |
| **1** | **Criação da Rota `/recomendacoes` vs manter apenas dentro de `/parcelas`** | **Criar `/recomendacoes` dedicada.** O menu lateral do Técnico e do Agricultor já possui os itens "Recomendações Técnicas" e "Recomendações Recebidas". Ter uma central dedicada com abas de status (`Pendentes`, `Aplicadas`) traz clareza operacional para a extensão agrária em Nhamatanda. |
| **2** | **Notificação de Retorno ao Técnico quando o Agricultor Aplica a Recomendação** | **Implementar via `AlertaTipo.SISTEMA`.** Quando o agricultor clica em "Marcar como Aplicada", o sistema cria um alerta para o técnico emissor. Isso fecha o ciclo agronómico estabelecido na monografia. |
| **3** | **Cultura opcional na Recomendação** | **Manter opcional (`culturaId?`).** Permite que o técnico emita orientações gerais de preparação de canteiros, correção de acidez do solo ou drenagem, sem estar obrigatoriamente atrelado a uma cultura específica. |
| **4** | **Exclusão de Culturas com Pragas vinculadas** | **Bloquear exclusão.** Como o modelo `Praga` se relaciona com `Cultura` via `culturaId`, eliminar a cultura deixaria as pragas sem contexto fitotécnico. Bloquear a remoção protege a consistência do catálogo. |
| **5** | **Arquivamento de Recomendações** | **Apenas Técnico e Admin podem arquivar.** O estado `ARQUIVADA` serve para orientações antigas de safras passadas que já não exigem ação ativa no talhão. |

---

Após a aprovação deste plano, iniciaremos a execução conforme o roteiro, entregando o backend refinado, a interface completa de Recomendações e Catálogo Mestre, e o relatório de homologação automatizado.
