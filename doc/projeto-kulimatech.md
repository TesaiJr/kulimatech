# KulimaTech — Descrição do Projeto

> Documento extraído da monografia "Proposta de Desenvolvimento de um Sistema de Informação e Apoio à Tomada de Decisão para Agricultores do SDAE no Distrito de Nhamatanda" (Marcelo Tesai Faife, Licenciatura em Engenharia Informática, Universidade Zambeze, Beira, 2026. Orientador: MSc. Cristian Franklin Coulon).

---

## 1. O que é o projeto

**KulimaTech** é uma plataforma web (com abordagem híbrida web/móvel) de **informação e apoio à tomada de decisão agrícola**. Destina-se aos **agricultores familiares** e aos **técnicos de extensão do SDAE** (Serviços Distritais de Actividades Económicas) do **distrito de Nhamatanda, província de Sofala, Moçambique**.

O sistema não substitui os serviços de extensão existentes. Complementa-os, ampliando o seu alcance e a sua eficácia.

### Contexto
- A agricultura sustenta cerca de 70% da população rural moçambicana (FAO, 2022).
- Culturas principais do distrito: milho, feijão, mandioca e amendoim.
- Clima tropical húmido, com estação chuvosa de Outubro a Março e estação seca de Abril a Setembro.
- As decisões agrícolas assentam sobretudo em experiência empírica e tradição, o que torna a produção vulnerável à variabilidade climática.

---

## 2. Problemas que resolve

1. **Falta de acesso a informação meteorológica confiável e atempada.** Há poucas estações automáticas e não existem previsões à escala local.
2. **Ausência de monitorização sistemática da humidade do solo**, parâmetro decisivo para o momento da sementeira.
3. **Comunicação ineficiente entre agricultores e técnicos do SDAE**, por barreiras geográficas, falta de meios e falta de um sistema centralizado.

**Pergunta de investigação:** como pode um sistema de informação e apoio à decisão melhorar o acesso dos agricultores de Nhamatanda a informação meteorológica, dados de humidade do solo, recomendações de culturas e orientações de combate a pragas, facilitando a comunicação com os técnicos do SDAE?

---

## 3. Objectivos

### Objectivo geral
Desenvolver um sistema de informação e apoio à tomada de decisão para os agricultores do SDAE em Nhamatanda, que integre dados meteorológicos, humidade do solo, recomendações de culturas e combate a pragas, facilitando a comunicação entre técnicos e agricultores e promovendo uma agricultura mais produtiva e sustentável.

### Objectivos específicos
1. Levantar as necessidades informacionais de agricultores e técnicos do SDAE.
2. Integrar dados meteorológicos externos e informação sobre humidade do solo, apoiando o planeamento de sementeira e colheita.
3. Desenvolver módulos de recomendação de culturas e de orientação para combate a pragas.
4. Implementar um canal de comunicação digital agricultor ↔ técnico e validar o sistema com um grupo piloto.

### Hipóteses
- **H1:** o sistema melhora a produtividade ao fornecer dados meteorológicos, humidade do solo e recomendações de culturas.
- **H2:** o canal digital agricultor ↔ técnico acelera a disseminação de informação sobre práticas, pragas e clima.
- **H3:** uma interface adaptada à conectividade e à literacia digital rurais aumenta a adopção do sistema.

---

## 4. Utilizadores (perfis)

| Perfil | Papel no sistema |
|---|---|
| **Agricultor** | Regista parcelas e leituras de humidade do solo, reporta pragas, recebe recomendações e alertas, conversa com o seu técnico e consulta os catálogos. |
| **Técnico SDAE** | Acompanha uma carteira de agricultores, valida leituras, emite recomendações de culturas, acompanha ocorrências de pragas e conversa com os agricultores. |
| **Administrador** | Gere utilizadores e a atribuição de técnicos, gere os catálogos de culturas e pragas e tem a visão global do sistema. |

---

## 5. Resultados do levantamento de dados (base dos requisitos)

- **Agricultores:** 100 inquiridos (amostra aleatória simples, Cochran, 95% de confiança, 10% de erro). O cálculo deu 96, arredondado para 100.
- **Técnicos SDAE:** amostragem por censo, com entrevista semiestruturada.

Principais achados que justificam as funcionalidades:
- 38% decidem a época de sementeira por experiência própria e 22% pelos técnicos do SDAE.
- Só 44% têm previsões meteorológicas regularmente. 42% têm raramente e 14% não têm acesso.
- Perante uma praga, 49% pedem ajuda a outros agricultores, 24% aplicam pesticida sem orientação e apenas 22% contactam o técnico.
- 53,1% usam telemóvel regularmente na agricultura.
- Informação mais útil: previsão do tempo (34%), recomendação de culturas (24%), combate a pragas (20%), comunicação com técnicos (13%) e humidade do solo (9%).
- 51% usariam a aplicação com certeza e 32% talvez, dependendo da facilidade de uso.
- **Técnico entrevistado** (Anexo II): o SDAE já usa o Survey123. Pragas citadas: lagarta do funil e gafanhoto elegante (1.ª época); lagarta do cartucho, cochonilhas e ácaros (2.ª época). Funcionalidades essenciais pedidas: (1) facilidade de consulta e pesquisa de dúvidas dos produtores; (2) **não ser só para Android e iOS e não depender de internet para o acesso**.

---

## 6. Requisitos funcionais (RF01–RF14)

| Código | Descrição |
|---|---|
| **RF01** | Registo e autenticação com três perfis (Administrador, Técnico SDAE, Agricultor), gerando token JWT e redireccionando cada utilizador para o dashboard do seu perfil. |
| **RF02** | O agricultor regista, edita e consulta as suas parcelas (nome, área, tipo de solo, localização geográfica). O técnico consulta as parcelas dos agricultores que acompanha. |
| **RF03** | O agricultor regista leituras de humidade do solo (valor %, observações, data e hora) associadas a uma parcela. |
| **RF04** | O sistema valida automaticamente se a humidade está nos parâmetros normais, assinala anomalias e notifica o técnico responsável. |
| **RF05** | O técnico SDAE valida as leituras de solo registadas pelos agricultores. |
| **RF06** | Catálogo de culturas (época ideal, temperatura, humidade mínima, duração do ciclo). |
| **RF07** | O técnico emite recomendações de culturas para parcelas específicas, com descrição personalizada. |
| **RF08** | O agricultor é notificado de cada nova recomendação e consulta-as no painel, ordenadas por data. |
| **RF09** | Catálogo de pragas com filtro por cultura (culturas afectadas, época de surgimento, método de controlo). |
| **RF10** | O agricultor reporta uma ocorrência de praga associada a uma parcela, com descrição e data. |
| **RF11** | O técnico é notificado de novas ocorrências de pragas e acompanha a sua resolução. |
| **RF12** | Chat interno agricultor ↔ técnico, com histórico de mensagens. |
| **RF13** | Alertas automáticos (novas leituras, recomendações, ocorrências de pragas e mensagens), com possibilidade de marcar como lidos. |
| **RF14** | O administrador gere (cadastra e edita) os catálogos de culturas e de pragas. |

## 7. Requisitos não funcionais (RNF01–RNF05)

| Código | Descrição | Categoria |
|---|---|---|
| **RNF01** | Senhas com hash (bcrypt), acesso por perfil e token JWT com expiração de 24 h. | Segurança |
| **RNF02** | Aplicação móvel em Flutter (Android e iOS). | Portabilidade |
| **RNF03** | API REST em Node.js/Express e base de dados MySQL, conforme o Diagrama ER. | Arquitectura |
| **RNF04** | Mensagens e alertas actualizados por *polling* a cada 30 s, sem WebSockets no MVP. | Desempenho |
| **RNF05** | Operações críticas com transacções SQL e código-fonte em Git/GitHub. | Confiabilidade |

> ⚠️ **Inconsistência da monografia.** RNF02 e RNF03 (Flutter, Node/Express e MySQL) contradizem a arquitectura implementada, descrita no Cap. 3.7, no Cap. 4.4 e na Conclusão: **Next.js + Tailwind + Supabase (Auth, API REST, Realtime) + PostgreSQL**. O projecto real usa a segunda pilha. Os RNF02 e RNF03 devem ser tratados como **desactualizados** e não como alvo de implementação. Convém confirmar isto com o autor.

---

## 8. Modelo de dados (Diagrama ER / Classes)

Todas as chaves primárias são `uuid`.

- **UTILIZADOR**: id, nome, email, senhaHash, telefone, perfil (enum: administrador | tecnico | agricultor), ativo, dataCadastro.
- **TECNICO**: id, utilizadorId (FK), numeroBi, especialidade, dataAdmissao. *(Um utilizador pode ser técnico, relação 0..1.)*
- **AGRICULTOR**: id, utilizadorId (FK), tecnicoId (FK), aldeiaZona, nivelEscolaridade, anoExperiencia. *(Um técnico acompanha 0..* agricultores.)*
- **PARCELA**: id, agricultorId (FK), nome, areaHectares, tipoSolo, latitude, longitude, dataCadastro.
- **LEITURA_SOLO**: id, parcelaId (FK), agricultorId (FK), humidade (decimal), observacoes, dataLeitura, validadoPorTecnico (bool).
- **CULTURA**: id, nome, descricao, epocaIdeal, tempMinima, tempMaxima, humidadeMinima, ciclosDias.
- **PRAGA**: id, culturaId (FK), nome, descricao, epocaSurgimento, metodoControlo, imagem.
- **RECOMENDACAO**: id, parcelaId (FK), culturaId (FK), tecnicoId (FK), tipoRecomendacao, descricao, dataRecomendacao, validadoPorTecnico.
- **OCORRENCIA_PRAGA**: id, parcelaId (FK), pragaId (FK), agricultorId (FK), descricao, dataOcorrencia, resolvida (bool).
- **MENSAGEM**: id, remetenteId (FK), destinatarioId (FK), conteudo, lida (bool), dataEnvio.
- **ALERTA**: id, parcelaId (FK), utilizadorId (FK), tipoAlerta, mensagem, enviado (bool), visualizado (bool), dataAlerta.

**Relações:** Agricultor 1—N Parcela. Parcela 1—N Leitura, Recomendação e Ocorrência. Cultura 1—N Praga e 1—N Recomendação. Praga 1—N Ocorrência. Utilizador 1—N Mensagem (enviadas e recebidas) e 1—N Alerta.

**Métodos de classe previstos** (diagrama de classes): `autenticar`, `getById`, `getByEmail`, `getByDestinatario`, `marcarLida`, `getByUtilizador`, `marcarVisualizado`, `getAgricultores`, `getByTecnico`, `getByParcela`, `validar`, `getByEpoca`, `getByCultura`, `getAll`, `resolver`.

## 9. Fluxos principais (diagramas de sequência / actividade / casos de uso)

- **Login:** o utilizador introduz e-mail e senha, o sistema verifica o hash e devolve o token JWT mais o perfil, depois redirecciona para o dashboard (agricultor, técnico ou administração). Com credenciais erradas devolve 401 e mostra erro.
- **Emissão de recomendação (técnico):** lista os seus agricultores, selecciona agricultor e parcela, carrega as culturas, escolhe a cultura e preenche a descrição. Grava a recomendação, cria um alerta e notifica o agricultor.
- **Registo de solo (agricultor):** selecciona a parcela, preenche humidade e observações, grava a leitura, cria um alerta e notifica o técnico para validar.
- **Casos de uso:**
  - *Administrador:* autenticar, gerir utilizadores.
  - *Técnico:* autenticar, emitir recomendação (inclui consultar catálogo de culturas), enviar mensagem.
  - *Agricultor:* gerir parcelas, registar leitura do solo (extend → receber alerta), reportar ocorrência de praga (extend → receber alerta; inclui consultar catálogo de pragas), enviar mensagem.

---

## 10. Arquitectura e tecnologias (a real, implementada)

Arquitectura cliente-servidor em **três camadas**:

1. **Apresentação:** interface web em **Next.js**, estilizada com **Tailwind CSS** (responsiva).
2. **Lógica de negócio:** **Supabase** (BaaS), com autenticação, API REST gerada automaticamente e comunicação em tempo real.
3. **Dados:** **Supabase / PostgreSQL**, com integridade referencial e transacções.

Ferramentas: Visual Studio Code, npm, LucidChart (UML), Git/GitHub. Metodologia: **Scrum** (sprints de 2 semanas). APIs meteorológicas referidas na literatura: Open-Meteo, OpenWeatherMap e Meteomatics.

---

## 11. Telas do sistema

### Telas demonstradas na monografia (Figuras 11–16)
1. **Landing page** (Fig. 11): hero "Apoio à Decisão Agrícola para o Distrito de Nhamatanda", botão **"Aceder ao Sistema"** e navegação com Visão Geral, Como Funciona e Institucional.
2. **Registo do agricultor** (Fig. 12/13): nome completo, e-mail, contacto (+258), zona/comunidade de Nhamatanda (select), palavra-passe, confirmar palavra-passe, indicador de força da senha, checkbox de consentimento de tratamento de dados agroclimáticos, botão "Concluir Registo" e link "Iniciar Sessão". Layout em dois painéis: imagem com testemunho à esquerda e formulário à direita.
3. **Login** (Fig. 12/13): e-mail e palavra-passe (com mostrar/ocultar), "Manter sessão iniciada", "Esqueceu a senha?", botão "Entrar" e link "Criar conta". Redirecciona por perfil.
4. **Painel da Exploração do Agricultor** (Fig. 14).
   - Menu lateral: *Minha Exploração* (Painel da Exploração, As Minhas Parcelas, Registar Humidade do Solo), *Acompanhamento Técnico* (Recomendações Recebidas, Reportar Ocorrência com badge "Alerta", Meu Técnico SDAE) e *Conhecimento* (Guia de Culturas & Pragas).
   - Conteúdo:
     - gráfico de evolução da humidade do solo (média do período, faixa óptima 40–75%, humidade e temperatura dos últimos 7 dias);
     - cartões de tendência hídrica, estabilidade do solo e necessidade de rega;
     - **Diagrama de Talhões** com o estado hídrico por parcela e botão "Ver Todos";
     - botão "Gerir Características dos Talhões";
     - **Diagrama do Ciclo Agronómico & Extensão Rural** (época 2026);
     - cartão de **Meteorologia Local** (temperatura, ex.: 28 °C).
5. **Dashboard do Técnico SDAE** (Fig. 15).
   - Cartões: Agricultores Vinculados, Parcelas Monitoradas (com área total em ha), Leituras Recentes e Ocorrências de Pragas.
   - Listas: Leituras Recentes de Humidade (botão "Ver Parcelas") e Agricultores Acompanhados.
   - Acesso rápido às leituras pendentes de validação.
6. **Dashboard do Administrador** (Fig. 16).
   - Cartões: Contas no Sistema (técnicos e agricultores), Parcelas Registadas, Catálogo de Culturas e Catálogo de Pragas.
   - Listas: Técnicos SDAE & Carteiras Técnicas e Catálogo Mestre de Culturas.
   - Menu lateral: Painel do Sistema, Todas as Parcelas, Utilizadores e Atribuições, Catálogo de Culturas, Catálogo de Pragas & Doenças, Mensagens & Alertas.

Elementos comuns do layout: logótipo KulimaTech ("Moçambique"), menu lateral recolhível, ícone de notificações (sino), avatar e nome do utilizador com perfil, botão "Sair", rodapé com "Sistemas Operacionais" e versão (v1.0.0), e tema verde-escuro com acentos verde-lima sobre fundo creme.

### Telas implícitas nos requisitos (não mostradas na monografia, mas necessárias)
- **Agricultor:** lista e formulário de parcelas (RF02), formulário de registo de humidade (RF03), lista de recomendações recebidas por data (RF08), formulário e lista de ocorrências de pragas (RF10), chat com o técnico (RF12), centro de alertas (RF13), catálogo de culturas (RF06) e catálogo de pragas com filtro por cultura (RF09).
- **Técnico:** parcelas dos seus agricultores (RF02), validação de leituras (RF05), formulário de emissão de recomendação (RF07), acompanhamento e resolução de ocorrências de pragas (RF11), chat (RF12) e alertas (RF13).
- **Administrador:** gestão de utilizadores e atribuição de técnicos a agricultores, CRUD do catálogo de culturas e CRUD do catálogo de pragas (RF14), vista de todas as parcelas e mensagens/alertas.

---

## 12. Estado declarado pelo autor

- Protótipo funcional (MVP) validado com um grupo restrito de utilizadores piloto, **sem implementação em larga escala**.
- A monografia afirma contemplar RF01–RF14, mas a **RF13 (alertas) foi implementada apenas ao nível conceptual**, sem notificação em tempo real.
- **Integração com API meteorológica:** é objectivo do projecto e consta do cartão "Meteorologia Local" do painel. A secção de Sugestões trata-a como trabalho futuro, por isso o seu estado real deve ser verificado no código.
- Os dashboards do Técnico e do Administrador aparecem **com valores a zero** nas capturas (sem dados).

## 13. Sugestões / trabalho futuro (fora do âmbito mínimo)

1. Concluir alertas e notificações em tempo real (RF13).
2. Validação em maior escala, durante pelo menos um ciclo agrícola.
3. Integrar previsões meteorológicas por API (Open-Meteo, OpenWeatherMap).
4. Sensores IoT de humidade do solo (baixo custo).
5. Aprendizagem automática para janelas de sementeira e risco de pragas.
6. **Suporte offline** e sincronização para zonas de conectividade limitada. Foi também pedido pelo técnico entrevistado.
7. Expansão do catálogo a outros distritos de Sofala.
8. Avaliar custos de manutenção, formação e parcerias para a sustentabilidade.

---

## 14. Notas de consistência da monografia

- Pilha tecnológica contraditória: RNF02/RNF03 (Flutter, Node/Express, MySQL) contra o Cap. 4.4 (Next.js, Supabase, PostgreSQL). Vale a pilha real.
- Os diagramas de sequência mostram "Aplicação Móvel" e "Servidor API", mas a implementação é web com Supabase.
- RNF04 prevê *polling* de 30 s, enquanto a descrição do Supabase fala em tempo real. Decisão a tomar na implementação.
- As legendas das Figuras 12 e 13 parecem trocadas em relação às imagens (a imagem de login aparece sob "registo" e vice-versa).
- Amostra de agricultores: 100 em quase todo o texto, mas 96 em 3.4.1.
- Tamanho da amostra: 96 calculado, 100 usado.
