# Plano Detalhado de Implementação — Fase 2

## Informações do Documento
* Módulo: Conclusão do Módulo de Leituras de Solo e Validação Técnica
* Requisitos Atendidos: RF03 (Registo de leituras), RF04 (Deteção de anomalias hídricas) e RF05 (Validação técnica por técnicos do SDAE)
* Projeto: KulimaTech (SDAE Nhamatanda / UniZambeze)
* Alvo: Fase 2 do Plano Geral de Engenharia (`doc/plano.md`)
* Pilha Tecnológica: Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma ORM 7.x, PostgreSQL (Supabase), Zod, Lucide React
* Versão: 1.0.0
* Data de Elaboração: Outubro de 2026

---

## 1. Escopo e Objetivos da Fase 2

A **Fase 2** transforma o registo e a monitorização de humidade do solo num fluxo de engenharia agronómica de ponta a ponta. Substitui a tela provisória em `/leituras` por uma central interativa, implementando as APIs de validação e o isolamento de carteira técnica (RBAC).

### Objetivos Centrais:
1. **Registo de Leituras (RF03):** Permitir ao agricultor registar medições manuais ou recolhidas por sensores na sua parcela, com cálculo automático de severidade hídrica.
2. **Deteção de Anomalias e Alertas (RF04):** Identificar estados críticos de humidade (<25% ou >55% ajustado por cultura) e disparar alertas imediatos para a carteira técnica do SDAE.
3. **Validação Técnica Agronómica (RF05):** Permitir que os técnicos do SDAE auditem as medições pendentes dos agricultores sob a sua supervisão, emitindo pareceres técnicos e homologando os dados (`validadoPorTecnico = true`).
4. **Métricas e Estatísticas Agregadas:** Disponibilizar médias de 7 e 30 dias, taxas de validação e distribuição por status para alimentar gráficos e tomadas de decisão.

---

## 2. Arquitetura das APIs REST (Backend)

### 2.1 Atualização de `GET /api/leituras` e `POST /api/leituras`
* **Localização:** `src/app/api/leituras/route.ts`
* **Melhorias a implementar:**
  - **Filtros Avançados via Query Params:**
    - `parcelaId` (string)
    - `validado` (`true` | `false` | `all`)
    - `statusHumidade` (`CRITICA` | `BAIXA` | `OPTIMA` | `EXCESSIVA`)
    - `agricultorId` (para técnicos/administradores filtrarem por agricultor específico)
    - `dataInicio` e `dataFim` (intervalo ISO de datas)
    - `page` e `limit` (paginação eficiente)
  - **Isolamento por Perfil (RBAC):**
    - `AGRICULTOR`: Apenas visualiza e insere leituras das suas próprias parcelas.
    - `TECNICO`: Visualiza leituras de parcelas dos agricultores vinculados na tabela `TecnicoAgricultor`.
    - `ADMIN`: Visualiza todas as leituras de Nhamatanda.
  - **Registo Aprimorado (POST):**
    - Validação de entrada via Zod (`createLeituraSchema`).
    - Verificação de humidade mínima da cultura ativa na parcela (quando associada a recomendações).
    - Disparo automático de `AlertaTipo.HUMIDADE_CRITICA` para o técnico supervisor da parcela.

### 2.2 Novo Endpoint: `PATCH /api/leituras/[id]/validar`
* **Localização:** `src/app/api/leituras/[id]/validar/route.ts`
* **Método:** `PATCH` (ou `POST`)
* **Autorização:** Apenas perfis `TECNICO` e `ADMIN`.
* **Regras de Negócio e Segurança:**
  - Se for `TECNICO`, verificar se o técnico tem vínculo ativo com o proprietário da parcela da leitura (`TecnicoAgricultor`). Caso contrário, retorna `403 Forbidden`.
  - Atualiza os campos persistidos na Fase 1:
    - `validadoPorTecnico = true` (ou `false` se invalidado)
    - `tecnicoValidadorId = authUser.userId`
    - `dataValidacao = new Date()`
    - `observacoesTecnicas = payload.observacoesTecnicas`
  - Cria um alerta no sistema (`Alerta`) notificando o Agricultor:
    - *"A sua leitura de humidade na parcela [Nome] foi validada pelo técnico [Nome do Técnico]."*

### 2.3 Novo Endpoint: `GET /api/leituras/estatisticas`
* **Localização:** `src/app/api/leituras/estatisticas/route.ts`
* **Query Params:** `parcelaId` (opcional)
* **Retorno estruturado (`LeituraEstatisticasDTO`):**
  - `totalLeituras`: Contagem total no período.
  - `pendentesValidacao`: Quantidade de leituras com `validadoPorTecnico == false`.
  - `leiturasCriticas`: Quantidade de medições com status `CRITICA`.
  - `mediaHumidade7Dias`: Média percentual da última semana.
  - `mediaHumidade30Dias`: Média percentual do último mês.
  - `distribuicaoStatus`: Contagens separadas para `CRITICA`, `BAIXA`, `OPTIMA` e `EXCESSIVA`.

---

## 3. Arquitetura Frontend (`src/features/leituras`)

### 3.1 Camada de Serviço e Hook Reativo
1. **`src/features/leituras/services/leituraService.ts`**:
   - `getLeituras(filters)`: Chamada tipada com query parameters dinâmicos.
   - `getLeituraById(id)`: Obtenção de detalhe com dados do técnico validador e parcela.
   - `createLeitura(data)`: Submissão de nova leitura de campo.
   - `validarLeitura(id, data)`: Homologação agronómica (`PATCH /api/leituras/[id]/validar`).
   - `getEstatisticas(parcelaId?)`: Obtenção dos agregados e métricas.

2. **`src/features/leituras/hooks/useLeituras.ts`**:
   - Estados: `leituras`, `estatisticas`, `loading`, `validatingId`, `error`, `filtros`.
   - Funções de mutação com atualização otimista ou revalidação instantânea:
     - `handleCreateLeitura(payload)`
     - `handleValidarLeitura(id, validado, observacoes)`
     - `refetchLeituras()`

### 3.2 Componentes Visuais Modulares
* **`LeituraStatsCards.tsx`**:
  - 4 cartões com ícones e cores dinâmicas:
    1. Total de Leituras Registadas (ícone `Activity`)
    2. Pendentes de Validação Técnica (ícone `Clock` / `AlertCircle`, amarelo/âmbar)
    3. Humidade Média Recente (ícone `Droplets`, azul/índigo)
    4. Anomalias Críticas Detetadas (ícone `AlertTriangle`, vermelho)
* **`HumidadeGaugeBar.tsx`**:
  - Barra visual indicativa dos limiares de humidade do solo (Crítica <25%, Baixa 25-35%, Ótima 35-55%, Excessiva >55%), com marcador gráfico do valor medido.
* **`LeituraFilters.tsx`**:
  - Seletor de parcelas do agricultor/técnico.
  - Seletor de estado de validação: *Todas*, *Pendentes de Validação*, *Validadas*.
  - Seletor de status hídrico: *Todos*, *Ótima*, *Baixa*, *Crítica*, *Excessiva*.
  - Campo de busca por texto / parcela.
* **`LeituraListTable.tsx`**:
  - Tabela responsiva com design moderno e alternância para cartões em ecrãs móveis:
    - Colunas: Data/Hora, Parcela Agrícola, Valor de Humidade (com indicador de cor), Status Hídrico, Validação Técnica (Badge com nome do técnico e data), Ações.
    - Botão de ação rápida **"Validar"** acessível a técnicos e administradores em leituras pendentes.
* **`LeituraFormModal.tsx`**:
  - Modal para registo de nova leitura de campo pelo agricultor ou técnico.
  - Validação de entrada em tempo real (0 a 100%).
  - Preview dinâmico imediato do status resultante (ex: "Crítica", "Ótima") conforme o agricultor digita a percentagem.
* **`ValidarLeituraModal.tsx`**:
  - Modal focado para o Técnico SDAE homologar a leitura.
  - Opções: *Aprovar Medição* / *Contestar/Rejeitar*.
  - Campo de texto para *Parecer / Recomendações Agronómicas Imediatas*.

### 3.3 Página Integrada: `src/app/(dashboard)/leituras/page.tsx`
* Substituição integral do placeholder por uma interface completa de nível empresarial.
* Layout responsivo com `DashboardLayout`, `useAuth` e navegação contextual.
* Abas operacionais:
  - **Aba "Todas as Leituras"**: Visão geral com filtros e tabela.
  - **Aba "Pendentes de Validação"**: Exclusiva para técnicos e admins com contagem em destaque (`Badge` numérico) para auditoria ágil.
  - **Aba "Métricas e Análise"**: Visualização gráfica comparativa das médias e anomalias.
* Botão de ação primária: **"Nova Leitura"** (com abertura do `LeituraFormModal`).

---

## 4. Matriz de Ficheiros Impactados e Criados

| Ficheiro | Camada | Ação | Descrição |
| :--- | :--- | :--- | :--- |
| `src/app/api/leituras/route.ts` | Backend API | Modificar | Adicionar paginação, filtros avançados e dados do técnico validador |
| `src/app/api/leituras/[id]/validar/route.ts` | Backend API | Criar | Endpoint seguro RBAC para validação de leituras |
| `src/app/api/leituras/estatisticas/route.ts` | Backend API | Criar | Endpoint agregador de estatísticas e métricas hídricas |
| `src/features/leituras/services/leituraService.ts` | Frontend Service | Criar | Cliente de integração HTTP para o módulo de leituras |
| `src/features/leituras/hooks/useLeituras.ts` | Frontend Hook | Criar | Hook de gestão de estado e mutações da interface |
| `src/features/leituras/components/LeituraStatsCards.tsx` | Frontend UI | Criar | Cartões de métricas hídricas e pendências |
| `src/features/leituras/components/HumidadeGaugeBar.tsx` | Frontend UI | Criar | Visualizador gráfico dos limiares de humidade |
| `src/features/leituras/components/LeituraFilters.tsx` | Frontend UI | Criar | Barra de filtros e pesquisa contextual |
| `src/features/leituras/components/LeituraListTable.tsx` | Frontend UI | Criar | Tabela interativa com badges de auditoria |
| `src/features/leituras/components/LeituraFormModal.tsx` | Frontend UI | Criar | Modal de submissão de nova leitura |
| `src/features/leituras/components/ValidarLeituraModal.tsx` | Frontend UI | Criar | Modal de emissão de parecer e homologação |
| `src/features/leituras/components/index.ts` | Frontend UI | Criar | Barrel export de todos os componentes |
| `src/features/leituras/index.ts` | Core Feature | Criar | Ponto central de exportação da feature |
| `src/app/(dashboard)/leituras/page.tsx` | Frontend Page | Modificar | Substituição do placeholder pela página completa |
| `scripts/verify-fase2-leituras.mjs` | Testes / QA | Criar | Script de testes automatizados de backend e RBAC |

---

## 5. Roteiro Passo a Passo de Execução

### Passo 1: Construção e Expansão dos Endpoints de Backend
1. Atualizar `src/app/api/leituras/route.ts` para suportar queries parametrizadas (`validado`, `statusHumidade`, `parcelaId`, etc.) e retornar `tecnicoValidador` populado.
2. Criar `src/app/api/leituras/[id]/validar/route.ts` com validação de perfil `TECNICO`/`ADMIN` e verificação da carteira técnica.
3. Criar `src/app/api/leituras/estatisticas/route.ts` com agregação via Prisma `$transaction`.

### Passo 2: Implementação da Camada de Integração Frontend
1. Implementar `leituraService.ts` conectando os novos endpoints com tipagem rígida `LeituraSoloDTO` e `ValidarLeituraDTO`.
2. Implementar `useLeituras.ts` para orquestração reativa de estado, chamadas assíncronas e feedback com toasts/alertas.

### Passo 3: Criação dos Componentes de UI
1. Desenvolver `LeituraStatsCards.tsx`, `HumidadeGaugeBar.tsx` e `LeituraFilters.tsx`.
2. Desenvolver `LeituraListTable.tsx` com renderização de estados de humidade e badges de validação técnica.
3. Desenvolver os modais interativos `LeituraFormModal.tsx` e `ValidarLeituraModal.tsx`.
4. Configurar barrel exports em `src/features/leituras/components/index.ts` e `src/features/leituras/index.ts`.

### Passo 4: Integração da Página Principal
1. Reformular `src/app/(dashboard)/leituras/page.tsx` com layout profissional, abas operacionais dinâmicas e suporte a Agricultor, Técnico e Administrador.
2. Garantir design responsivo para desktop e mobile com animações sutis (`framer-motion` ou transições CSS).

### Passo 5: Testes Automatizados e Homologação
1. Criar `scripts/verify-fase2-leituras.mjs` testando:
   - Inserção de leituras e cálculo de status.
   - Disparo de alertas em caso de anomalia crítica.
   - Endpoint de estatísticas.
   - Validação técnica por técnico autorizado vs bloqueio para técnico não vinculado.
2. Executar script com sucesso e verificar integridade estática do TypeScript (`npx tsc --noEmit`).

---

## 6. Critérios de Aceitação da Fase 2

A Fase 2 será considerada homologada quando:
1. **RF03 Atendido:** O agricultor consegue cadastrar uma leitura de humidade na sua parcela e vê-la listada no histórico.
2. **RF04 Atendido:** Leituras com humidade crítica (<25%) disparam alertas automáticos para o técnico supervisor da parcela.
3. **RF05 Atendido:** O técnico do SDAE visualiza a aba de leituras pendentes, abre o modal de validação, insere notas técnicas e homologa a medição (`validadoPorTecnico = true`).
4. **Isolamento de Segurança (RBAC):** Técnicos não conseguem validar leituras de parcelas de agricultores fora da sua carteira; agricultores não têm permissão para validar medições.
5. **Teste Automatizado:** O script `scripts/verify-fase2-leituras.mjs` executa sem erros contra o Supabase.
6. **Compilação TypeScript:** `npx tsc --noEmit` executa com zero erros.
