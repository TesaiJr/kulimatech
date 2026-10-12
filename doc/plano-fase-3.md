# Plano Detalhado de Implementação — Fase 3

## Informações do Documento
* Módulo: Catálogo de Pragas e Gestão de Ocorrências Fitossanitárias
* Requisitos Atendidos: RF09 (Catálogo de pragas com filtro por cultura), RF10 (Reporte de ocorrências fitossanitárias com imagens) e RF11 (Parecer técnico agronómico e resolução de ocorrências)
* Projeto: KulimaTech (SDAE Nhamatanda / UniZambeze)
* Alvo: Fase 3 do Plano Geral de Engenharia (`doc/plano.md`)
* Pilha Tecnológica: Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma ORM 7.x, PostgreSQL (Supabase), Zod, Lucide React
* Versão: 1.0.0
* Data de Elaboração: Outubro de 2026

---

## 1. Escopo e Objetivos da Fase 3

A **Fase 3** consolida a proteção fitossanitária das culturas de Nhamatanda no KulimaTech. O módulo permite aos produtores agrícolas consultar informações sobre pragas que atacam as suas culturas, reportar sintomas e infestações observadas no campo e receber pareceres técnicos rápidos dos extensionistas do SDAE.

### Objetivos Centrais:
1. **Catálogo de Pragas Agrícolas (RF09):** Catálogo de referência com sintomas visíveis, medidas culturais/biológicas/químicas de combate, severidade padrão e filtro dinâmico por cultura hospedeira (ex: Milho -> Lagarta do Funil; Tomate -> Tuta absoluta).
2. **Reporte de Ocorrências de Campo (RF10):** Permitir ao agricultor abrir ocorrências fitossanitárias associadas a uma parcela específica, indicando a suspeita de praga, severidade observada, descrição e foto.
3. **Disparo de Alertas e Notificação Imediata:** Ao registrar uma ocorrência, notificar automaticamente o Técnico do SDAE responsável pela supervisão daquele produtor.
4. **Resolução e Parecer Técnico (RF11):** Interface focada para o Técnico SDAE analisar o caso, prescrever ações recomendadas e produtos fitossanitários apropriados, e homologar o encerramento do caso (`RESOLVIDA`).
5. **Substituição dos Placeholders:** Tornar as rotas `/pragas` e `/pragas/ocorrencias` 100% funcionais e responsivas.

---

## 2. Arquitetura das APIs REST (Backend)

### 2.1 Catálogo de Pragas
* **`GET /api/pragas`**
  - **Acesso:** Todos os utilizadores autenticados.
  - **Query Params:**
    - `culturaId`: Filtra pragas que atacam uma cultura específica (RF09).
    - `severidade`: Filtra por `BAIXA`, `MEDIA`, `ALTA`, `CRITICA`.
    - `search`: Busca textual em nome comum, nome científico, sintomas e métodos de combate.
  - **Retorno:** Lista de pragas com relação à cultura inclusa (`cultura: { id, nome }`).

* **`POST /api/pragas`**
  - **Acesso:** Restrito a perfil `ADMIN`.
  - **Payload:** `createPragaSchema` (`nome`, `nomeCientifico`, `descricao`, `sintomas`, `metodosCombate`, `severidadePadrao`, `culturaId`).

* **`GET /api/pragas/[id]`**, **`PUT /api/pragas/[id]`**, **`DELETE /api/pragas/[id]`**
  - **Acesso:** Consulta pública para autenticados; alteração/remoção restrita a `ADMIN`.

### 2.2 Ocorrências Fitossanitárias
* **`GET /api/ocorrencias`**
  - **Query Params:** `status` (`ABERTA`, `EM_ANALISE`, `RESOLVIDA`), `parcelaId`, `pragaId`, `severidade`, `search`.
  - **Isolamento de Segurança (RBAC):**
    - `AGRICULTOR`: Apenas ocorrências das parcelas de sua propriedade (`agricultorId === authUser.userId`).
    - `TECNICO`: Apenas ocorrências de agricultores vinculados na carteira (`TecnicoAgricultor`).
    - `ADMIN`: Todas as ocorrências do distrito de Nhamatanda.

* **`POST /api/ocorrencias`**
  - **Acesso:** `AGRICULTOR` (ou `TECNICO`/`ADMIN` em visita de campo).
  - **Payload:** `createOcorrenciaSchema` (`parcelaId`, `pragaId`, `descricao`, `severidade`, `fotoUrl`).
  - **Transação:**
    1. Criação do registo em `OcorrenciaPraga` com status inicial `ABERTA`.
    2. Identificação do técnico extensionista vinculado ao agricultor da parcela (`TecnicoAgricultor`).
    3. Disparo automático de `Alerta` do tipo `PRAGA_REPORTADA` com link direto para `/pragas/ocorrencias`.

* **`PATCH /api/ocorrencias/[id]/resolver`**
  - **Acesso:** Apenas `TECNICO` vinculado ou `ADMIN`.
  - **Payload:** `resolverOcorrenciaSchema` (`status`, `parecerTecnico`, `acaoRecomendada`).
  - **Regra de Segurança:** Se perfil for `TECNICO`, valida vínculo prévio com o agricultor da parcela reportada.
  - **Transação:**
    1. Atualização do registo: `status`, `parecerTecnico`, `acaoRecomendada`, `tecnicoResolutorId = authUser.userId`, `dataResolucao = new Date()`.
    2. Criação de notificação (`Alerta`) para o Agricultor:
       - *"Ocorrência fitossanitária respondida pelo técnico [Nome]. Parecer e medidas disponíveis."*

* **`GET /api/ocorrencias/estatisticas`**
  - Retorna contadores agregados em tempo real: `total`, `abertas`, `emAnalise`, `resolvidas`, `criticas`.

---

## 3. Arquitetura Frontend (`src/features/pragas`)

### 3.1 Camada de Serviços e Hooks
1. **`src/features/pragas/services/pragaService.ts`**:
   - `getPragas(filters)`
   - `getPragaById(id)`
   - `createPraga(data)`
   - `updatePraga(id, data)`
   - `deletePraga(id)`

2. **`src/features/pragas/services/ocorrenciaService.ts`**:
   - `getOcorrencias(filters)`
   - `getOcorrenciaById(id)`
   - `createOcorrencia(data)`
   - `resolverOcorrencia(id, data)`
   - `getEstatisticas()`

3. **`src/features/pragas/hooks/usePragas.ts`** e **`useOcorrencias.ts`**:
   - Gestão reativa de estados, paginação, filtros por cultura/status e mutações com feedback visual.

### 3.2 Componentes Visuais
* **`PragaCard.tsx`**:
  - Exibição em cartão com badge de severidade (`CRITICA`, `ALTA`, `MEDIA`, `BAIXA`), nome vulgar e científico em itálico, cultura associada, resumo dos sintomas e botão para ver métodos de combate detalhados.
* **`PragaFilters.tsx`**:
  - Filtro por cultura associada (dropdown populado dinamicamente), severidade e busca textual em tempo real.
* **`PragaDetailModal.tsx`**:
  - Modal com ficha técnica detalhada da praga: sintomas foliares/radiculares, métodos culturais, biológicos e químicos de controle.
* **`OcorrenciaStatsCards.tsx`**:
  - 4 cartões com contagem de ocorrências: Total, Abertas (com alerta âmbar), Em Análise e Resolvidas.
* **`OcorrenciaListTable.tsx` / `OcorrenciaCard.tsx`**:
  - Tabela e visualizador em cartões de ocorrências com foto, severidade, data, parcela, status e parecer emitido.
* **`OcorrenciaFormModal.tsx`**:
  - Formulário para reporte de suspeita de praga pelo produtor com seleção de parcela e praga opcional.
* **`OcorrenciaResolutionModal.tsx`**:
  - Modal para o extensionista do SDAE registrar o diagnóstico técnico, ações corretivas recomendadas e homologar a resolução.

### 3.3 Páginas de Interface
1. **`src/app/(dashboard)/pragas/page.tsx`**:
   - Catálogo de Pragas e Doenças com filtros por cultura afetada, visualizador em grelha responsiva e botão de acesso direto a ocorrências.
2. **`src/app/(dashboard)/pragas/ocorrencias/page.tsx`**:
   - Central de Ocorrências Fitossanitárias com abas: "Abertas", "Em Análise" e "Resolvidas", com ações contextuais para produtores e técnicos.

---

## 4. Matriz de Ficheiros Impactados e Criados

| Ficheiro | Camada | Ação | Descrição |
| :--- | :--- | :--- | :--- |
| `src/app/api/pragas/route.ts` | Backend API | Criar | Listagem e criação de pragas com filtro por cultura (RF09) |
| `src/app/api/pragas/[id]/route.ts` | Backend API | Criar | Consulta, atualização e remoção de pragas |
| `src/app/api/ocorrencias/route.ts` | Backend API | Criar | Listagem RBAC e reporte de ocorrências com alerta (RF10) |
| `src/app/api/ocorrencias/[id]/route.ts` | Backend API | Criar | Detalhe de ocorrência |
| `src/app/api/ocorrencias/[id]/resolver/route.ts` | Backend API | Criar | Homologação técnica e emissão de parecer pelo SDAE (RF11) |
| `src/app/api/ocorrencias/estatisticas/route.ts` | Backend API | Criar | Agregação de métricas de ocorrências fitossanitárias |
| `src/features/pragas/services/pragaService.ts` | Frontend Service | Criar | Integração HTTP para catálogo de pragas |
| `src/features/pragas/services/ocorrenciaService.ts` | Frontend Service | Criar | Integração HTTP para ocorrências fitossanitárias |
| `src/features/pragas/hooks/usePragas.ts` | Frontend Hook | Criar | Hook de gestão do catálogo de pragas |
| `src/features/pragas/hooks/useOcorrencias.ts` | Frontend Hook | Criar | Hook de gestão de ocorrências e resolução |
| `src/features/pragas/components/PragaCard.tsx` | Frontend UI | Criar | Cartão ilustrativo de praga |
| `src/features/pragas/components/PragaFilters.tsx` | Frontend UI | Criar | Filtros de catálogo por cultura e severidade |
| `src/features/pragas/components/PragaDetailModal.tsx` | Frontend UI | Criar | Modal com métodos de combate e sintomas |
| `src/features/pragas/components/OcorrenciaStatsCards.tsx` | Frontend UI | Criar | Cartões métricos de ocorrências |
| `src/features/pragas/components/OcorrenciaListTable.tsx` | Frontend UI | Criar | Tabela de ocorrências com badges de status |
| `src/features/pragas/components/OcorrenciaFormModal.tsx` | Frontend UI | Criar | Modal de reporte de ocorrência |
| `src/features/pragas/components/OcorrenciaResolutionModal.tsx` | Frontend UI | Criar | Modal de parecer técnico do SDAE |
| `src/features/pragas/components/index.ts` | Frontend UI | Criar | Barrel export de componentes de pragas |
| `src/features/pragas/index.ts` | Core Feature | Criar | Ponto central de exportação da feature |
| `src/app/(dashboard)/pragas/page.tsx` | Frontend Page | Modificar | Substituição de placeholder pela tela de catálogo |
| `src/app/(dashboard)/pragas/ocorrencias/page.tsx` | Frontend Page | Modificar | Substituição de placeholder pela tela de ocorrências |
| `scripts/verify-fase3-pragas.mjs` | Testes / QA | Criar | Script automatizado de testes de backend e RBAC |

---

## 5. Roteiro Passo a Passo de Execução

### Passo 1: Construção dos Endpoints de Backend
1. Criar `src/app/api/pragas/route.ts` e `src/app/api/pragas/[id]/route.ts`.
2. Criar `src/app/api/ocorrencias/route.ts` com isolamento RBAC e disparo de `AlertaTipo.PRAGA_REPORTADA`.
3. Criar `src/app/api/ocorrencias/[id]/resolver/route.ts` com validação de carteira técnica e notificação ao agricultor.
4. Criar `src/app/api/ocorrencias/estatisticas/route.ts`.

### Passo 2: Implementação da Camada Frontend
1. Criar `pragaService.ts` e `ocorrenciaService.ts`.
2. Criar os hooks reativos `usePragas.ts` e `useOcorrencias.ts`.
3. Desenvolver os componentes visuais em `src/features/pragas/components/`.
4. Exportar no arquivo central `src/features/pragas/index.ts`.

### Passo 3: Implementação das Páginas de Interface
1. Concluir `src/app/(dashboard)/pragas/page.tsx` conectando catálogo, filtro de culturas e visualizador detalhado.
2. Concluir `src/app/(dashboard)/pragas/ocorrencias/page.tsx` com abas de status, tabela, modais de reporte e resolução técnica.

### Passo 4: Testes Automatizados e Homologação
1. Implementar `scripts/verify-fase3-pragas.mjs` validando todos os cenários contra o PostgreSQL (Supabase).
2. Executar validação estática de tipagem (`npx tsc --noEmit`) assegurando zero erros.

---

## 6. Critérios de Aceitação da Fase 3

1. **RF09 Atendido:** Catálogo de pragas permite consulta e filtragem direta pela cultura hospedeira (`culturaId`).
2. **RF10 Atendido:** O produtor registra uma ocorrência na sua parcela e o técnico supervisor da carteira recebe alerta automático.
3. **RF11 Atendido:** O técnico do SDAE visualiza ocorrências abertas, emite parecer agronómico, prescreve medidas de controle e conclui o caso como `RESOLVIDA`.
4. **Segurança (RBAC):** Técnicos não podem resolver ocorrências de parcelas fora da sua carteira atribuída.
5. **Integração Visual:** Ambas as rotas `/pragas` e `/pragas/ocorrencias` renderizam sem placeholders e com dados reais.
6. **Homologação:** O script `scripts/verify-fase3-pragas.mjs` e `npx tsc --noEmit` executam com 100% de sucesso.
