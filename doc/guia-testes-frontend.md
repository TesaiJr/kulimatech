# Guia de Testes Práticos no Frontend (Fase 1, Fase 2 e Fase 3)

Este documento contém o passo a passo detalhado para testar interativamente na interface web todas as funcionalidades desenvolvidas nas **Fases 1, 2 e 3** do projeto **KulimaTech**.

---

## 1. Como Iniciar a Aplicação Localmente

Abra o terminal na pasta do projeto (`c:\Users\User\Desktop\marcelo\frontend`) e execute:

### Modo de Desenvolvimento (Recomendado para Testes Interativos)
```bash
npm run dev
```
* Aceda no seu navegador a: **`http://localhost:3000`**

### Modo de Produção (Para Validação de Build Completo)
```bash
npm run build
npm run start
```

---

## 2. Contas e Credenciais de Acesso para Demonstração

O sistema possui controlo estrito de acessos (RBAC). Utilize as contas pré-configuradas no banco de dados para alternar entre os perfis:

| Papel | Email | Senha | Função no Sistema |
| :--- | :--- | :--- | :--- |
| **Agricultor Familiar** | `agricultor@kulimatech.mz` | `Agricultor123` | Regista leituras, consulta catálogo e reporta ocorrências de pragas |
| **Técnico SDAE** | `tecnico@kulimatech.mz` | `Tecnico123` | Valida leituras de solo, emite pareceres agronómicos e resolve ocorrências |
| **Administrador** | `admin@kulimatech.mz` | `Admin123` | Visão distrital completa, gestão de contas e catálogos mestres |

> **Dica:** Para alternar entre contas, basta aceder à página de login em **`http://localhost:3000/auth?mode=login`** ou clicar no botão **Sair** no menu lateral.

---

## 3. Testes da Fase 1: Infraestrutura e Modelo de Dados

A Fase 1 prepara o banco de dados e as relações para todo o sistema.

* **Teste Automatizado:**
  ```bash
  node scripts/verify-fase1-schema.mjs
  ```
* **O que verificar:**
  - Todas as tabelas (`LeituraSolo`, `Praga`, `Cultura`, `OcorrenciaPraga`, `TecnicoAgricultor`) conectam-se sem erros ao PostgreSQL do Supabase.
  - O script deve retornar: `HOMOLOGAÇÃO DA FASE 1 CONCLUÍDA COM 100% DE ÊXITO!`.

---

## 4. Testes da Fase 2: Módulo de Leituras de Solo e Validação Técnica

Rota principal no navegador: **`http://localhost:3000/leituras`**

### 4.1 Teste no Papel do Agricultor (`agricultor@kulimatech.mz`)
1. **Login:** Aceda a `/auth?mode=login` e entre com as credenciais de Agricultor.
2. **Navegação:** No menu lateral, clique em **Leituras** (ou **Humidade do Solo**).
3. **Visão Geral:**
   - Observe os 4 cartões no topo: *Total de Leituras*, *Pendentes de Validação*, *Humidade Média (7d)* e *Anomalias Críticas*.
4. **Registo de Nova Leitura (RF03):**
   - Clique no botão verde **"+ Nova Leitura"** no canto superior direito.
   - Selecione a sua parcela no seletor.
   - Arraste o cursor de humidade ou digite um valor:
     - Observe a **Barra de Escala Agronómica** atualizando em tempo real:
       - `< 25%`: Marcador em vermelho (*Crítica*)
       - `25% - 34%`: Marcador em amarelo (*Baixa*)
       - `35% - 55%`: Marcador em verde (*Óptima*)
       - `> 55%`: Marcador em azul (*Excessiva*)
   - Digite uma humidade crítica de teste (ex: `18%`).
   - Introduza temperatura opcional (ex: `29.5°C`) e observação de campo.
   - Clique em **"Confirmar e Registar"**.
5. **Resultado Imediato:**
   - A leitura aparece na tabela com badge vermelho `18% (Crítica)`.
   - Na coluna *Validação Técnica*, o badge exibe `⏳ Pendente` com a legenda *"Aguardando parecer"*.
   - Um alerta automático foi gerado internamente para o Técnico supervisor (**RF04**).

---

### 4.2 Teste no Papel do Técnico SDAE (`tecnico@kulimatech.mz`)
1. **Login:** Saia da conta do agricultor e entre com a conta do Técnico SDAE.
2. **Acesso:** Aceda à rota **`http://localhost:3000/leituras`**.
3. **Aba de Pendências:**
   - Note a aba em destaque **"Pendentes de Validação"** com um contador numérico amarelo (ex: `1`).
   - Clique na aba **"Pendentes de Validação"** para filtrar automaticamente apenas as medições que aguardam homologação.
4. **Homologação Agronómica (RF05):**
   - Na tabela, localize a leitura registada pelo agricultor e clique no botão verde **"Validar"**.
   - No modal que se abre:
     - O sistema exibe o resumo da parcela, do agricultor e a barra de humidade.
     - Deixe selecionado **"Homologar e Aprovar"**.
     - No campo de parecer, digite: *"Nível hídrico crítico confirmado. Recomenda-se irrigação de urgência."*
     - Clique em **"Confirmar Homologação"**.
5. **Resultado da Validação:**
   - A linha atualiza instantaneamente:
     - Badge verde: `✔ Homologada`.
     - Exibe o nome do técnico validador: `Tecnico Arnaldo (SDAE)`.
     - Exibe o parecer técnico em itálico.
   - O contador de pendências reduz automaticamente.

---

## 5. Testes da Fase 3: Catálogo de Pragas e Gestão de Ocorrências

Rotas principais:
* Catálogo de Pragas: **`http://localhost:3000/pragas`**
* Painel de Ocorrências: **`http://localhost:3000/pragas/ocorrencias`**

### 5.1 Teste do Catálogo com Filtro por Cultura (RF09)
1. **Aceder ao Catálogo:** Vá para **`http://localhost:3000/pragas`**.
2. **Filtro por Cultura Afetada (RF09):**
   - No seletor **"Cultura Afetada"**, selecione por exemplo **"Milho"**.
   - A lista filtra em tempo real para exibir apenas pragas que atacam o milho (ex: *Lagarta do Funil*).
   - Selecione **"Todas as Culturas"** para restaurar a lista.
3. **Filtro por Severidade:**
   - Selecione **"Severidade Alta"** ou **"Severidade Crítica"** no filtro.
4. **Pesquisa Textual:**
   - Digite na barra de pesquisa termos como `"folhas"` ou `"biológico"` para testar a busca inteligente por sintomas e métodos de combate.
5. **Ficha Técnica Detalhada:**
   - Em qualquer cartão de praga, clique no link **"Ficha e Combate"**.
   - O modal detalhado exibe:
     - Nome vulgar e nome científico.
     - Descrição detalhada da praga.
     - Danos e sintomas visíveis no campo (em destaque vermelho/âmbar).
     - Medidas Integradas de Manejo e Combate (MIP) culturais, biológicas e químicas.

---

### 5.2 Teste de Reporte de Ocorrência pelo Produtor (RF10)
1. **Login:** Com a conta de Agricultor (`agricultor@kulimatech.mz`).
2. **Aceder a Ocorrências:** Vá para **`http://localhost:3000/pragas/ocorrencias`** ou clique no botão **"Reportar Ocorrência"** em `/pragas`.
3. **Abrir Novo Reporte (RF10):**
   - Clique no botão verde **"+ Nova Ocorrência"**.
   - Selecione a sua parcela agrícola.
   - Escolha a praga suspeita (ou deixe em *"Não sei identificar"*).
   - Selecione a severidade (ex: **"Alta"**).
   - No campo de descrição, digite: *"Ataque intenso nas folhas centrais com perfurações visíveis e presença de lagartas."*
   - (Opcional) Insira um link de foto.
   - Clique em **"Submeter Ocorrência"**.
4. **Confirmação:**
   - A nova ocorrência surge na tabela com o badge âmbar `⚠ Aberta`.
   - Um alerta do tipo `PRAGA_REPORTADA` é disparado automaticamente para o extensionista do SDAE.

---

### 5.3 Teste de Parecer Técnico e Resolução da Ocorrência (RF11)
1. **Login:** Entre com a conta do Técnico SDAE (`tecnico@kulimatech.mz`).
2. **Navegação:** Aceda a **`http://localhost:3000/pragas/ocorrencias`**.
3. **Indicadores e Abas:**
   - O cartão **"Ocorrências Abertas"** destaca o número de casos pendentes com badge *"Pendente"*.
   - Clique na aba **"Abertas"** para filtrar apenas as ocorrências não resolvidas.
4. **Emissão de Parecer Técnico (RF11):**
   - Na tabela, clique no botão verde **"Resolver"** da ocorrência reportada pelo agricultor.
   - No modal:
     - O sistema exibe os detalhes da parcela, o produtor e a descrição de campo enviada.
     - Deixe marcado **"Concluir e Resolver"**.
     - No campo **Parecer Técnico**, digite: *"Inspeção confirma infestação por Lagarta do Funil (Spodoptera frugiperda) em estágio inicial."*
     - No campo **Ações e Medidas Recomendadas**, prescreva: *"Pulverizar bioinseticida à base de Bacillus thuringiensis ao entardecer."*
     - Clique em **"Gravar Parecer e Notificar"**.
5. **Resultado da Resolução:**
   - O status da ocorrência muda para `✔ Resolvida` (badge verde).
   - O parecer técnico e o nome do técnico responsável são exibidos na tabela.
   - O agricultor é notificado no painel com o parecer emitido.

---

## 6. Testes da Comunicação Direta (Chat em Tempo Real & Atualização Otimista)

Rota principal: **`http://localhost:3000/mensagens`**

O chat oficial do KulimaTech foi desenvolvido com **arquitetura profissional em tempo real**:
- **Zero sensação de loading:** O histórico inicial é hidratado diretamente pelo Server Component.
- **Atualização otimista:** A mensagem é inserida na tela imediatamente com status pendente e confirmada em segundo plano.
- **Push Events via Server-Sent Events (SSE):** O cliente não faz polling (`setInterval` foi eliminado); o servidor empurra as mensagens no instante em que são criadas.
- **Deduplicação e merge:** O estado mescla mensagens do servidor sem duplicados.

### 6.1 Teste de Envio Otimista e Entrega em Tempo Real
1. **Abrir duas janelas do navegador (uma em janela anônima):**
   - **Janela A:** Sessão do Agricultor (`agricultor@kulimatech.mz` / `Agricultor123`).
   - **Janela B:** Sessão do Técnico SDAE (`tecnico@kulimatech.mz` / `Tecnico123`).
2. **Navegar para `/mensagens` em ambas as janelas:**
   - Observe o badge verde no topo: `● Em tempo real` (conexão persistente SSE ativa).
   - O histórico de conversas carrega imediatamente sem telas de espera ou spinners vazios.
3. **Enviar Mensagem pelo Agricultor (Janela A):**
   - Na conversa com o Técnico Arnaldo, digite: *"Bom dia Engenheiro, fiz a leitura da humidade e aguardo parecer."*
   - Pressione **Enter** ou clique em **Enviar**:
     - **Comportamento Otimista:** O texto limpa do input *instantaneamente* e a bolha de mensagem aparece na tela no mesmo milissegundo com ícone de relógio `🕐`.
     - Em menos de 100ms, o servidor confirma a persistência no banco e o ícone transiciona suavemente para `✔` (enviada).
4. **Recebimento Instantâneo pelo Técnico (Janela B):**
   - Sem atualizar a página e sem atraso de polling, a mensagem aparece instantaneamente na tela do técnico.
   - O contador de mensagens não lidas no menu e no contato atualiza em tempo real.
5. **Confirmação de Leitura:**
   - Ao abrir a conversa na Janela B, o técnico visualiza o conteúdo.
   - Na Janela A do agricultor, o marcador de status atualiza automaticamente para `✔✔` verde/lima (lida).

---

---

## 7. Fase 4: Administração de Utilizadores e Carteiras Técnicas (RF14)

### 7.1 Teste Visual como Administrador Central
1. **Login:** Aceda a `http://localhost:3000/auth` com `admin@kulimatech.mz` / `Admin123`.
2. **Navegação:** No menu lateral, clique em **"Utilizadores & Atribuições"** (`/utilizadores`).
3. **Métricas de Topo:**
   - Verifique os 4 cartões com Total de Utilizadores, Técnicos SDAE, Agricultores e Contagem de Sem Técnico Atribuído.
4. **Aba "Todos os Utilizadores":**
   - Teste a busca em tempo real por nome, e-mail ou localidade.
   - Filtre por Perfil (Administrador, Técnico, Agricultor) e Estado (Ativo, Bloqueado).
   - Clique em **"+ Novo Utilizador"** e cadastre um novo técnico ou agricultor.
   - Na linha de qualquer utilizador, teste o botão **"Editar"** ou **"Bloquear / Reativar"**.
   - Note que o sistema bloqueia tentativas de auto-bloqueio do próprio administrador ativo logado.
5. **Aba "Atribuição de Carteiras":**
   - Selecione um técnico na lista à esquerda.
   - Veja à direita os agricultores acompanhados com contagem de parcelas.
   - Clique em **"Vincular Agricultores"** para associar produtores pendentes em lote.
   - Clique em **"Desvincular"** para remover um vínculo. Ambos os utilizadores recebem alertas automáticos no sistema.

### 7.2 Teste Visual como Técnico SDAE (Isolamento de Carteira)
1. **Login:** Aceda com `tecnico@kulimatech.mz` / `Tecnico123`.
2. **Navegação:** No menu lateral, clique em **"Agricultores Acompanhados"** (`/utilizadores`).
3. **Visão Exclusiva:**
   - O técnico visualiza uma grelha de cartões apenas com os agricultores vinculados à sua carteira técnica.
   - Cada cartão exibe o nome, contacto, zona de atuação e número de parcelas.
   - O botão **"Conversar"** abre diretamente o chat oficial (`/mensagens?contactId=...`).
   - O técnico **não tem permissão** de ver outros utilizadores nem de criar ou alterar contas (RBAC estrito).

---

## 8. Verificação de Scripts de Homologação Automatizada

Para validar a integridade completa diretamente contra o banco de dados PostgreSQL a qualquer momento:

```bash
# Validar Fase 1 (Schema, relações e enums)
node scripts/verify-fase1-schema.mjs

# Validar Fase 2 (Leituras de solo, regras RF04 e validação RF05)
node scripts/verify-fase2-leituras.mjs

# Validar Fase 3 (Catálogo de pragas RF09, reporte RF10 e parecer RF11)
node scripts/verify-fase3-pragas.mjs

# Validar Chat em Tempo Real (SSE Push Events, envio otimista e entrega)
node scripts/verify-chat-realtime.mjs

# Validar Fase 4 (Utilizadores, RBAC estrito, carteiras técnicas e bloqueio)
node scripts/verify-fase4-users.mjs
```

Todos os comandos acima concluem com **código de saída 0** e 100% de sucesso.

