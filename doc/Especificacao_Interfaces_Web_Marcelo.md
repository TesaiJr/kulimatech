**UNIVERSIDADE ZAMBEZE**  
**FACULDADE DE CIÊNCIAS E TECNOLOGIA**

Licenciatura em Engenharia Informática

**DOCUMENTO DE ESPECIFICAÇÃO DE INTERFACES WEB**

**Sistema de Informação e Apoio à Tomada de Decisão para Agricultores do SDAE**  
**Distrito de Nhamatanda — Província de Sofala**

Autor: Marcelo Tesai Faife  
Orientador: Christian Coulon

Beira, 2026

# **1\. INTRODUÇÃO**

Este documento especifica as interfaces web do sistema de informação e apoio à tomada de decisão para agricultores do SDAE no distrito de Nhamatanda, desenvolvendo, ao nível de interface, as seis funcionalidades (F1 a F6) definidas no Documento de Especificação de Funcionalidades e Plano de Execução. Ao contrário da previsão inicial de uma aplicação móvel em Flutter, optou-se por concentrar o desenvolvimento numa aplicação totalmente web, pelo que todas as telas aqui descritas correspondem a páginas web, acedidas por browser, mantendo-se válida a arquitectura cliente-servidor já definida (frontend, servidor API REST e base de dados).

O fluxo de autenticação descrito na secção 4.1 corresponde ao diagrama de sequência já elaborado para o login (pedido POST /auth/login, verificação de senha por hash e devolução de token JWT), aqui mantido sem alterações e apenas reformulado para o contexto de uma aplicação web em vez de uma aplicação móvel.

Para cada tela documentam-se o perfil de acesso, o objectivo, os campos e elementos principais, as acções disponíveis e, sempre que relevante, observações sobre o comportamento do sistema. A secção 5 apresenta uma visão consolidada do que cada perfil vê e não vê em cada área do sistema.

# **2\. PERFIS DE ACESSO**

O sistema define três perfis de utilizador, conforme especificado na funcionalidade F1, cada um com acesso restrito às funcionalidades correspondentes ao seu papel no processo.

| Administrador | Gere as contas de utilizadores e os catálogos de referência do sistema (culturas e pragas). Não intervém directamente nos dados operacionais das parcelas, leituras, recomendações ou mensagens. |
| :---- | :---- |
| **Técnico SDAE** | Acompanha os agricultores que lhe estão associados: consulta as suas parcelas, valida as leituras de humidade do solo, emite recomendações de culturas, acompanha as ocorrências de pragas reportadas e comunica com os agricultores. |
| **Agricultor** | Regista e gere as suas próprias parcelas, regista leituras de humidade do solo, consulta o catálogo de culturas e pragas, recebe recomendações, reporta ocorrências de pragas e comunica com o técnico responsável. |

# **3\. FUNCIONALIDADES POR ORDEM DE PRIORIDADE**

A ordem seguinte resulta directamente das prioridades indicadas no Documento de Especificação de Funcionalidades. As funcionalidades de prioridade Alta precedem a funcionalidade de prioridade Média (F5); dentro do grupo de prioridade Alta mantém-se a ordem de dependência técnica, com F1 e F2 como pré-requisitos das restantes, seguidas de F3 e F4, e por fim F6, cujos alertas dependem dos eventos gerados pelas outras funcionalidades.

| Funcionalidade | Prioridade | Perfis envolvidos | Ordem |
| ----- | :---: | :---: | :---: |
| F1 — Autenticação e Gestão de Utilizadores | Alta | Todos | 1º |
| F2 — Gestão de Parcelas | Alta | Agricultor, Técnico | 2º |
| F3 — Registo de Leitura do Solo | Alta | Agricultor, Técnico | 3º |
| F4 — Catálogo de Culturas e Recomendações | Alta | Todos | 4º |
| F6 — Canal de Comunicação e Alertas | Alta | Agricultor, Técnico | 5º |
| F5 — Catálogo de Pragas e Reporte de Ocorrências | Média | Todos | 6º |

# **4\. DESCRIÇÃO DAS TELAS WEB**

As telas seguem a mesma sequência de prioridade indicada na secção anterior, agrupadas por funcionalidade.

## **4.1 Módulo F1 — Autenticação e Gestão de Utilizadores**

### **Tela de Login**

| Perfil de acesso | Todos os perfis (utilizador ainda não autenticado) |
| :---- | :---- |
| **Objectivo** | Autenticar o utilizador e redireccioná-lo para o dashboard correspondente ao seu perfil. |
| **Campos / elementos** | Email Senha |
| **Acções disponíveis** | Entrar Recuperar senha (ligação) Criar conta (ligação para a tela de registo) |
| **Observações** | Segue o fluxo já definido: a aplicação envia POST /auth/login com email e senha; o servidor consulta a base de dados, verifica a senha por hash e devolve token JWT com o perfil do utilizador em caso de sucesso, ou erro 401 com mensagem apresentada ao utilizador em caso de credenciais incorrectas. |

### **Tela de Registo**

| Perfil de acesso | Agricultor e Técnico SDAE (auto-registo). Contas de Administrador são criadas apenas por outro administrador. |
| :---- | :---- |
| **Objectivo** | Criar uma nova conta de utilizador. |
| **Campos / elementos** | Nome completo Email Telefone Senha e confirmação de senha Perfil (Agricultor / Técnico) Dados específicos do perfil (ex.: zona de residência para o agricultor; área de actuação para o técnico) |
| **Acções disponíveis** | Criar conta Cancelar / voltar ao login |

### **Tela de Gestão de Utilizadores**

| Perfil de acesso | Administrador |
| :---- | :---- |
| **Objectivo** | Listar e gerir as contas de todos os utilizadores do sistema. |
| **Campos / elementos** | Tabela com Nome, Email, Perfil, Estado (activo / inactivo) e Data de registo Campo de pesquisa por nome ou email Filtro por perfil |
| **Acções disponíveis** | Ver detalhe do utilizador Editar dados Activar / desactivar conta |
| **Observações** | O administrador vê os utilizadores dos três perfis, mas não acede aos dados operacionais (parcelas, leituras, recomendações) que esses utilizadores produzem. |

### **Dashboard (conteúdo varia por perfil)**

| Perfil de acesso | Todos, com conteúdo distinto por perfil |
| :---- | :---- |
| **Objectivo** | Apresentar, logo após o login, um resumo relevante para o perfil autenticado. |
| **Campos / elementos** | Administrador: número total de utilizadores, parcelas, leituras e ocorrências activas; atalhos para gestão de catálogos e de utilizadores Técnico: lista dos agricultores acompanhados e alertas pendentes (novas leituras, ocorrências, mensagens) Agricultor: resumo das suas parcelas, últimas leituras registadas, recomendações recentes e alertas próprios |
| **Acções disponíveis** | Aceder directamente a cada módulo a partir dos atalhos apresentados |

## **4.2 Módulo F2 — Gestão de Parcelas**

### **Tela de Lista de Parcelas**

| Perfil de acesso | Agricultor (as próprias) e Técnico (as dos agricultores que acompanha) |
| :---- | :---- |
| **Objectivo** | Listar as parcelas registadas. |
| **Campos / elementos** | Nome da parcela Área (hectares) Tipo de solo Localização (latitude / longitude, quando preenchida) Agricultor associado (coluna visível apenas para o técnico) |
| **Acções disponíveis** | Adicionar parcela (agricultor) Ver detalhe Editar (agricultor, apenas as suas) Filtrar por agricultor (técnico) |
| **Observações** | O agricultor não vê parcelas de outros agricultores; o técnico vê apenas as parcelas dos agricultores que acompanha, não a totalidade das parcelas do sistema. |

### **Tela de Registo / Edição de Parcela**

| Perfil de acesso | Agricultor |
| :---- | :---- |
| **Objectivo** | Registar uma nova parcela ou editar uma parcela existente. |
| **Campos / elementos** | Nome da parcela Área (hectares) Tipo de solo (lista: arenoso, argiloso, misto, outro) Latitude (opcional) Longitude (opcional) |
| **Acções disponíveis** | Guardar Cancelar Preencher localização automaticamente a partir do dispositivo (opcional) |

### **Tela de Detalhe da Parcela**

| Perfil de acesso | Agricultor (própria) e Técnico (associada) |
| :---- | :---- |
| **Objectivo** | Consultar os dados e o histórico associados a uma parcela específica. |
| **Campos / elementos** | Dados gerais da parcela Histórico de leituras de humidade do solo Histórico de recomendações recebidas Histórico de ocorrências de pragas reportadas |
| **Acções disponíveis** | Editar (agricultor) Emitir recomendação para esta parcela (técnico, atalho) |

## **4.3 Módulo F3 — Registo de Leitura do Solo**

### **Tela de Registo de Leitura do Solo**

| Perfil de acesso | Agricultor |
| :---- | :---- |
| **Objectivo** | Registar uma nova leitura de humidade do solo para uma parcela. |
| **Campos / elementos** | Parcela (selector) Humidade do solo em percentagem Observações (texto livre) Data e hora (preenchidas automaticamente) |
| **Acções disponíveis** | Guardar leitura |
| **Observações** | O sistema valida que o valor de humidade está entre 0 e 100%. Se o valor estiver fora do padrão normal, a leitura é assinalada como anomalia e é gerado automaticamente um alerta para o técnico responsável. |

### **Tela de Leituras e Validação**

| Perfil de acesso | Técnico |
| :---- | :---- |
| **Objectivo** | Consultar e validar as leituras registadas pelos agricultores acompanhados. |
| **Campos / elementos** | Lista de leituras com parcela, agricultor, valor de humidade, data e estado (pendente / validada / anómala) |
| **Acções disponíveis** | Ver detalhe da leitura Validar leitura Adicionar comentário técnico |
| **Observações** | O técnico vê apenas as leituras das parcelas dos agricultores que acompanha. |

### **Tela de Histórico de Leituras**

| Perfil de acesso | Agricultor (das suas parcelas) e Técnico (das que acompanha) |
| :---- | :---- |
| **Objectivo** | Consultar a evolução da humidade do solo ao longo do tempo. |
| **Campos / elementos** | Gráfico ou tabela cronológica de humidade por parcela Estado de validação de cada leitura |
| **Acções disponíveis** | Filtrar por parcela Filtrar por período |

## **4.4 Módulo F4 — Catálogo de Culturas e Recomendações**

### **Tela de Gestão do Catálogo de Culturas**

| Perfil de acesso | Administrador |
| :---- | :---- |
| **Objectivo** | Gerir a lista de culturas disponíveis no sistema. |
| **Campos / elementos** | Nome da cultura Época ideal Temperatura mínima e máxima Humidade mínima necessária Duração do ciclo (dias) |
| **Acções disponíveis** | Adicionar cultura Editar Remover |
| **Observações** | O catálogo inicial deve incluir, no mínimo, milho, feijão, mandioca e amendoim, conforme definido no plano de execução. |

### **Tela de Consulta do Catálogo de Culturas**

| Perfil de acesso | Técnico e Agricultor (apenas consulta) |
| :---- | :---- |
| **Objectivo** | Consultar as características das culturas disponíveis. |
| **Campos / elementos** | Lista de culturas com as respectivas características |
| **Acções disponíveis** | Pesquisar Filtrar |

### **Tela de Emissão de Recomendação**

| Perfil de acesso | Técnico |
| :---- | :---- |
| **Objectivo** | Emitir uma recomendação de cultura para uma parcela específica. |
| **Campos / elementos** | Parcela (selector) Cultura (selector do catálogo) Tipo de recomendação (ex.: sementeira, irrigação, adubação) Descrição personalizada |
| **Acções disponíveis** | Enviar recomendação |
| **Observações** | O envio gera automaticamente uma notificação para o agricultor responsável pela parcela. |

### **Tela de Recomendações Recebidas**

| Perfil de acesso | Agricultor |
| :---- | :---- |
| **Objectivo** | Consultar as recomendações recebidas para as suas parcelas. |
| **Campos / elementos** | Lista de recomendações ordenada por data, com parcela, cultura, técnico responsável e descrição |
| **Acções disponíveis** | Marcar como lida Ver detalhe |
| **Observações** | O agricultor não vê recomendações emitidas para outros agricultores. |

## **4.5 Módulo F5 — Catálogo de Pragas e Reporte de Ocorrências**

### **Tela de Gestão do Catálogo de Pragas**

| Perfil de acesso | Administrador |
| :---- | :---- |
| **Objectivo** | Gerir a lista de pragas comuns na região. |
| **Campos / elementos** | Nome da praga Culturas afectadas (associação ao catálogo de culturas) Época de surgimento Método de controlo |
| **Acções disponíveis** | Adicionar Editar Remover |
| **Observações** | O catálogo inicial deve incluir lagarta do cartucho, pulgão, broca do caule, mosca branca e ferrugem. |

### **Tela de Consulta do Catálogo de Pragas**

| Perfil de acesso | Agricultor e Técnico |
| :---- | :---- |
| **Objectivo** | Consultar o catálogo de pragas para identificar um problema numa cultura. |
| **Campos / elementos** | Lista de pragas com filtro por cultura |
| **Acções disponíveis** | Pesquisar Filtrar por cultura |

### **Tela de Reporte de Ocorrência**

| Perfil de acesso | Agricultor |
| :---- | :---- |
| **Objectivo** | Reportar a detecção de uma praga numa parcela. |
| **Campos / elementos** | Parcela (selector) Praga (selector do catálogo) Descrição da ocorrência Data (preenchida automaticamente) |
| **Acções disponíveis** | Submeter reporte |
| **Observações** | A submissão gera automaticamente um alerta para o técnico responsável. |

### **Tela de Ocorrências e Acompanhamento**

| Perfil de acesso | Técnico |
| :---- | :---- |
| **Objectivo** | Acompanhar as ocorrências de pragas reportadas pelos agricultores acompanhados. |
| **Campos / elementos** | Lista de ocorrências com parcela, agricultor, praga, data e estado (em aberto / resolvida) |
| **Acções disponíveis** | Ver detalhe Marcar como resolvida Adicionar observações |

## **4.6 Módulo F6 — Canal de Comunicação e Alertas**

### **Tela de Mensagens**

| Perfil de acesso | Agricultor e Técnico |
| :---- | :---- |
| **Objectivo** | Permitir a comunicação directa entre agricultor e técnico. |
| **Campos / elementos** | Lista de conversas por interlocutor Histórico de mensagens ordenado por data Campo de texto para nova mensagem |
| **Acções disponíveis** | Enviar mensagem |
| **Observações** | A actualização da conversa é feita por verificação periódica a cada 30 segundos (polling), sem recurso a WebSockets no MVP. O agricultor comunica apenas com o seu técnico e o técnico apenas com os agricultores que acompanha. |

### **Painel de Alertas**

| Perfil de acesso | Agricultor, Técnico e, de forma consolidada, Administrador |
| :---- | :---- |
| **Objectivo** | Apresentar os alertas gerados pelos eventos do sistema. |
| **Campos / elementos** | Lista de alertas por tipo (nova leitura, nova recomendação, nova ocorrência, nova mensagem) Indicador de alertas não lidos Data do alerta |
| **Acções disponíveis** | Marcar como lido Aceder directamente ao item de origem do alerta |
| **Observações** | O técnico recebe apenas os alertas relativos aos agricultores que acompanha; o agricultor recebe apenas os alertas relativos às suas próprias parcelas e comunicações; ao administrador pode ser apresentada uma visão consolidada, para fins de monitorização geral, sem acesso ao conteúdo detalhado das mensagens. |

# **5\. VISÃO GERAL POR PERFIL — O QUE CADA PERFIL VÊ E NÃO VÊ**

A tabela seguinte consolida, por área do sistema, o alcance de visualização de cada perfil.

| Área do sistema | Administrador | Técnico SDAE | Agricultor |
| ----- | :---: | :---: | :---: |
| Gestão de utilizadores | Total | Não vê | Não vê |
| Catálogo de culturas (gerir) | Total | Só consulta | Só consulta |
| Catálogo de pragas (gerir) | Total | Só consulta | Só consulta |
| Parcelas | Não vê | Só as que acompanha | Só as próprias |
| Leituras do solo | Não vê | Só as que acompanha (valida) | Só as próprias (regista) |
| Recomendações | Não vê | Emite para os seus agricultores | Recebe só as suas |
| Ocorrências de pragas | Não vê | Acompanha as dos seus agricultores | Reporta e vê só as suas |
| Mensagens | Não vê | Só as conversas com os seus agricultores | Só a conversa com o seu técnico |
| Alertas | Visão consolidada | Só os dos seus agricultores | Só os próprios |

O administrador está limitado, na prática operacional, à configuração dos catálogos de referência e à gestão de contas, não interferindo nos dados de parcelas, leituras, recomendações, ocorrências ou mensagens, o que preserva a separação de responsabilidades definida na funcionalidade F1.

# **6\. NOTA FINAL**

Esta especificação deve ser utilizada como referência directa para o desenvolvimento do frontend web e para a elaboração do Capítulo IV da monografia (Apresentação e Discussão de Resultados), servindo igualmente de base aos testes funcionais previstos no Sprint 4 e à verificação dos critérios de conclusão do projecto definidos para cada funcionalidade.