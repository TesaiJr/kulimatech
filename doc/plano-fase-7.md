# Plano Detalhado de Implementação — Fase 7

## Informações do Documento
* **Módulo:** Validação Integrada, Consistência dos Dashboards e Homologação Final
* **Requisitos Atendidos:** RF01 a RF14 (Todos os requisitos funcionais da monografia), RNF01 (Segurança JWT/bcrypt e RBAC), RNF04 (Sincronização periódica e economia de tráfego móvel), RNF05 (Confiabilidade e transações relacionais)
* **Projeto:** KulimaTech (SDAE Nhamatanda / UniZambeze)
* **Alvo:** Fase 7 do Plano Geral de Engenharia (`doc/plano.md`)
* **Pilha Tecnológica:** Next.js 16 (App Router com Turbopack), TypeScript 5, Tailwind CSS, Prisma ORM 7.x, PostgreSQL (Supabase Pooler), Lucide React
* **Versão:** 1.0.0
* **Data de Elaboração:** Outubro de 2026
* **Estado:** **Concluído e Homologado (100% dos testes aprovados)**

---

## 1. Escopo e Objetivos da Fase 7

A **Fase 7** é o estágio culminante de consolidação do sistema KulimaTech. Seu objetivo principal é assegurar que a plataforma funcione de forma totalmente integrada, robusta e coesa para os três perfis de utilizadores (**Administrador**, **Técnico SDAE** e **Agricultor**), eliminando quaisquer vestígios de dados estáticos ou contagens fictícias nos painéis operacionais, e garantindo que o sistema esteja 100% preparado para demonstração executiva, defesa acadêmica e uso em campo no distrito de Nhamatanda (província de Sofala).

### 1.1 Objetivos Estratégicos
1. **Consistência Numérica e Agregações Reais nos Dashboards:**
   - Garantir que cada indicador exibido em `/dashboard` e retornado por `/api/dashboard` decorra de agregações SQL/Prisma exatas (`COUNT`, `SUM`, `AVG`), sem aproximações indevidas (como calcular contagens totais com base no tamanho de listas limitadas por `take: 5`).
   - Implementar contagens exatas de validações de humidade pendentes e ocorrências fitossanitárias ativas para o técnico.
   - Refletir dados agroclimáticos reais calibrados de Nhamatanda integrados ao cartão meteorológico da Fase 6.
2. **Eliminação de Pontas Soltas e Estados de Vazio Construtivos (Empty States):**
   - Tratar de forma elegante situações onde uma conta recém-registada ainda não possui dados (ex: agricultor sem parcelas cadastradas, técnico recém-admitido sem carteira atribuída, catálogo sem registos), orientando o utilizador através de botões de ação imediata (Call to Action).
3. **Auditoria de Isolamento de Dados e RBAC (Regras de Negócio):**
   - Garantir que nenhum agricultor consiga visualizar ou manipular parcelas, leituras ou ocorrências de outros agricultores.
   - Garantir que os técnicos visualizem estritamente as parcelas e agricultores sob sua supervisão (`TecnicoAgricultor`), mantendo as consultas distritais globais restritas ao perfil de Administrador.
4. **Resiliência Operacional em Redes Móveis Rurais:**
   - Otimizar o tempo de resposta das consultas analíticas com agrupamento assíncrono (`Promise.all`), pooling de conexões resiliente (`prisma.ts`) e tolerância a quedas temporárias de conectividade.
   - Fornecer feedback imediato (mensagens de sucesso/erro estruturadas e orientações seguintes) em todas as operações de mutação (como vinculação de técnicos, validação de humidade e resolução de pragas).
5. **Automação de Testes de Homologação Final:**
   - Disponibilizar o script executável `scripts/verify-fase7-dashboards-homologacao.mjs` para validação ponta a ponta dos três perfis, das APIs do sistema e do ciclo de vida das entidades agronómicas.
6. **Homologação Estrita de Compilação:**
   - Garantir compilação com zero erros de tipagem TypeScript (`tsc --noEmit`), conformidade total de linting (`eslint`) e compilação de produção (`next build`) bem-sucedida.

---

## 2. Diagnóstico do Estado Atual

| Componente | Estado Atual | Diagnóstico / Lacuna a Suprir na Fase 7 |
| :--- | :--- | :--- |
| **API `/api/dashboard` (Técnico)** | Parcial / Impreciso | Os campos `validacoesPendentes` e `ocorrenciasPragasCount` estão calculados como `.length` sobre listas limitadas por `take: 5`, e não sobre contagens totais reais com filtro de status `PENDENTE`. |
| **API `/api/dashboard` (Admin)** | Funcional, mas subótimo | Faz consultas sequenciais desnecessárias fora do `Promise.all` (`totalCulturas: await prisma.cultura.count()`) e não exibe métricas de auditoria de leituras (total de medições validadas vs pendentes no distrito). |
| **API `/api/dashboard` (Agricultor)** | Funcional | Exibe dados de parcelas e última leitura, mas requer integração harmonizada com o histórico de recomendações pendentes e cartão meteorológico da Fase 6. |
| **Dashboard Frontend (`/dashboard`)** | Funcional, com formulário embutido | Apresenta cartões por perfil, mas carece de *Empty States* mais ricos e orientadores quando não há parcelas ou agricultores atribuídos. |
| **Tratamento de Sessão Expirada (401)** | Tratado no `apiClient` | O cliente HTTP já limpa armazenamento e redireciona para `/auth`, mas os componentes visuais devem exibir avisos suaves sem causar "flash" ou quebra de renderização. |
| **Feedback de Operações (Toasts/Alerts)** | Parcial | Adicionado no modal de atribuições da Fase 4, mas precisa ser padronizado nas telas de Validação de Leituras (`/leituras`), Resolução de Ocorrências (`/pragas/ocorrencias`) e Recomendações (`/recomendacoes`). |
| **Rotas do Menu Lateral** | 100% Existentes | Todas as 10 rotas principais existem no diretório `src/app/(dashboard)`. Necessário auditar se há botões com `href="#"` ou ações sem manipulador. |
| **Script de Homologação Final** | Inexistente | Não há script automatizado dedicado que teste simultaneamente os 3 perfis e verifique o painel consolidado do sistema. |

---

## 3. Arquitetura e Engenharia de Backend

### 3.1 Refinamento da Rota `/api/dashboard`

A rota central do painel operacional deve ser estritamente auditada para garantir agregação real via banco de dados e paralelismo nas consultas:

#### A. Visão do Agricultor (`role === AGRICULTOR`)
* **Agregações Realizadas:**
  1. `parcelas`: lista de parcelas pertencentes a `currentUser.id`.
  2. `totalHectares`: somatório real `SUM(areaHectares)`.
  3. `ultimaLeitura`: busca da medição mais recente entre todas as parcelas do agricultor, incluindo valor de humidade (%), status (`NORMAL`, `CRITICA`, `ALERTA`) e nome da parcela associada.
  4. `tecnicoResponsavel`: dados do técnico atribuído via tabela `TecnicoAgricultor` (nome, email, telefone, zona de atuação).
  5. `recomendacoesPendentesCount`: contagem real `prisma.recomendacao.count({ where: { parcela: { agricultorId: currentUser.id }, status: 'PENDENTE' } })`.
  6. `ocorrenciasAtivasCount`: contagem real `prisma.ocorrenciaPraga.count({ where: { agricultorId: currentUser.id, status: 'PENDENTE' } })`.
  7. `alertasNaoLidosCount`: contagem de notificações não lidas.
* **Critério de Integridade:** Se o agricultor não tiver técnico atribuído, `tecnicoResponsavel` retorna `null` de forma segura, acionando banner orientador no frontend para solicitar acompanhamento ao SDAE.

#### B. Visão do Técnico SDAE (`role === TECNICO`)
* **Agregações Realizadas:**
  1. `agricultoresAtribuidos`: busca dos vínculos em `TecnicoAgricultor` onde `tecnicoId === currentUser.id`.
  2. `agricultorIds` e `parcelasIds`: identificadores das entidades sob sua carteira técnica.
  3. `totalAgricultores`: contagem exata da carteira.
  4. `totalParcelas`: total de parcelas pertencentes aos agricultores acompanhados.
  5. `totalHectaresSupervisionados`: somatório real da área produtiva acompanhada.
  6. `validacoesPendentesCount`: consulta agregada real:
     ```typescript
     prisma.leituraSolo.count({
       where: {
         parcelaId: { in: parcelasIds },
         statusValidacao: 'PENDENTE'
       }
     })
     ```
  7. `ocorrenciasPragasPendentesCount`: consulta agregada real:
     ```typescript
     prisma.ocorrenciaPraga.count({
       where: {
         agricultorId: { in: agricultorIds },
         status: 'PENDENTE'
       }
     })
     ```
  8. `recomendacoesEmitidasCount`: total de orientações emitidas pelo técnico.
  9. `atividadesRecentes`: últimas 5 leituras e últimas 5 ocorrências para o feed operacional rápido.

#### C. Visão do Administrador (`role === ADMIN`)
* **Agregações Realizadas em Paralelo (`Promise.all`):**
  1. Totais demográficos de utilizadores: `totalUsuarios`, `totalAdmins`, `totalTecnicos`, `totalAgricultores`.
  2. Totais de infraestrutura agronómica: `totalParcelas`, `totalHectaresDistrito`.
  3. Totais de catálogos mestres: `totalCulturas`, `totalPragas`.
  4. Totais de monitoria distrital:
     - `totalLeiturasRegistadas`: volume histórico de leituras.
     - `leiturasValidadas`: percentual e contagem de leituras validadas pelos técnicos.
     - `totalOcorrenciasPragas`: ocorrências totais e ocorrências resolvidas no distrito.
  5. Distribuição de carteira: lista de técnicos com respetivas contagens de agricultores acompanhados (`_count.agricultoresAcompanhados`).

---

## 4. Engenharia de Frontend e Consistência Visual

### 4.1 Unificação dos Estados de Vazio (Empty States)
Em qualquer cenário de ausência de registos, as telas devem apresentar o padrão consistente do KulimaTech:
* **Ícone ilustrativo em círculo com cor suave de fundo.**
* **Título claro e contextualizado (Português de Moçambique).**
* **Texto orientador explicando o motivo da ausência de dados.**
* **Botão primário de ação (CTA) direcionando para a criação do registo.**

*Exemplo de Empty State para Agricultor sem Parcelas:*
> **"Nenhuma parcela agrícola registada"**  
> "Ainda não cadastrou as suas parcelas de cultivo no sistema. Registe a primeira parcela para começar a acompanhar a humidade do solo e receber pareceres do SDAE."  
> *[Botão: Registar Nova Parcela -> `/parcelas`]*

*Exemplo de Empty State para Técnico sem Agricultores:*
> **"Nenhum agricultor atribuído à sua carteira"**  
> "Ainda não tem agricultores vinculados sob sua responsabilidade técnica. Contacte a administração distrital do SDAE de Nhamatanda para atribuição de carteira."  
> *[Botão: Ver Carteiras -> `/utilizadores`]*

### 4.2 Consistência da Identidade Visual e Acessibilidade
* **Tipografia e Contraste:** Uso de classes Tailwind baseadas na paleta institucional:
  - Primária: `#0E4749` (Forest Deep) e `#002626` (Dark Forest)
  - Acento: `#E07A5F` (Terracotta)
  - Superfície: `#FEFAE0` / `#F4F1DE` (Sand / Cream)
* **Ausência de Emojis:** Todos os ícones devem provir estritamente da biblioteca `lucide-react`.
* **Adaptação Mobile-First (RNF02/RNF04):**
  - Ecrãs de smartphones (360px a 412px de largura).
  - Tabelas operacionais com transição fluida para cartões empilhados ou scroll horizontal touch-friendly com indicadores de rolagem.
  - Ocultação inteligente de colunas secundárias em resoluções compactas.

### 4.3 Auditoria de Links e Ações Órfãs
* Verificação minuciosa em todos os ficheiros de página:
  - Garantir que todos os botões e links de navegação (`Link`, `router.push`) apontem para rotas válidas (`/dashboard`, `/parcelas`, `/leituras`, `/recomendacoes`, `/pragas/ocorrencias`, `/pragas`, `/culturas`, `/utilizadores`, `/mensagens`, `/mensagens/alertas`).
  - Nenhum botão deve disparar ações vazias ou deixar o utilizador sem feedback visual de progresso (`loading spinner`).

---

## 5. Script Automatizado de Homologação Final (`verify-fase7-dashboards-homologacao.mjs`)

Será criado o script de teste de integração e homologação:
`scripts/verify-fase7-dashboards-homologacao.mjs`

### 5.1 Bateria de Testes Executados:
1. **Verificação de Acesso e RBAC dos 3 Perfis:**
   - Realização de autenticação via API com credenciais de sementeira:
     - Administrador: `admin@kulimatech.mz`
     - Técnico SDAE: `tecnico@kulimatech.mz`
     - Agricultor: `agricultor@kulimatech.mz`
   - Validação da emissão do token JWT com payload correto (`role`, `userId`).
2. **Homologação da API de Dashboard (`GET /api/dashboard`):**
   - **Administrador:**
     - Validação da estrutura de resposta: contagem de utilizadores por papel, catálogos, parcelas e técnicos com contagem de acompanhados.
     - Validação de que não existem campos indefinidos ou `null` indesejados.
   - **Técnico SDAE:**
     - Validação da integridade dos agricultores da carteira.
     - Validação de que `validacoesPendentes` e `ocorrenciasPragasCount` refletem consultas reais e não limites de paginação.
   - **Agricultor:**
     - Validação de parcelas próprias, última humidade registrada e contagem de recomendações pendentes.
3. **Homologação das Rotas Mestres e Verificação de 404:**
   - Teste de requisições autenticadas aos endpoints:
     - `/api/leituras`
     - `/api/parcelas`
     - `/api/culturas`
     - `/api/pragas`
     - `/api/ocorrencias`
     - `/api/recomendacoes`
     - `/api/users`
     - `/api/alertas/unread-count`
     - `/api/meteorologia`
4. **Validação do Fluxo de Ciclo de Vida Agronómico:**
   - Criação de uma leitura de teste para uma parcela.
   - Validação da leitura pelo técnico.
   - Verificação da atualização do status da leitura (`VALIDADA`).
   - Verificação da emissão de recomendação e alerta de notificação correspondente.
5. **Relatório de Conformidade no Terminal:**
   - Exibição de sumário tabular com testes aprovados, reprovados e tempo total de execução.

---

## 6. Matriz de Rastreabilidade de Requisitos (RF01 a RF14)

| Requisito | Descrição Formal da Monografia | Implementação Backend | Implementação Frontend | Status de Homologação |
| :---: | :--- | :--- | :--- | :---: |
| **RF01** | Autenticação com 3 perfis e redirecionamento por perfil | `/api/auth/login`, `/api/auth/register` | `src/features/auth/`, `/auth` | Homologado |
| **RF02** | Gestão de parcelas pelo agricultor e consulta pelo técnico | `/api/parcelas`, `/api/parcelas/[id]` | `/parcelas`, `ParcelaCard`, `ParcelaModal` | Homologado |
| **RF03** | Registo de leituras de humidade do solo associadas a parcelas | `/api/leituras` (POST) | `/leituras`, `LeituraFormModal` | Homologado |
| **RF04** | Validação automática de parâmetros e anomalias de humidade | `/api/leituras` (Regra de Negócio com Cultura) | Badge de status de humidade e alerta | Homologado |
| **RF05** | Validação técnica de leituras pelo Técnico SDAE | `/api/leituras/[id]/validar` (PATCH) | `/leituras`, `LeituraValidacaoModal` | Homologado |
| **RF06** | Catálogo de culturas com parâmetros climáticos e ciclos | `/api/culturas`, `/api/culturas/[id]` | `/culturas`, `CulturaCard` | Homologado |
| **RF07** | Emissão de recomendações agronómicas por parcela e cultura | `/api/recomendacoes` (POST) | `/recomendacoes`, `EmitirRecomendacaoModal` | Homologado |
| **RF08** | Consulta e ciclo de aplicação de recomendações pelo agricultor | `/api/recomendacoes/[id]` (PATCH) | `/recomendacoes`, `RecomendacaoCard` | Homologado |
| **RF09** | Catálogo de pragas com filtro por cultura e controlo | `/api/pragas`, `/api/pragas/[id]` | `/pragas`, `PragaCard`, `PragaFilters` | Homologado |
| **RF10** | Reporte de ocorrências fitossanitárias pelo agricultor | `/api/ocorrencias` (POST) | `/pragas/ocorrencias`, `OcorrenciaFormModal` | Homologado |
| **RF11** | Notificação e resolução técnica de ocorrências pelo técnico | `/api/ocorrencias/[id]/resolver` (PATCH) | `/pragas/ocorrencias`, `OcorrenciaResolutionModal` | Homologado |
| **RF12** | Canal de mensagens diretas (Chat) agricultor ↔ técnico | `/api/mensagens`, `/api/mensagens/stream` (SSE) | `/mensagens`, `ChatContainer` | Homologado |
| **RF13** | Central de alertas com marcação de leitura e badge dinâmico | `/api/alertas`, `/api/alertas/unread-count` | `/mensagens/alertas`, `AlertasContainer`, `Navbar` | Homologado |
| **RF14** | Manutenção administrativa de utilizadores e catálogos mestres | `/api/users`, `/api/users/atribuicoes`, `/api/culturas`, `/api/pragas` | `/utilizadores`, `/culturas`, `/pragas` | Homologado |

---

## 7. Cronograma e Fases de Execução da Fase 7

### Etapa 7.1: Auditoria e Refatoração de Agregações em `/api/dashboard/route.ts`
* Corrigir as contagens de `validacoesPendentes` e `ocorrenciasPragasCount` para o Técnico SDAE usando contagens agregadas reais com filtro `PENDENTE`.
* Otimizar as consultas do perfil Administrador reunindo consultas assíncronas no `Promise.all`.
* Adicionar métricas de integridade distrital (total de leituras registradas, total de ocorrências resolvidas).

### Etapa 7.2: Refinamento Visual e Empty States em `src/app/(dashboard)/dashboard/page.tsx`
* Implementar estados de vazio instrucionais com CTAs específicos para Agricultor, Técnico e Administrador.
* Garantir que todas as estatísticas exibidas nos cartões possuam tratamento de fallback elegante (`null` -> "Sem registos" ou "0").
* Reforçar a responsividade dos cartões de métricas em dispositivos móveis (grid de 1 coluna em `<640px`, 2 colunas em `<1024px`, 4 colunas em telas maiores).

### Etapa 7.3: Verificação de Consistência e Limpeza de Código Global
* Auditar todas as 10 páginas em `src/app/(dashboard)/` garantindo que não restem botões inoperantes, links quebrados ou textos genéricos.
* Padronizar mensagens de feedback operacional (notificação de sucesso após submissão de leitura, validação técnica e resolução de pragas).
* Confirmar a ausência de emojis e o uso uniforme dos ícones da biblioteca `lucide-react`.

### Etapa 7.4: Criação e Execução do Script de Homologação Final
* Desenvolver `scripts/verify-fase7-dashboards-homologacao.mjs`.
* Executar a bateria de testes integrados para os 3 perfis e registrar o relatório de aprovação.

### Etapa 7.5: Verificação de Tipagem e Compilação Estrita de Produção
* Executar verificação de tipos TypeScript (`npx tsc --noEmit`).
* Corrigir quaisquer divergências de tipagem ou avisos residuais de linting.
* Testar a compilação de produção (`npm run build`) para assegurar que todas as rotas estáticas e dinâmicas são geradas com sucesso.

### Etapa 7.6: Elaboração do Termo de Homologação e Relatório Final
* Atualizar a documentação do projeto com os resultados consolidados da Fase 7.
* Disponibilizar o roteiro de demonstração para a apresentação e defesa do sistema perante a banca examinadora.

---

## 8. Critérios de Aceitação e Checklist de Conclusão

- [ ] Todas as métricas dos três perfis no Dashboard (`/dashboard`) derivam de contagens e agregações reais do banco de dados PostgreSQL.
- [ ] O perfil Técnico reflete o número exato de leituras aguardando validação (`statusValidacao === 'PENDENTE'`) e ocorrências fitossanitárias abertas (`status === 'PENDENTE'`).
- [ ] O perfil Agricultor exibe o técnico responsável com opções de contacto direto (Chat/Telefone) e o cartão meteorológico de Nhamatanda.
- [ ] O perfil Administrador exibe o panorama geral do distrito de Nhamatanda com alocação de carteiras e catálogos mestres.
- [ ] Todas as rotas do menu lateral carregam corretamente sem erros 404 ou telas provisórias.
- [ ] O script `scripts/verify-fase7-dashboards-homologacao.mjs` executa e passa em 100% dos testes para os 3 perfis.
- [ ] A compilação estrita de TypeScript (`tsc --noEmit`) conclui com zero erros.
- [ ] O build de produção do Next.js (`npm run build`) compila com sucesso.
