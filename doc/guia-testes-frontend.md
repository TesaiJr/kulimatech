# Guia de Testes e Homologação do Sistema KulimaTech

**Projecto de Graduação:** Sistema Web de Apoio à Decisão para Gestão Agrícola e Monitorização de Culturas: Caso de Estudo do Distrito de Nhamatanda  
**Instituição de Ensino:** Universidade Zambeze (UniZambeze) — Faculdade de Ciências e Tecnologia  
**Entidade Parceira Operacional:** Serviços Distritais de Actividades Económicas (SDAE) de Nhamatanda, Província de Sofala  
**Autor:** Marcelo Tesai Faife (2026)  

---

## 1. Objectivo do Documento

Este guia estabelece os procedimentos formais de teste e validação de conformidade da aplicação web **KulimaTech**. Todos os cenários descritos correspondem aos requisitos funcionais (RF01 a RF08) e às telas operacionais documentadas nas Figuras 11 a 16 do Capítulo IV da monografia.

O objetivo é fornecer um roteiro reprodutível para membros do júri académico, técnicos de extensão agrária do SDAE e auditores de software validarem cada funcionalidade do sistema.

---

## 2. Instruções de Inicialização do Ambiente

O sistema requer o ambiente Node.js (versão 18 ou superior) e uma instância ativa do banco de dados relacional PostgreSQL (Supabase).

### 2.1 Inicialização em Modo de Desenvolvimento
Para executar os testes com recarregamento em tempo real e inspecção de interface:

```bash
cd c:\Users\User\Desktop\marcelo\frontend
npm run dev
```

O serviço estará disponível no endereço: **`http://localhost:3000`**

### 2.2 Compilação e Validação Estrutural (Build de Produção)
Para certificar a integridade do código sem dependências de compilação em tempo real:

```bash
npm run build
npm run start
```

---

## 3. Contas de Acesso Oficiais do Caso de Estudo de Nhamatanda

As credenciais a seguir foram pré-configuradas no banco de dados com base nas entidades documentadas nas Figuras 12 a 16 da monografia:

| Perfil de Utilizador | Nome Completo / Cargo | Correio Electrónico Oficial | Palavra-passe | Posto Administrativo |
| :--- | :--- | :--- | :--- | :--- |
| **Agricultor Familiar** | Mateus Fernando Tivane | `agricultor@kulimatech.mz` | `Agricultor123` | Posto de Lamego |
| **Técnico Extensionista** | Eng. António Langa (SDAE) | `tecnico@kulimatech.mz` | `Tecnico123` | Posto de Tica |
| **Administrador Distrital** | Alberto Nhantumbo (SDAE) | `admin@kulimatech.mz` | `Admin123` | Nhamatanda-Sede |

Nota: Para alternar de conta, o utilizador pode selecionar a opção "Terminar Sessão" no canto inferior do menu lateral ou aceder diretamente à rota `/auth?mode=login`.

---

## 4. Testes das Telas Principais da Monografia (Figuras 11 a 16)

### 4.1 Teste da Figura 11 — Portal Institucional de Boas-Vindas
* **Rota:** `http://localhost:3000`
* **Perfil Requerido:** Acesso público (não autenticado).
* **Passos de Verificação:**
  1. Aceda à raiz do sistema no navegador.
  2. Verifique o cabeçalho com o logótipo KulimaTech, a referência territorial a Nhamatanda e os menus de navegação centralizados.
  3. No banner principal, confirme a transição entre imagens fotográficas agrícolas de Moçambique, a declaração de propósito do sistema e o botão de ação rápida "Aceder ao Sistema".
  4. Role a página e inspecione a secção de parceria institucional: verifique os blocos da Universidade Zambeze (pesquisa agronómica e modelação) e do SDAE de Nhamatanda (extensão agrária e supervisão de campo).
  5. Verifique a secção "Como Funciona" estruturada em quatro etapas consecutivas: Cadastro de Parcelas, Registo de Leituras, Pareceres Técnicos e Alertas Fitossanitários.
* **Critério de Aceitação:** A página deve carregar sem falhas de estilo, utilizando a paleta de cores primária (verde-petróleo profundo) e de destaque (verde-lima elétrico), sem quebras de layout em resoluções móveis ou de desktop.

---

### 4.2 Teste da Figura 12 — Ecrã de Autenticação (Login)
* **Rota:** `http://localhost:3000/auth?mode=login`
* **Perfil Requerido:** Qualquer utilizador registado.
* **Passos de Verificação:**
  1. Aceda à rota de autenticação.
  2. Insira as credenciais do Agricultor Familiar (`agricultor@kulimatech.mz` / `Agricultor123`).
  3. Clique em "Iniciar Sessão".
  4. Observe o redirecionamento imediato para a rota `/dashboard`.
  5. Teste o tratamento de exceção inserindo uma palavra-passe incorreta: verifique se o sistema exibe a mensagem de credenciais inválidas sem expor detalhes internos do servidor.
* **Critério de Aceitação:** Autenticação concluída via JWT em cookies protegidos (`HttpOnly`), redirecionando para a visão específica do perfil logado.

---

### 4.3 Teste da Figura 13 — Ecrã de Registo de Utilizadores
* **Rota:** `http://localhost:3000/auth?mode=register`
* **Perfil Requerido:** Novo utilizador.
* **Passos de Verificação:**
  1. Aceda à aba de cadastro de utilizadores.
  2. Preencha o nome completo, correio eletrónico e contacto telefónico moçambicano (+258 84/82/86/87).
  3. No campo "Perfil de Acesso", alterne entre Agricultor Familiar e Técnico Extensionista SDAE.
  4. No seletor de território, confirme a disponibilidade dos postos administrativos do distrito: Nhamatanda-Sede, Tica e Lamego.
  5. Conclua o registo e confirme se o sistema autentica a nova conta e direciona para o painel principal.
* **Critério de Aceitação:** Validação estrita de campos obrigatórios e persistência dos dados territoriais no banco de dados.

---

### 4.4 Teste da Figura 14 — Painel da Exploração (Visão do Agricultor Familiar)
* **Rota:** `http://localhost:3000/dashboard`
* **Perfil Requerido:** Agricultor Familiar (`agricultor@kulimatech.mz`).
* **Passos de Verificação:**
  1. Inicie sessão com a conta do produtor Mateus Fernando Tivane.
  2. Inspecione o topo do painel: confirme o nome do agricultor, a identificação "Posto Administrativo de Lamego" e o contacto do extensionista supervisor (Eng. António Langa).
  3. No gráfico de evolução de humidade de 7 dias, verifique:
     - A faixa ótima recomendada (40% a 75%) representada como área sombreada de referência.
     - A curva de leituras com os percentuais diários: 42%, 48%, 55%, 62%, 58%, 65% e 68%.
     - A linha de temperatura média tracejada.
  4. Inspecione os três cartões de apoio à decisão hídrica:
     - Média do Período: 58.4% (Faixa Óptima).
     - Tendência Hídrica: +6.2% / 48h (Estabilidade Alta).
     - Previsão de Necessidade de Rega: "Daqui a 48h".
  5. Na secção "Ciclo Agronómico — Época 2026", verifique o estágio fenológico ativo (Desenvolvimento Vegetativo) e as recomendações de aplicação de adubação e humidade ideal.
  6. Na lista de talhões da exploração, confirme os três talhões cadastrados na monografia:
     - Machamba Principal: 2.5 ha, Argiloso, 60% de humidade (Estado: Óptimo).
     - Talhão das Hortaliças: 1.2 ha, Argiloso, 42% de humidade (Estado: Atenção).
     - Parcela da Baixa: 0.8 ha, Argiloso, 75% de humidade (Estado: Húmido).
  7. No formulário de leitura rápida, insira um valor percentual e confirme a submissão para recálculo do painel.
* **Critério de Aceitação:** Todos os indicadores numéricos, gráficos e status devem coincidir exatamente com os dados da Figura 14 da monografia.

---

### 4.5 Teste da Figura 15 — Painel de Supervisão do Técnico Extensionista SDAE
* **Rota:** `http://localhost:3000/dashboard`
* **Perfil Requerido:** Técnico SDAE (`tecnico@kulimatech.mz`).
* **Passos de Verificação:**
  1. Inicie sessão com a conta do Eng. António Langa.
  2. Verifique o cabeçalho personalizado: indicação de perfil técnico do SDAE associado ao Posto de Tica.
  3. Inspecione os quatro indicadores chave (KPIs) de topo:
     - Agricultores Acompanhados na Carteira Técnica.
     - Parcelas Agrícolas Ativas sob Supervisão.
     - Validações de Humidade Pendentes.
     - Pareceres Agronómicos Emitidos.
  4. Na tabela "Leituras Recentes de Humidade do Solo":
     - Confirme as colunas: Parcela, Agricultor, Humidade Registada, Estado Hídrico e Ações.
     - Verifique o botão contextual "Ver Parcelas" e teste a navegação direta para o módulo de parcelas.
  5. Na secção de agricultores da carteira técnica, confirme a listagem dos produtores atribuídos com os respetivos contactos e total de área monitorada.
* **Critério de Aceitação:** Isolamento de dados por carteira técnica e disponibilização das ações de homologação rápida conforme a Figura 15.

---

### 4.6 Teste da Figura 16 — Painel Consolidado do Administrador Distrital
* **Rota:** `http://localhost:3000/dashboard`
* **Perfil Requerido:** Administrador Distrital (`admin@kulimatech.mz`).
* **Passos de Verificação:**
  1. Inicie sessão com a conta de Alberto Nhantumbo.
  2. Verifique os quatro indicadores distritais consolidados:
     - Total de Utilizadores Cadastrados no Distrito.
     - Área Agrícola Total Monitorada (em hectares).
     - Volume Global de Leituras Validadas.
     - Alertas Operacionais e Fitossanitários em Aberto.
  3. Na secção "Técnicos SDAE & Carteiras Técnicas":
     - Verifique a lista de extensionistas com o número de produtores atribuídos e hectares cobertos.
     - Clique no botão "Ver Parcelas" de cada técnico para auditar os talhões supervisionados.
  4. Na secção "Catálogo Mestre de Culturas Prioritárias de Nhamatanda":
     - Confirme a exibição das culturas catalogadas (Milho, Tomate, Feijão, Mandioca) com faixas ideais de humidade e botões de gestão mestre.
* **Critério de Aceitação:** Visão global distrital sem limitações de carteira e com acesso administrativo irrestrito conforme a Figura 16.

---

## 5. Testes dos Requisitos Funcionais de Domínio (RF01 a RF08)

### 5.1 Requisito RF01: Controlo de Acesso Baseado em Perfis (RBAC)
* **Procedimento de Teste:**
  1. Inicie sessão com a conta de Agricultor e tente forçar a rota administrativa `/utilizadores` na barra de endereço.
  2. Verifique se o sistema impede o acesso indevido ou redireciona para a visão restrita aos seus próprios dados.
  3. Inicie sessão como Técnico e aceda a `/parcelas`: verifique se o botão "+ Nova Parcela" não é exibido, mantendo o formulário de cadastro exclusivo ao agricultor.
  4. Inicie sessão como Administrador e confirme a capacidade de gerir contas e redefinir permissões.
* **Resultado Esperado:** Garantia integral de autorização em rotas de páginas e endpoints da API.

---

### 5.2 Requisito RF02: Gestão de Parcelas Agrícolas
* **Rotas:** `/parcelas` e `/parcelas/novo`
* **Procedimento de Teste:**
  1. Com o perfil de Agricultor, aceda a `/parcelas`.
  2. Clique no botão "+ Nova Parcela".
  3. Preencha os campos obrigatórios:
     - Nome da Parcela: "Talhão Lamego 2 — Milho".
     - Área: 1.8 ha.
     - Tipo de Solo: Selecione "Franco-Argiloso" (predominante em Nhamatanda).
     - Localização Descritiva: "Próximo à estrada principal, margem do regadio".
     - Coordenadas GPS: Insira manualmente ou clique em "Obter Localização Atual (GPS)".
  4. Clique em "Guardar Parcela".
  5. Na listagem de parcelas, teste a alternância entre os modos de exibição "Grelha de Cartões" e "Tabela Detalhada".
  6. Utilize a barra de pesquisa para filtrar talhões por nome ou solo.
* **Resultado Esperado:** A nova parcela é persistida no banco de dados e passa a constar no painel e na carteira do técnico supervisor.

---

### 5.3 Requisito RF03: Monitorização de Humidade do Solo e Validação Técnica
* **Rota:** `/leituras`
* **Procedimento de Teste de Duas Etapas:**
  1. **Etapa 1 (Registo pelo Produtor):**
     - Com a conta de Agricultor, aceda a `/leituras` e clique em "+ Nova Leitura".
     - Selecione a parcela desejada.
     - Arraste o controlo de humidade para 22% (valor de défice hídrico).
     - Observe a barra de classificação agronómica sinalizando "Crítica / Muito Seco".
     - Insira a temperatura estimada (ex.: 31.0°C) e clique em "Confirmar e Registar".
     - Na tabela, a leitura surge com o estado "Pendente de Validação".
  2. **Etapa 2 (Homologação pelo Extensionista SDAE):**
     - Termine a sessão e entre com a conta do Técnico SDAE.
     - Aceda a `/leituras` e clique na aba "Pendentes de Validação".
     - Localize a medição de 22% submetida e clique no botão "Validar".
     - No formulário de parecer técnico, registe: "Défice hídrico severo confirmado. Recomenda-se acionamento imediato da rega por sulcos nas próximas 6 horas."
     - Confirme a homologação.
* **Resultado Esperado:** A leitura passa para o estado "Homologada", exibindo o carimbo do extensionista, a data/hora exata e o parecer técnico associado.

---

### 5.4 Requisito RF04: Catálogo de Culturas e Recomendações Agronómicas
* **Rotas:** `/culturas` e `/recomendacoes`
* **Procedimento de Teste:**
  1. **Auditoria do Catálogo de Culturas (`/culturas`):**
     - Verifique as fichas agronómicas com nome científico, ciclo vegetativo em dias e faixas de necessidade hídrica (ex.: Milho: 450-600 mm, faixa de humidade de 50% a 70%).
     - Com perfil de Administrador, teste a criação ou edição de uma cultura.
  2. **Ciclo de Emissão e Aplicação de Recomendação (`/recomendacoes`):**
     - Como Técnico SDAE, aceda a `/recomendacoes` e clique em "Emitir Recomendação".
     - Selecione o agricultor Mateus Tivane, a parcela "Machamba Principal" e a cultura "Milho".
     - No tipo de intervenção, escolha "Ajuste de Calendário de Rega".
     - No conteúdo do parecer, insira a dosagem de rega e a urgência da medida.
     - Submeta a recomendação (estado inicial: "Pendente de Aplicação").
     - Como Agricultor, aceda a `/recomendacoes`, localize a orientação e clique em "Marcar como Aplicada".
* **Resultado Esperado:** Transição de estado de recomendação devidamente auditada com notificação em tempo real entre as partes.

---

### 5.5 Requisito RF05: Registo de Ocorrências Fitossanitárias e Manejo de Pragas
* **Rotas:** `/pragas` e `/pragas/ocorrencias`
* **Procedimento de Teste:**
  1. **Consulta ao Catálogo de Pragas (`/pragas`):**
     - Consulte pragas endémicas da bacia do Púnguè: Lagarta-do-cartucho (*Spodoptera frugiperda*) e Broca-do-colmo.
     - Abra a ficha técnica e verifique os sintomas visíveis, culturas hospedeiras e estratégias de Manejo Integrado de Pragas (medidas culturais, biológicas e químicas).
  2. **Comunicação de Ocorrência pelo Agricultor (`/pragas/ocorrencias`):**
     - Como Agricultor, clique em "+ Nova Ocorrência".
     - Escolha o talhão afetado e selecione a praga suspeita.
     - Defina a severidade como "Alta" e descreva os danos foliares observados.
     - Submeta o reporte (estado: "Em Aberto").
  3. **Resolução Técnica pelo Extensionista:**
     - Como Técnico SDAE, aceda a `/pragas/ocorrencias`, filtre pelas ocorrências abertas e clique em "Resolver".
     - Registe o diagnóstico fitossanitário e prescreva as medidas de combate recomendadas.
     - Confirme a conclusão.
* **Resultado Esperado:** A ocorrência é marcada como "Resolvida", arquivando o histórico fitossanitário do talhão.

---

### 5.6 Requisito RF06: Alertas e Previsões Agrometeorológicas Locais
* **Rota:** `/dashboard` (Cartão Agroclimático de Nhamatanda)
* **Procedimento de Teste:**
  1. No painel principal de qualquer perfil autenticado, inspecione o componente meteorológico.
  2. Confirme a leitura das coordenadas geográficas oficiais de Nhamatanda (Latitude: -19.2667, Longitude: 34.2167).
  3. Verifique os dados em tempo real obtidos da API Open-Meteo: temperatura do ar, percentual de humidade atmosférica e velocidade do vento.
  4. Analise a recomendação reativa gerada pelo motor agronómico baseada na probabilidade de precipitação nas próximas 24 horas.
  5. Expanda a previsão para 3 dias consecutivos e valide as temperaturas mínimas, máximas e volume pluviométrico estimado.
* **Resultado Esperado:** Dados consistentes com a localização real do distrito e presença de fallback automático caso a rede externa esteja inativa.

---

### 5.7 Requisito RF07: Canal de Comunicação Direta em Tempo Real (Chat)
* **Rota:** `/mensagens`
* **Procedimento de Teste com Sessões Paralelas:**
  1. Abra duas janelas do navegador (uma em modo normal e outra em janela anónima).
  2. Na Janela 1, inicie sessão com o Agricultor Mateus Tivane.
  3. Na Janela 2, inicie sessão com o Técnico Eng. António Langa.
  4. Em ambas as janelas, aceda a `/mensagens`.
  5. Verifique o indicador de ligação "Em tempo real" ativado via Server-Sent Events (SSE).
  6. Na Janela 1 (Agricultor), digite uma mensagem dirigida ao técnico e envie.
  7. Observe:
     - Envio Otimista: A mensagem surge instantaneamente na tela do agricultor sem atraso de rede.
     - Receção Instantânea: Sem atualizar a página, a Janela 2 (Técnico) recebe a nova mensagem e emite o carimbo de tempo.
     - Confirmação de Leitura: Ao focar a janela do técnico, o indicador na tela do produtor transiciona para "Lida".
* **Resultado Esperado:** Latência de comunicação inferior a 200 ms sem necessidade de recarregamento manual ou polling agressivo.

---

### 5.8 Requisito RF08: Central Unificada de Alertas e Notificações
* **Rota:** `/mensagens/alertas`
* **Procedimento de Teste:**
  1. Observe o indicador de alertas (ícone de sino no topo da barra de navegação e contador no menu lateral).
  2. Verifique se o contador reflete ocorrências pendentes e notificações de humidade crítica.
  3. Aceda a `/mensagens/alertas` e teste a filtragem por abas temáticas:
     - Humidade Crítica
     - Ocorrências de Pragas
     - Recomendações Agronómicas
     - Comunicações de Chat
     - Sistema e Segurança
  4. Clique em "Marcar todos como lidos" e verifique a atualização em tempo real de todos os contadores do sistema.
* **Resultado Esperado:** Rastreabilidade integral de todos os eventos críticos do sistema.

---

## 6. Scripts de Teste e Homologação Automatizada

Para auditoria rápida e validação formal de integridade de ponta a ponta sem necessidade de navegação manual, execute a suíte de scripts de teste via terminal:

```bash
# 1. Validação do Esquema de Dados e Integridade Relacional do PostgreSQL
node scripts/verify-fase1-schema.mjs

# 2. Validação do Módulo de Leituras de Humidade e Homologação Técnica
node scripts/verify-fase2-leituras.mjs

# 3. Validação do Catálogo de Pragas, Reporte e Prescrição Fitossanitária
node scripts/verify-fase3-pragas.mjs

# 4. Validação da Gestão de Contas, Perfis RBAC e Carteiras Técnicas
node scripts/verify-fase4-users.mjs

# 5. Validação do Catálogo Mestre de Culturas e Recomendações Agronómicas
node scripts/verify-fase5-recomendacoes-culturas.mjs

# 6. Validação do Serviço Meteorológico e Notificações em Tempo Real
node scripts/verify-fase6-alertas-meteo.mjs

# 7. Validação Integrada Final e Auditoria das Telas dos Três Perfis (Figuras 14, 15 e 16)
node scripts/verify-fase7-dashboards-homologacao.mjs
```

### 6.1 Critério de Sucesso dos Testes Automatizados
Todos os scripts acima devem finalizar com código de saída 0 (`exit code: 0`), totalizando **33 testes aprovados em 33 executados (100% de sucesso)**, comprovando a total prontidão do sistema para demonstração pública e defesa da monografia perante o júri académico.
