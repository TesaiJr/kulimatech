# Plano Detalhado de Implementação — Fase 6

## Informações do Documento
* Módulo: Central de Alertas, Comunicação Dinâmica e Meteorologia Open-Meteo
* Requisitos Atendidos: RF12 (Canal de mensagens diretas entre agricultor e técnico com sincronização), RF13 (Central de alertas e notificações com marcação de leitura e badge dinâmico), RNF04 (Sincronização periódica / polling a cada 30 segundos com economia de tráfego móvel), RNF02 (Resiliência offline e cache para conexões 3G instáveis)
* Projeto: KulimaTech (SDAE Nhamatanda / UniZambeze)
* Alvo: Fase 6 do Plano Geral de Engenharia (`doc/plano.md`)
* Pilha Tecnológica: Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma ORM 7.x, PostgreSQL (Supabase), Open-Meteo API v1, Lucide React
* Versão: 1.0.0
* Data de Elaboração: Outubro de 2026
* Estado: **Aguardando aprovação**

---

## 1. Escopo e Objetivos da Fase 6

A **Fase 6** conecta operacionalmente todos os atores do KulimaTech ao ambiente físico e temporal do distrito de Nhamatanda. Uma plataforma de extensão agrária em Moçambique depende criticamente de:
1. **Consciência Climática Local:** Os agricultores e extensionistas precisam de dados agroclimáticos reais (temperatura, humidade do ar, probabilidade de chuva e vento) calibrados especificamente para as coordenadas de Nhamatanda (-19.2667, 34.2167), com previsões a 3 dias que orientem a tomada de decisão sobre rega, pulverização e plantio.
2. **Alertas em Tempo Quase-Real e Visibilidade:** O sino de notificações na barra superior (`Header`) e os contadores no menu lateral (`AppSidebar`) devem refletir com precisão a contagem de alertas não lidos, sem exigir recarregamento manual da página pelo utilizador.
3. **Sincronização Eficiente e Económica (RNF04):** No contexto rural de Sofala, onde o tráfego de dados móveis é caro e instável, a sincronização deve utilizar rotas ultra-leves (`/api/alertas/unread-count`) com polling inteligente de 30 segundos (ativo apenas quando a aba do navegador estiver em foco), e cache HTTP/memória de 30 minutos para os dados meteorológicos da Open-Meteo.
4. **Central de Alertas e Notificações Consolidada:** Interface visual de alta usabilidade em `/mensagens/alertas`, permitindo filtrar notificações por tipo (`HUMIDADE_CRITICA`, `PRAGA_REPORTADA`, `NOVA_RECOMENDACAO`, `NOVA_MENSAGEM`, `SISTEMA`), marcar alertas individualmente ou em lote como lidos, e navegar diretamente para a ação resolutiva através de links contextuais.

---

## 2. Diagnóstico do Estado Atual

| Componente | Estado Atual | Diagnóstico / Necessidade na Fase 6 |
| :--- | :--- | :--- |
| **API Open-Meteo** | Não integrada | Inexistente no backend. Não há rota `/api/meteorologia` nem integração externa ativa. |
| **Componente Meteorológico** | Ausente | Os painéis de Agricultor e Técnico não possuem um cartão de clima real com previsão e recomendações agroclimáticas de Nhamatanda. |
| **Rota de Contagem Leve** | Ausente | `GET /api/alertas` retorna toda a lista de objetos (pesada para polling a cada 30s). Falta a rota especializada `GET /api/alertas/unread-count`. |
| **Badge do Sino no Header** | Estático (`0`) | O `Header.tsx` suporta a propriedade `unreadNotificationsCount`, mas o `DashboardLayout.tsx` não fornece os dados nem escuta atualizações. O sino permanece inerte. |
| **Contador no Menu Lateral** | Vazio | O item "Painel de Alertas" no `AppSidebar` não exibe badge com o total de alertas pendentes. |
| **Hook de Polling / Sincronização** | Inexistente | Não há hook global que faça verificação periódica leve (30s) quando a aba está visível (`document.visibilityState === 'visible'`). |
| **Central `/mensagens/alertas`** | Parcial | Já existe `AlertasContainer` com suporte a SSE, mas faltam filtros rápidos refinados por abas de tipo de alerta, estatísticas visuais no topo e integração uniforme com a barra de layout. |
| **Chat (`/mensagens`)** | Funcional | O chat já opera com SSE, mas deve ter fallback para polling leve caso a conexão SSE caia em redes rurais instáveis. |

---

## 3. Arquitetura das APIs REST (Backend)

### 3.1 Módulo Meteorológico (`/api/meteorologia`)

* **`GET /api/meteorologia`** (Novo)
  - **Acesso:** Todos os utilizadores autenticados.
  - **Provedor:** Open-Meteo Forecast API (gratuita, sem chave de API restritiva, alta disponibilidade).
  - **Coordenadas de Nhamatanda:**
    - Latitude: `-19.2667`
    - Longitude: `34.2167`
    - Altitude média: ~150 m
  - **Parâmetros da Consulta Externa:**
    ```
    https://api.open-meteo.com/v1/forecast?latitude=-19.2667&longitude=34.2167&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Africa%2FMaputo&forecast_days=4
    ```
  - **Estratégia de Cache e Resiliência (RNF02/RNF04):**
    - Cache em memória com TTL de 30 minutos (Next.js `revalidate = 1800` ou cache interno em variável de memória com timestamp).
    - Se a chamada à Open-Meteo falhar (timeout ou queda de internet), a API retorna os últimos dados válidos em cache ou valores sazonais médios de fallback para Nhamatanda, garantindo que o painel nunca quebre.
  - **Estrutura de Resposta Normalizada:**
    ```json
    {
      "localizacao": "Distrito de Nhamatanda, Sofala",
      "coordenadas": { "latitude": -19.2667, "longitude": 34.2167 },
      "atual": {
        "temperatura": 28.4,
        "sensacaoTermica": 30.1,
        "humidadeRelativa": 68,
        "precipitacao": 0.0,
        "velocidadeVento": 12.5,
        "condicao": "Parcialmente Nublado",
        "codigoClima": 2,
        "icone": "cloud-sun"
      },
      "previsao3Dias": [
        {
          "data": "2026-10-13",
          "tempMin": 21.0,
          "tempMax": 32.5,
          "probabilidadeChuva": 15,
          "condicao": "Sol com algumas nuvens"
        },
        {
          "data": "2026-10-14",
          "tempMin": 22.0,
          "tempMax": 33.0,
          "probabilidadeChuva": 40,
          "condicao": "Aguaceiros dispersos"
        },
        {
          "data": "2026-10-15",
          "tempMin": 20.5,
          "tempMax": 29.0,
          "probabilidadeChuva": 75,
          "condicao": "Chuva moderada"
        }
      ],
      "recomendacaoAgricola": "Condições favoráveis para maneio e colheita nas próximas 48h. Probabilidade de precipitação no final da semana; proteja culturas em secagem ao ar livre.",
      "atualizadoEm": "2026-10-12T16:30:00.000Z"
    }
    ```

---

### 3.2 Módulo de Alertas Dinâmicos (`/api/alertas`)

* **`GET /api/alertas/unread-count`** (Novo — Rota Ultra-Leve)
  - **Acesso:** Autenticado (`requireAuth`).
  - **Lógica:** Executa apenas `prisma.alerta.count({ where: { userId: session.userId, lido: false } })`.
  - **Tamanho do Payload:** Menos de 50 bytes JSON (`{ "count": 3 }`), viabilizando polling a cada 30s sem sobrecarga nem consumo de dados.

* **`GET /api/alertas`** (Refinamento)
  - Suporte a paginação, filtro por `tipo` (`HUMIDADE_CRITICA`, `PRAGA_REPORTADA`, `NOVA_RECOMENDACAO`, `NOVA_MENSAGEM`, `SISTEMA`) e por `lido`.

* **`PATCH /api/alertas`** (Marcação em Lote)
  - Marca todos os alertas do utilizador logado como lidos (`lido = true`).

* **`PATCH /api/alertas/[id]`** (Marcação Individual)
  - Marca um alerta específico como lido, validando a posse (`userId === session.userId`).

---

## 4. Arquitetura Frontend

### 4.1 Feature de Meteorologia (`src/features/meteorologia`)

1. **`types.ts`**:
   - `WeatherData`, `CurrentWeather`, `DailyForecast`, `WeatherCondition`.
2. **`services/meteorologiaService.ts`**:
   - `getMeteorologia()`: chamada tipada a `/api/meteorologia`.
3. **`hooks/useMeteorologia.ts`**:
   - Hook React com cache SWR/React local, estados de carregamento, erro e atualização sob demanda.
4. **`components/WeatherCard.tsx`**:
   - Cartão meteorológico de alta qualidade visual:
     - Destaque para temperatura atual em Nhamatanda, humidade relativa e probabilidade de chuva.
     - Ícones animados/dinâmicos conforme o `weather_code` da WMO (sol, nuvens, chuva, tempestade).
     - Carrossel ou grelha de previsão para os próximos 3 dias.
     - **Caixa de Orientação Agroclimática**: recomendação automática para o agricultor (ex: "Sem previsão de chuva — planeie a irrigação matinal" ou "Alerta de chuva iminente — adie a aplicação de defensivos").

---

### 4.2 Sincronização Dinâmica e Polling Inteligente (`src/hooks`)

1. **`src/hooks/usePollingNotification.ts`**:
   - Faz polling para `/api/alertas/unread-count` a cada 30 segundos.
   - **Regra de Visibilidade:** Se `document.visibilityState === 'hidden'`, pausa o timer para poupar bateria e dados móveis do dispositivo do agricultor; retoma imediatamente ao voltar à aba.
   - Fornece `unreadCount`, `mutate(newCount)` e `refresh()`.

2. **Integração no Layout Global (`DashboardLayout.tsx` e `Header.tsx`):**
   - O `DashboardLayout` consome o `usePollingNotification`.
   - Repassa `unreadNotificationsCount={unreadCount}` ao `Header`.
   - Ao clicar no sino de notificações, redireciona o utilizador para `/mensagens/alertas`.
   - Atualiza o badge do menu lateral no item "Painel de Alertas" com o número pendente.

---

### 4.3 Central de Alertas e Notificações (`src/features/comunicacao`)

1. **Refinamento de `AlertasContainer.tsx` e `/mensagens/alertas/page.tsx`:**
   - Abas por categoria de alerta:
     - `Todos` (com contador global)
     - `Humidade Crítica` (solo ressequido ou saturado)
     - `Pragas & Doenças` (reportes de infestações)
     - `Recomendações` (pareceres técnicos emitidos)
     - `Mensagens` (novas conversas no chat)
     - `Sistema` (atribuições de carteira, contas e avisos SDAE)
   - Botão de ação rápida **"Marcar todos como lidos"** com atualização otimista instantânea no sino e na lista.
   - Cartões de alerta com design melhorado: link direto clicável para resolver a ocorrência (ex: redireciona para a parcela, para a recomendação ou para o chat).

---

### 4.4 Inclusão do `WeatherCard` nos Dashboards

* **Dashboard do Agricultor:** Cartão meteorológico colocado em destaque ao lado do resumo de humidade das parcelas, permitindo ao produtor correlacionar a previsão do tempo com as medições de campo.
* **Dashboard do Técnico:** Exibição do clima regional de Nhamatanda para apoiar o planeamento de visitas de extensão agrária aos postos administrativos.

---

## 5. Matriz de Ficheiros Impactados e Criados

| Ficheiro | Camada | Ação | Descrição Técnica |
| :--- | :--- | :--- | :--- |
| `src/app/api/meteorologia/route.ts` | Backend API | Criar | Integração Open-Meteo para Nhamatanda com cache de 30 min e fallback |
| `src/app/api/alertas/unread-count/route.ts` | Backend API | Criar | Endpoint leve para contagem de alertas não lidos |
| `src/features/meteorologia/types.ts` | Types | Criar | Tipos da previsão do tempo e índices agroclimáticos |
| `src/features/meteorologia/services/meteorologiaService.ts` | Service | Criar | Cliente HTTP da rota meteorológica |
| `src/features/meteorologia/hooks/useMeteorologia.ts` | Hook | Criar | Hook de carregamento do clima com cache local |
| `src/features/meteorologia/components/WeatherCard.tsx` | UI Component | Criar | Cartão visual de clima com previsão a 3 dias e dicas agrícolas |
| `src/features/meteorologia/index.ts` | Barrel | Criar | Exportações públicas da feature |
| `src/hooks/usePollingNotification.ts` | Core Hook | Criar | Polling a cada 30s pausado em segundo plano (RNF04) |
| `src/components/layout/Header.tsx` | Layout | Modificar | Ativar navegação para `/mensagens/alertas` ao clicar no sino |
| `src/components/layout/DashboardLayout.tsx` | Layout | Modificar | Conectar `usePollingNotification` ao Header e Sidebar |
| `src/components/layout/AppSidebar.tsx` | Layout | Modificar | Exibir badge numérico de alertas não lidos no menu |
| `src/features/comunicacao/components/AlertasContainer.tsx` | UI Component | Modificar | Abas por categoria de alerta e atualização otimista |
| `src/app/(dashboard)/dashboard/page.tsx` | Page UI | Modificar | Integrar `WeatherCard` no painel de Agricultor e Técnico |
| `scripts/verify-fase6-alertas-meteo.mjs` | Testes / QA | Criar | Script automatizado para testar Open-Meteo, rota leve e notificações |
| `doc/guia-testes-frontend.md` | Documentação | Modificar | Inclusão dos roteiros de validação da Fase 6 |

---

## 6. Roteiro Passo a Passo de Execução

### Passo 1: Backend de Meteorologia e Alertas Leves
1. **Criar `/api/meteorologia/route.ts`**:
   - Conectar à API Open-Meteo com coordenadas de Nhamatanda.
   - Mapear códigos WMO para descrições textuais em português e ícones semânticos.
   - Implementar algoritmo de recomendação agrícola contextual (com base na humidade do ar e probabilidade de chuva).
   - Implementar cache com revalidação a cada 1800 segundos (30 min) e fallback caso ocorra falha de rede.
2. **Criar `/api/alertas/unread-count/route.ts`**:
   - Retornar `{ count: number }` com contagem direta do Prisma em menos de 10 ms.

### Passo 2: Camada de Meteorologia no Frontend
1. Criar `src/features/meteorologia/` com tipos, serviço, hook e componente visual `WeatherCard.tsx`.
2. Integrar o `WeatherCard` nos painéis do Agricultor e do Técnico em `src/app/(dashboard)/dashboard/page.tsx`.

### Passo 3: Mecanismo de Sincronização Dinâmica
1. Criar `src/hooks/usePollingNotification.ts` com intervalo de 30 segundos e detecção de visibilidade de página (`visibilitychange`).
2. Atualizar `DashboardLayout.tsx` para alimentar o `Header.tsx` e o `AppSidebar.tsx` com a contagem real de notificações.
3. Testar a transição do badge ao clicar no sino e ao marcar alertas como lidos.

### Passo 4: Central de Alertas Aprimorada
1. Refinar `AlertasContainer.tsx` para incluir filtros por abas temáticas (`HUMIDADE_CRITICA`, `PRAGA_REPORTADA`, `NOVA_RECOMENDACAO`, `NOVA_MENSAGEM`, `SISTEMA`).
2. Assegurar que "Marcar todos como lidos" zera imediatamente o sino no topo sem recarregar a página (F5).

### Passo 5: Homologação e Testes Automatizados
1. Criar `scripts/verify-fase6-alertas-meteo.mjs` cobrindo:
   - Consulta à API Open-Meteo de Nhamatanda e resposta íntegra dos dados atuais e previsão de 3 dias.
   - Resposta do endpoint `/api/alertas/unread-count`.
   - Disparo e contagem de alertas não lidos de diferentes tipos.
   - Marcação em lote e verificação de zeramento da contagem.
2. Validar a ausência de erros de compilação estática (`npx tsc --noEmit`).
3. Atualizar `doc/guia-testes-frontend.md`.

---

## 7. Critérios de Aceitação da Fase 6

1. **Previsão do Tempo em Nhamatanda:**
   - O painel exibe a temperatura atual real e a previsão para os próximos 3 dias para o distrito de Nhamatanda obtidas via Open-Meteo.
   - Em caso de desconexão da internet, a interface mantém a última medição em cache com aviso amigável, sem quebrar o layout.
   - É apresentada recomendação técnica agroclimática automatizada baseada nas condições do tempo.
2. **Sino de Alertas Dinâmico:**
   - O sino no cabeçalho superior (`Header`) exibe o badge vermelho/âmbar com a quantidade exata de alertas pendentes.
   - O contador atualiza dinamicamente a cada 30 segundos (ou imediatamente via SSE) sem intervenção do utilizador.
   - O polling é pausado quando a janela do navegador está minimizada ou em segundo plano.
   - Ao clicar no sino, o utilizador é encaminhado para `/mensagens/alertas`.
3. **Central de Alertas Operacional:**
   - O utilizador consegue filtrar alertas por categoria e marcar alertas individuais ou todos como lidos.
   - Ao marcar como lidos, o sino da barra superior é zerado imediatamente.
4. **Qualidade e Estabilidade:**
   - O script `scripts/verify-fase6-alertas-meteo.mjs` é executado com 100% de aprovação.
   - Nenhuma regressão de tipos TypeScript (`npx tsc --noEmit` sem erros).

---

## 8. Decisões Técnicas para Homologação

| # | Ponto em Análise | Proposta de Engenharia |
| :---: | :--- | :--- |
| **1** | **Provedor Meteorológico** | **Open-Meteo API.** Gratuita para uso não comercial/académico, sem necessidade de API key privada, suporta coordenadas exatas de Nhamatanda e providencia variáveis agroclimáticas (humidade a 2m, radiação, chuva). |
| **2** | **Tempo de Cache Meteorológico** | **30 Minutos (1800 s).** O clima em Nhamatanda não muda drasticamente em minutos, e a cache poupa requisições e dados móveis de utilizadores rurais em redes 3G. |
| **3** | **Frequência de Polling de Notificações** | **30 Segundos com pause em background.** Em total conformidade com o RNF04 da monografia, com interrupção quando a aba estiver inativa para preservar a bateria do smartphone. |
| **4** | **Destino do Clique no Sino** | **Redirecionamento para `/mensagens/alertas`.** Mantém a experiência consistente com a arquitetura de páginas já estabelecida. |

---

Após a aprovação deste documento, geramos o plano de execução para homologação e implementamos todos os entregáveis da Fase 6.
