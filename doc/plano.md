# Plano de Engenharia e Conclusão do Sistema KulimaTech

## Informações do Documento
* Projeto: Sistema de Informação e Apoio à Tomada de Decisão Agrícola (KulimaTech)
* Instituição: Universidade Zambeze (UniZambeze) / SDAE de Nhamatanda (Sofala, Moçambique)
* Documentos de Referência: Monografia Acadêmica (2026), Especificação Técnica de Requisitos e Auditoria Inicial
* Pilha Tecnológica: Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, Supabase (PostgreSQL, Auth, Storage)
* Versão: 1.0.0
* Data de Elaboração: Outubro de 2026

---

## 1. Introdução e Contexto Operacional

O sistema KulimaTech é uma plataforma digital desenvolvida para responder aos desafios de extensão agrária no distrito de Nhamatanda, província de Sofala, Moçambique. O objetivo central é fornecer apoio sistemático à tomada de decisão para agricultores familiares e técnicos dos Serviços Distritais de Actividades Económicas (SDAE).

A solução articula três perfis de utilizadores:
1. Agricultor: Registo de parcelas agrícolas, submissão de leituras de humidade do solo, consulta de recomendações técnicas, reporte de ocorrências de pragas e comunicação direta com o seu técnico supervisor.
2. Técnico SDAE: Supervisão da sua carteira de agricultores e respetivas parcelas, validação agronómica de leituras de humidade, emissão de recomendações técnicas personalizadas, gestão de ocorrências fitossanitárias e canal de esclarecimento de dúvidas.
3. Administrador: Gestão global do sistema, aprovação e criação de contas de técnicos, atribuição de agricultores a técnicos específicos, e manutenção dos catálogos mestres de culturas e de pragas/doenças.

Este documento estabelece o plano formal de trabalho para a conclusão integral dos módulos de backend e frontend pendentes, assegurando conformidade estrita com os requisitos funcionais (RF01 a RF14) e não funcionais estabelecidos na documentação de engenharia.

---

## 2. Diagnóstico do Estado Atual do Repositório

### 2.1 Componentes Implementados e Funcionais
* Arquitetura Base: Next.js App Router com suporte a Server/Client Components, Tailwind CSS e configuração de tema institucional (paleta verde-escuro, acentos e fundo suave).
* Autenticação e RBAC: Fluxo de registo público para agricultores, login com validação de senha (bcrypt) e geração de tokens JWT com isolamento por perfil (ADMIN, TECNICO, AGRICULTOR).
* Portal Institucional: Landing page completa com seções de apresentação, metodologia operacional, parceria institucional SDAE/UniZambeze e chamada para ação.
* Módulo de Parcelas (RF02): Schema Prisma, endpoints REST (/api/parcelas) com isolamento por perfil, formulário de cadastro, tabela, cartões visuais e filtros por tipo de solo e texto.
* Módulo de Catálogo de Culturas (RF06): Schema Prisma, endpoint de consulta (/api/culturas), tela de listagem (/culturas) com filtros por humidade, ciclo vegetativo e busca textual.
* Módulo de Recomendações (RF07, RF08): Modelagem de dados, endpoint de emissão (/api/recomendacoes) com vínculos a parcelas e culturas, e vinculação com alertas.
* Módulo de Comunicação Básica (RF12): Schema Prisma para mensagens diretas entre agricultor e técnico, endpoints (/api/mensagens) e interface de chat com listagem de contatos.
* Módulo de Alertas Básico (RF13): Schema Prisma para alertas, endpoint (/api/alertas) para listagem e contagem de itens não lidos.
* Dashboard Base: Endpoint consolidado (/api/dashboard) retornando métricas específicas para os três perfis de utilizador.

### 2.2 Lacunas e Pendências Identificadas
1. Validação de Leituras de Solo (RF04, RF05):
   * O modelo LeituraSolo no Prisma não possui os campos validadoPorTecnico (Boolean) e dataValidacao (DateTime), impossibilitando o registo formal da validação agronómica pelo técnico.
   * A rota /leituras no frontend é uma página provisória (placeholder). Falta a interface do Agricultor para consulta histórica e a interface do Técnico para validação e auditoria das medições pendentes.
2. Catálogo e Ocorrências de Pragas (RF09, RF10, RF11):
   * O Prisma possui os modelos Praga e OcorrenciaPraga, mas não existem rotas de API em /api/pragas ou /api/ocorrencias.
   * As páginas /pragas e /pragas/ocorrencias são atualmente páginas provisórias vazias no frontend.
3. Gestão Administrativa de Utilizadores e Atribuições (RF14):
   * A rota /api/users implementa apenas a consulta (GET). Faltam endpoints para registo administrativo de técnicos, alteração de estado (ativo/inativo) e vinculação de agricultores a técnicos na tabela TecnicoAgricultor.
   * A interface /utilizadores é uma página provisória (placeholder).
4. Gestão Administrativa Plena dos Catálogos Mestres:
   * As operações de atualização (PUT) e remoção (DELETE) de culturas e pragas não estão disponíveis para administradores em interfaces dedicadas.
5. Sincronização Dinâmica de Alertas e Mensagens:
   * Falta mecanismo de atualização periódica ativa (polling a cada 30 segundos conforme especificação) ou integração Realtime para os contadores da barra de navegação e para a lista de mensagens.
6. Integração Meteorológica Local:
   * Os dados meteorológicos no painel do agricultor utilizam valores estáticos de demonstração. Falta a integração com a API aberta Open-Meteo com as coordenadas geográficas do distrito de Nhamatanda.
7. Dashboards com Valores Nulos:
   * Algumas contagens nos cartões dos painéis de Técnico e Administrador não estão totalmente alimentadas com agregados reais do banco de dados.

---

## 3. Matriz de Requisitos Funcionais e Rastreabilidade

| Requisito | Descrição Técnica | Estado Atual | Ação Necessária no Plano |
| :--- | :--- | :--- | :--- |
| RF01 | Autenticação e RBAC para Administrador, Técnico e Agricultor | Concluído | Manutenção e testes de segurança |
| RF02 | Gestão e consulta de parcelas com isolamento por perfil | Concluído | Integração final de seleção em formulários |
| RF03 | Registo de leituras de humidade do solo por parcela | Parcial | Concluir interface dedicada de histórico |
| RF04 | Deteção automática de anomalias hídricas e alerta ao técnico | Concluído | Refinar parâmetros por cultura |
| RF05 | Validação de leituras de humidade pelo Técnico SDAE | Em Falta | Adicionar campo no Prisma e criar tela de validação |
| RF06 | Catálogo de culturas com parâmetros climáticos e ciclo | Concluído | Conectar com criação de recomendações |
| RF07 | Emissão de recomendações técnicas por parcela e cultura | Parcial | Criar interface visual de emissão no painel |
| RF08 | Consulta e notificação de recomendações para o agricultor | Parcial | Criar componente visual de cartões de recomendação |
| RF09 | Catálogo de pragas com sintomas e filtro por cultura | Em Falta | Implementar API e interface completa |
| RF10 | Reporte de ocorrência de praga pelo agricultor com fotos | Em Falta | Implementar API, formulário e upload de imagem |
| RF11 | Acompanhamento e resolução de ocorrências pelo técnico | Em Falta | Criar fluxo de parecer técnico e encerramento |
| RF12 | Canal de mensagens diretas entre agricultor e técnico | Concluído | Adicionar polling periódico de 30 segundos |
| RF13 | Central de alertas com marcação de leitura | Parcial | Conectar indicador na barra superior e polling |
| RF14 | Gestão administrativa de contas, vínculos e catálogos | Em Falta | Implementar tela de utilizadores e CRUD mestre |

---

## 4. Fases de Execução do Plano

O plano está estruturado em 7 fases sequenciais, concebidas segundo a metodologia ágil Scrum para garantir que cada entrega resulte em módulos completos, testados e integrados entre backend e frontend.

```
+-----------------------------------------------------------------------------------+
| FASE 1: Atualização do Modelo de Dados e Infraestrutura no Prisma / PostgreSQL     |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| FASE 2: Conclusão do Módulo de Leituras de Solo e Validação Técnica (RF03, 04, 05) |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| FASE 3: Módulo Completo de Pragas e Ocorrências Fitossanitárias (RF09, 10, 11)    |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| FASE 4: Módulo de Administração de Utilizadores e Carteiras Técnicas (RF14)        |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| FASE 5: Interface de Recomendações Técnicas e Catálogos Mestres (RF07, 08, 14)    |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| FASE 6: Central de Alertas, Comunicação Dinâmica e Meteorologia Open-Meteo        |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| FASE 7: Validação Integrada, Consistência dos Dashboards e Homologação Final       |
+-----------------------------------------------------------------------------------+
```

---

### Fase 1: Atualização do Modelo de Dados e Infraestrutura no Prisma / PostgreSQL

#### Objetivo
Alinhar o esquema do Prisma ORM e a base de dados PostgreSQL no Supabase com a totalidade dos requisitos da monografia, introduzindo os campos indispensáveis para validação técnica e consistência relacional.

#### Entregáveis de Backend
1. Atualização do ficheiro prisma/schema.prisma:
   * Modelo LeituraSolo: Adicionar os campos validadoPorTecnico (Boolean, padrão false), tecnicoValidadorId (String opcional com relação a User) e dataValidacao (DateTime opcional).
   * Modelo Praga: Adicionar relação formal com Cultura (culturaId opcional como chave estrangeira) para atender ao filtro de pragas por cultura afetada (RF09).
   * Modelo OcorrenciaPraga: Adicionar campos acaoRecomendada (String opcional) e dataResolucao (DateTime opcional).
2. Execução da migração do banco de dados:
   * Execução de npx prisma db push ou geração da migração versionada.
   * Validação dos novos tipos TypeScript gerados via npx prisma generate.
3. Atualização dos utilitários de seed e tipos centrais:
   * Ajuste dos ficheiros em src/types/ e src/lib/prisma.ts para suportar as novas propriedades tipadas.

#### Critérios de Aceitação
* O esquema Prisma compila sem erros.
* O comando npx prisma generate executa com êxito.
* As novas colunas estão disponíveis para consulta no cliente Prisma.

---

### Fase 2: Conclusão do Módulo de Leituras de Solo e Validação Técnica (RF03, RF04, RF05)

#### Objetivo
Substituir a página provisória de leituras por uma interface operacional e implementar o fluxo completo de validação agronómica pelo Técnico SDAE.

#### Entregáveis de Backend
1. Atualização de src/app/api/leituras/route.ts:
   * Adicionar suporte a paginação e filtros por intervalo de datas, status de validação (validado=true/false) e nível de humidade.
   * No registo de nova leitura (POST), além da regra de anomalia existente, comparar o valor com a humidadeMinima da cultura ativa na parcela (quando houver).
2. Criação do endpoint de validação técnica:
   * Rota: PATCH /api/leituras/[id]/validar
   * Validação de permissão: Apenas utilizadores com papel TECNICO ou ADMIN têm autorização. Técnicos só podem validar leituras pertencentes aos agricultores da sua carteira.
   * Ação: Atualizar validadoPorTecnico = true, atribuir tecnicoValidadorId = session.userId, dataValidacao = now() e salvar observações técnicas caso fornecidas.
3. Criação de endpoint para histórico agregado de leituras:
   * Rota: GET /api/leituras/estatisticas
   * Retornar média dos últimos 7 e 30 dias por parcela para alimentar gráficos de evolução.

#### Entregáveis de Frontend
1. Criação do serviço e hooks de leituras:
   * Implementar src/features/leituras/services/leituraService.ts com métodos: listar, registar, validarLeitura e obterEstatisticas.
   * Implementar src/features/leituras/hooks/useLeituras.ts com gestão de estados de carregamento, erro e paginação.
2. Implementação da página principal src/app/(dashboard)/leituras/page.tsx:
   * Modo Agricultor:
     - Gráfico ou barra de indicador visual da faixa ótima de humidade (40% a 75%).
     - Tabela histórica das leituras com badges de status (Ótima, Baixa, Crítica, Excessiva) e indicador de validação técnica (Validado / Pendente).
     - Botão e modal para submissão imediata de nova leitura de campo.
   * Modo Técnico SDAE:
     - Aba prioritária "Pendentes de Validação" com contagem em destaque.
     - Botão de ação direta "Validar Leitura" que abre modal de parecer técnico rápido.
     - Filtros por agricultor supervisionado e por parcela.
   * Modo Administrador:
     - Vista consolidada de todas as leituras registadas no distrito com capacidade de exportação básica.

#### Critérios de Aceitação
* O agricultor consegue registar uma leitura e visualizá-la imediatamente na sua listagem.
* O técnico responsável recebe a notificação da leitura e consegue clicar em "Validar Leitura", alterando o estado do registo no banco de dados.
* A página /leituras renderiza sem recorrer a valores simulados no código.

---

### Fase 3: Módulo Completo de Pragas e Ocorrências Fitossanitárias (RF09, RF10, RF11)

#### Objetivo
Implementar a totalidade das rotas de backend e interfaces de utilizador para consulta do catálogo de pragas e reporte/acompanhamento de ocorrências no campo.

#### Entregáveis de Backend
1. Endpoints do Catálogo de Pragas (RF09):
   * Rota: GET /api/pragas
   * Parâmetros de consulta: culturaId, severidade, busca textual por nome e sintomas.
   * Rota: POST /api/pragas (Restrito a ADMIN).
   * Rota: PUT /api/pragas/[id] e DELETE /api/pragas/[id] (Restrito a ADMIN).
2. Endpoints de Ocorrências de Pragas (RF10, RF11):
   * Rota: GET /api/ocorrencias
     - Filtros por papel: Agricultor vê as suas ocorrências; Técnico vê as ocorrências dos agricultores da sua carteira; Admin vê todas.
     - Filtro por status (ABERTA, EM_ANALISE, RESOLVIDA).
   * Rota: POST /api/ocorrencias (Acesso: AGRICULTOR):
     - Payload: parcelaId, pragaId (opcional), descricao, severidade, fotoUrl (opcional).
     - Regra de negócio: Disparar automaticamente um Alerta do tipo PRAGA_REPORTADA para o técnico responsável pelo agricultor.
   * Rota: PATCH /api/ocorrencias/[id]/resolver (Acesso: TECNICO, ADMIN):
     - Payload: status (EM_ANALISE ou RESOLVIDA), parecerTecnico, acaoRecomendada.
     - Regra de negócio: Atualizar registro e disparar alerta de volta ao agricultor notificando o parecer do técnico.

#### Entregáveis de Frontend
1. Módulo src/features/pragas/:
   * Implementação dos serviços em src/features/pragas/services/pragaService.ts e ocorrenciaService.ts.
   * Implementação dos componentes:
     - PragaCard.tsx: Cartão descritivo da praga com foto ilustrativa, sintomas, época de surgimento e métodos de combate.
     - PragaFilters.tsx: Filtro por cultura afetada e nível de severidade.
     - OcorrenciaFormModal.tsx: Formulário de reporte pelo agricultor com seleção de parcela, escolha da praga e descrição de campo.
     - OcorrenciaResolutionModal.tsx: Modal exclusivo para o técnico emitir orientação fitossanitária e marcar como resolvida.
2. Implementação das páginas de navegação:
   * src/app/(dashboard)/pragas/page.tsx: Guia visual de Pragas e Doenças com pesquisa em tempo real e detalhe expandido.
   * src/app/(dashboard)/pragas/ocorrencias/page.tsx: Painel de gestão de ocorrências com separação por status (Abertas, Em Análise, Resolvidas).

#### Critérios de Aceitação
* O catálogo de pragas permite filtrar por cultura afetada.
* O agricultor consegue submeter um reporte de praga associado a um talhão.
* O técnico supervisor visualiza a nova ocorrência, responde com parecer técnico e marca o caso como resolvido.
* As rotas /pragas e /pragas/ocorrencias deixam de ser placeholders e passam a ser 100% funcionais.

---

### Fase 4: Módulo de Administração de Utilizadores e Carteiras Técnicas (RF14)

#### Objetivo
Construir a interface e a lógica de backend que permite ao Administrador gerir as contas do sistema e estruturar a ligação formal entre Técnicos do SDAE e Agricultores familiares.

#### Entregáveis de Backend
1. Expansão de src/app/api/users/route.ts:
   * Criação de utilizadores pelo administrador: POST /api/users
     - Permite cadastrar técnicos do SDAE ou novos administradores diretamente pelo painel administrativo, com hash seguro de senha via bcrypt.
   * Atualização de status e dados: PATCH /api/users/[id]
     - Permite ativar, desativar ou bloquear contas de utilizadores.
2. Endpoints de Atribuição de Carteiras Técnicas:
   * Rota: GET /api/users/atribuicoes
     - Retorna a lista de técnicos com as respetivas listas de agricultores vinculados (tabela TecnicoAgricultor).
   * Rota: POST /api/users/atribuicoes
     - Payload: tecnicoId, agricultorId. Cria o vínculo formal de supervisão técnica.
   * Rota: DELETE /api/users/atribuicoes
     - Remove o vínculo entre o técnico e o agricultor.

#### Entregáveis de Frontend
1. Módulo src/features/users/:
   * Implementação de userService.ts com chamadas para listagem, criação de técnicos, atualização de estado e gestão de atribuições.
   * Criação dos componentes:
     - UserTable.tsx: Tabela de utilizadores com badges de papel (ADMIN, TÉCNICO, AGRICULTOR) e status (ATIVO, INATIVO).
     - CreateTecnicoModal.tsx: Formulário para cadastro de técnicos com campos: Nome, E-mail, Telefone, Zona de Atuação e Senha inicial.
     - AtribuicaoModal.tsx: Interface de gestão de carteira onde o administrador seleciona um técnico e adiciona ou remove agricultores supervisionados.
2. Implementação da página src/app/(dashboard)/utilizadores/page.tsx:
   * Substituição do placeholder por um painel administrativo dividido em abas: "Todos os Utilizadores", "Técnicos SDAE" e "Atribuição de Carteiras".

#### Critérios de Aceitação
* O administrador consegue criar uma nova conta de Técnico com sucesso.
* O administrador consegue associar agricultores a um técnico específico.
* As restrições de RBAC asseguram que apenas administradores têm acesso a esta rota.

---

### Fase 5: Interface de Recomendações Técnicas e Catálogos Mestres (RF07, RF08, RF14)

#### Objetivo
Fornecer interfaces visuais de emissão de recomendações para técnicos, consulta de recomendações recebidas para agricultores e manutenção completa do catálogo de culturas.

#### Entregáveis de Backend
1. Refinamento de src/app/api/culturas/[id]/route.ts:
   * Implementação de PUT /api/culturas/[id] para atualização de culturas pelo administrador.
   * Implementação de DELETE /api/culturas/[id] com verificação de integridade referencial.
2. Refinamento de src/app/api/recomendacoes/[id]/route.ts:
   * Permitir ao agricultor atualizar o status da recomendação para APLICADA quando tiver executado o plano no solo.

#### Entregáveis de Frontend
1. Módulo de Recomendações Técnicas:
   * Criação de componente RecomendacaoFormModal.tsx: Utilizado pelo técnico dentro do detalhe da parcela ou do dashboard para selecionar a cultura, redigir o parecer agronómico e submeter.
   * Criação de RecomendacaoCard.tsx: Cartão visual com o parecer técnico, data, dados do técnico emissor e botão para o agricultor marcar "Aplicado na Parcela".
   * Integração da visualização de recomendações na rota /parcelas e na página de detalhes da parcela.
2. Interface de Manutenção de Culturas para o Administrador:
   * Botão "Nova Cultura" na página /culturas visível apenas para o perfil ADMIN.
   * Modal com validação Zod para inserção e edição dos parâmetros agronómicos: Nome, Nome Científico, Época de Plantio, Ciclo em Dias, Limiar de Humidade Mínima e Máxima.

#### Critérios de Aceitação
* O técnico consegue emitir uma recomendação para uma parcela de um agricultor sob sua supervisão.
* O agricultor visualiza a recomendação no seu painel e pode marcar como "Aplicada".
* O administrador consegue adicionar e editar culturas no catálogo sem recorrer ao banco de dados diretamente.

---

### Fase 6: Central de Alertas, Comunicação Dinâmica e Meteorologia Open-Meteo

#### Objetivo
Garantir que alertas e mensagens cheguem pontualmente aos destinatários e integrar a previsão do tempo real para o distrito de Nhamatanda.

#### Entregáveis de Backend
1. Integração com a API Meteorológica Open-Meteo:
   * Criação do endpoint ou Server Action: GET /api/meteorologia
   * Coordenadas de Nhamatanda: Latitude -19.2667, Longitude 34.2167.
   * Dados retornados: Temperatura atual, humidade relativa do ar, probabilidade de precipitação e previsão para os próximos 3 dias.
   * Estratégia de cache: Cache de 30 minutos em memória ou via Next.js revalidate para respeitar limites e poupar dados móveis de utilizadores rurais.
2. Mecanismo de Alertas Dinâmicos:
   * Criação de rota leve de verificação de notificações: GET /api/alertas/unread-count.

#### Entregáveis de Frontend
1. Sincronização Periódica (Polling a cada 30 segundos conforme RNF04):
   * Criação do hook usePollingNotification.ts que consulta /api/alertas/unread-count a cada 30 segundos enquanto a aba do navegador estiver ativa.
   * Atualização dinâmica do badge de alertas na barra de navegação superior (Navbar) e no menu lateral (AppSidebar).
   * Polling leve na página de mensagens (/mensagens) para atualização de novas mensagens trocadas na conversa aberta.
2. Cartão Meteorológico Operacional:
   * Atualização do componente WeatherCard nos dashboards de Agricultor e Técnico, consumindo o endpoint /api/meteorologia.
   * Exibição de indicador de clima atual em Nhamatanda, temperatura, humidade do ar e recomendação meteorológica básica (ex: "Sem previsão de chuva para os próximos 2 dias. Favor monitorar humidade do solo").
3. Central de Alertas Completa:
   * Criação da tela ou modal integrado src/app/(dashboard)/mensagens/alertas/page.tsx com abas para filtrar alertas por tipo (Humidade Crítica, Pragas, Recomendações, Mensagens) e botão de ação rápida "Marcar todos como lidos".

#### Critérios de Aceitação
* O sino de notificações na barra superior reflete o número real de alertas não lidos e atualiza automaticamente.
* O cartão meteorológico exibe a temperatura real de Nhamatanda fornecida pela Open-Meteo com tratamento de fallback caso a internet falhe.
* O chat e os alertas operam com histórico íntegro e status de leitura funcional.

---

### Fase 7: Validação Integrada, Consistência dos Dashboards e Homologação Final

#### Objetivo
Consolidar a aplicação, eliminar dados estáticos remanescentes, validar os três perfis de ponta a ponta e garantir a prontidão do sistema para demonstração e defesa.

#### Atividades de Engenharia
1. Auditoria e Limpeza de Dados Estáticos nos Dashboards:
   * Revisão completa de src/app/(dashboard)/dashboard/page.tsx e da rota /api/dashboard.
   * Garantir que todas as contagens e métricas dos três perfis derivam de agregações reais do banco de dados (sem valores fixos a zero ou fictícios).
   * Garantir que, na ausência de dados, o sistema apresenta estados de vazio elegantes e orientadores ("Nenhuma parcela registada. Clique no botão abaixo para adicionar a sua primeira parcela").
2. Auditoria de Acessibilidade, Responsividade e Performance:
   * Verificação mobile-first em resoluções de smartphone (simulação de ecrãs de agricultores de 360px a 412px de largura).
   * Teste de contraste de cores do tema institucional.
   * Verificação de tempos de resposta e peso das páginas para assegurar fluidez em redes 3G rurais.
3. Verificação de Integridade de Compilação e Código:
   * Execução de npm run lint e resolução de qualquer aviso ou erro de tipagem.
   * Execução de npx tsc --noEmit (Typecheck) para validação estrita de tipos TypeScript.
   * Execução de npm run build para homologação da compilação de produção do Next.js.
4. Elaboração do Relatório Final de Conclusão:
   * Validação formal contra os requisitos RF01 a RF14 da monografia.

#### Critérios de Aceitação
* Build de produção do Next.js compila com zero erros.
* Todos os fluxos principais (registo, leitura, anomalia, recomendação, reporte de praga, chat e administração) funcionam de ponta a ponta sem interrupções.
* Nenhuma rota listada no menu lateral resulta em erro 404 ou página provisória (placeholder).

---

## 5. Estrutura de Ficheiros a Implementar ou Modificar

Abaixo apresenta-se o mapa de arquivos correspondente a cada fase do plano:

### Backend e Banco de Dados
* prisma/schema.prisma: Inclusão dos campos de validação de leitura e relacionamento praga-cultura.
* src/app/api/leituras/route.ts: Refinamento de filtros e consulta agregada.
* src/app/api/leituras/[id]/validar/route.ts (NOVO): Endpoint de validação técnica de humidade.
* src/app/api/pragas/route.ts (NOVO): CRUD do catálogo de pragas e filtros por cultura.
* src/app/api/pragas/[id]/route.ts (NOVO): Atualização e remoção de pragas pelo administrador.
* src/app/api/ocorrencias/route.ts (NOVO): Registo e consulta de ocorrências fitossanitárias.
* src/app/api/ocorrencias/[id]/resolver/route.ts (NOVO): Resolução de ocorrências com parecer técnico.
* src/app/api/users/route.ts: Adição de criação de utilizadores (POST).
* src/app/api/users/[id]/route.ts (NOVO): Atualização de status e perfil (PATCH/DELETE).
* src/app/api/users/atribuicoes/route.ts (NOVO): Gestão da tabela TecnicoAgricultor.
* src/app/api/meteorologia/route.ts (NOVO): Integração com API Open-Meteo para Nhamatanda.

### Frontend (Componentes e Páginas)
* src/features/leituras/:
  - services/leituraService.ts (NOVO)
  - hooks/useLeituras.ts (NOVO)
  - components/LeituraFormModal.tsx (NOVO)
  - components/LeituraValidacaoModal.tsx (NOVO)
  - components/LeituraTable.tsx (NOVO)
* src/features/pragas/:
  - services/pragaService.ts (NOVO)
  - services/ocorrenciaService.ts (NOVO)
  - hooks/usePragas.ts (NOVO)
  - hooks/useOcorrencias.ts (NOVO)
  - components/PragaCard.tsx (NOVO)
  - components/PragaFilters.tsx (NOVO)
  - components/OcorrenciaFormModal.tsx (NOVO)
  - components/OcorrenciaResolutionModal.tsx (NOVO)
* src/features/users/:
  - services/userService.ts (NOVO)
  - hooks/useUsers.ts (NOVO)
  - components/UserTable.tsx (NOVO)
  - components/CreateTecnicoModal.tsx (NOVO)
  - components/AtribuicaoCarteiraModal.tsx (NOVO)
* src/app/(dashboard)/leituras/page.tsx: Substituição do placeholder pela interface completa de gestão e validação.
* src/app/(dashboard)/pragas/page.tsx: Substituição do placeholder pelo catálogo interativo de pragas.
* src/app/(dashboard)/pragas/ocorrencias/page.tsx: Substituição do placeholder pelo painel de ocorrências.
* src/app/(dashboard)/utilizadores/page.tsx: Substituição do placeholder pelo painel de gestão de contas e atribuições.
* src/app/(dashboard)/mensagens/alertas/page.tsx (NOVO): Central completa de alertas e notificações.
* src/components/layout/AppSidebar.tsx e Navbar.tsx: Conexão dos links de navegação e polling de notificações ativas.

---

## 6. Padrões de Qualidade e Diretrizes de Implementação

1. Rigor de Linguagem e Localização:
   * Todos os textos da interface e mensagens do sistema devem utilizar o Português de Moçambique com vocabulário agronómico acessível (ex: "parcelas", "talhões", "humidade do solo", "sementeira", "SDAE Nhamatanda").
   * Evitar jargões de programação em mensagens visíveis para o utilizador.
2. Identidade Visual Institucional:
   * Manter consistência estrita com as cores do projeto:
     - Primária: Verde Floresta Profundo (#0E4749 e #002626)
     - Acento: Verde-Lima / Terracota (#E07A5F e acentos terrosos)
     - Superfície / Fundo: Creme suave (#FEFAE0 / #F4F1DE)
   * Sem utilização de emojis na interface ou na documentação de código. Utilizar exclusivamente ícones SVG padronizados (Lucide React).
3. Resiliência e Tratamento de Erros:
   * Todos os formulários devem validar entradas localmente com Zod e exibir mensagens de erro em caixas de aviso estruturadas.
   * Todos os estados de carregamento assíncrono devem utilizar indicadores de progresso suaves (spinners ou skeleton screens).
   * Estados de lista vazia devem sempre conter mensagens esclarecedoras e ações sugeridas.
4. Isolamento e Segurança de Dados (RBAC):
   * Toda consulta ao banco de dados no backend deve aplicar a cláusula de isolamento pelo papel do utilizador autenticado (session.role e session.userId).
   * O agricultor nunca deve aceder a dados de parcelas de outros agricultores.
   * O técnico nunca deve validar medições ou responder a ocorrências de agricultores fora da sua carteira de acompanhamento.

---

## 7. Cronograma e Ordem de Prioridades

| Ordem | Fase | Escopo Principal | Dependências |
| :---: | :--- | :--- | :--- |
| 1 | Fase 1 | Prisma Schema e Migrações PostgreSQL | Nenhuma |
| 2 | Fase 2 | Leituras de Solo e Validação Técnica (RF03, RF04, RF05) | Fase 1 |
| 3 | Fase 3 | Catálogo de Pragas e Ocorrências Fitossanitárias (RF09, RF10, RF11) | Fase 1 |
| 4 | Fase 4 | Administração de Utilizadores e Carteiras Técnicas (RF14) | Fase 1 |
| 5 | Fase 5 | Recomendações e Catálogos Mestres de Culturas (RF07, RF08, RF14) | Fases 2 e 4 |
| 6 | Fase 6 | Alertas Dinâmicos, Comunicação e Meteorologia Open-Meteo | Fases 2 e 3 |
| 7 | Fase 7 | Auditoria de Dashboards, Homologação e Build Final | Todas |

Este plano constitui o roteiro técnico definitivo para assegurar que o sistema KulimaTech atinja o nível de maturidade e completude exigido pela monografia acadêmica e pelos objetivos operacionais do SDAE de Nhamatanda.
