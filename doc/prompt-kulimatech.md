# Prompt — Auditoria e conclusão do projecto KulimaTech (Next.js)

> Cola este prompt no assistente de código (Claude Code, Cursor, etc.) aberto na raiz do projecto Next.js, **junto com o ficheiro `projeto-kulimatech.md`**, que é a fonte da verdade sobre o que o sistema deve ser.

---

## Papel

Actua como engenheiro de software sénior em Next.js, Supabase/PostgreSQL e Tailwind CSS. Vais **auditar o estado actual deste repositório** contra a especificação do KulimaTech (em `projeto-kulimatech.md`), dizer com rigor **o que já está feito e o que falta**, e depois **implementar o que falta**, por ordem de prioridade.

## Contexto do projecto (resumo)

O KulimaTech é um sistema de informação e apoio à decisão para **agricultores e técnicos do SDAE do distrito de Nhamatanda (Sofala, Moçambique)**. Tem 3 perfis: **Agricultor, Técnico SDAE e Administrador**. Os módulos são: autenticação por perfil, parcelas, leituras de humidade do solo com validação, catálogo de culturas, recomendações de culturas, catálogo de pragas, ocorrências de pragas, chat agricultor ↔ técnico e alertas. A pilha real é **Next.js + Tailwind CSS + Supabase (Auth, REST, Realtime) + PostgreSQL**.

**Importante:** a especificação menciona Flutter, Node/Express e MySQL (RNF02/RNF03). Isso está **desactualizado**. Não migres nem introduzas essas tecnologias. Usa só a pilha real acima.

Os utilizadores têm baixa literacia digital e conectividade intermitente, por isso a interface deve ser **simples, responsiva (mobile-first) e leve**. Um técnico do SDAE pediu que o sistema **não dependesse de internet nem só de Android/iOS**, o que aponta para PWA e suporte offline como melhoria desejável.

## Fase 1 — Auditoria (não alteres código ainda)

Explora o repositório (estrutura de pastas, rotas/`app` ou `pages`, componentes, `lib/supabase`, migrações/SQL, políticas RLS, variáveis de ambiente, tipos) e produz um **relatório de lacunas** num ficheiro `AUDITORIA.md`, com:

### 1.1 Matriz de requisitos
Uma tabela com **RF01–RF14** e **RNF01–RNF05 (adaptados à pilha real)**. Colunas: `Código | Estado (✅ Completo / 🟡 Parcial / ❌ Em falta) | Evidência (ficheiros e linhas) | O que falta`. Não marques "completo" sem ter lido o código que o implementa. Distingue UI feita mas sem ligação à base de dados de funcionalidade real.

### 1.2 Matriz de telas
Para cada tela abaixo, indica se existe a rota, se está ligada a dados reais ou só estática, e o que falta:

**Públicas:** Landing page (hero, botão "Aceder ao Sistema", secções Visão Geral / Como Funciona / Institucional), Registo do agricultor (nome, e-mail, contacto, zona de Nhamatanda, palavra-passe + confirmação + força da senha, consentimento de dados) e Login (e-mail, senha, manter sessão, esqueceu a senha, redireccionamento por perfil).

**Agricultor:** Painel da Exploração (gráfico de humidade com média e faixa óptima 40–75%, diagrama de talhões, ciclo agronómico, meteorologia local), As Minhas Parcelas (CRUD), Registar Humidade do Solo, Recomendações Recebidas (ordenadas por data), Reportar Ocorrência de Praga, Meu Técnico SDAE (chat), Guia de Culturas & Pragas (catálogos com filtro por cultura) e Alertas.

**Técnico SDAE:** Dashboard (agricultores vinculados, parcelas e área total, leituras recentes, ocorrências), lista de agricultores acompanhados, parcelas dos seus agricultores, validação de leituras, emitir recomendação, acompanhar e resolver ocorrências de pragas, chat e alertas.

**Administrador:** Dashboard (contas, parcelas, nº de culturas e pragas), Utilizadores e Atribuições (criar técnicos e atribuir agricultores a técnicos), Todas as Parcelas, CRUD do Catálogo de Culturas, CRUD do Catálogo de Pragas e Mensagens & Alertas.

### 1.3 Modelo de dados
Compara o esquema existente em Supabase/PostgreSQL com as 11 entidades da especificação: `utilizador, tecnico, agricultor, parcela, leitura_solo, cultura, praga, recomendacao, ocorrencia_praga, mensagem, alerta`. Lista tabelas, colunas, tipos, chaves estrangeiras e enums em falta ou diferentes.

### 1.4 Segurança e qualidade
Verifica:
- **RLS (Row Level Security)** em todas as tabelas: o agricultor só vê o que é seu, o técnico só vê os seus agricultores, o administrador vê tudo.
- Controlo de acesso por perfil nas rotas, via middleware ou guards.
- Fluxo de autenticação e redireccionamento por perfil.
- Validação de formulários.
- Tratamento de erros e estados de carregamento ou vazio.
- Segredos fora do código.

### 1.5 Ambiguidades
Lista tudo o que a especificação deixa em aberto ou contradiz. Exemplos: se o motor de alertas usa Realtime ou *polling* de 30 s, a faixa "normal" de humidade por cultura e o estado da integração meteorológica.

No fim da auditoria, **mostra-me um resumo curto e uma lista de perguntas em aberto** antes de passares à Fase 2. Se as perguntas não bloquearem o trabalho, assume a opção mais razoável, regista-a e continua.

## Fase 2 — Plano

Propõe um plano em sprints curtos (o projecto usa Scrum), ordenado por **valor e dependência**. Esta ordem é uma sugestão. Ajusta-a ao que a auditoria revelar:

1. **Fundações:** esquema da base de dados, RLS, autenticação e redireccionamento por perfil (RF01, RNF01).
2. **Núcleo do agricultor:** parcelas (RF02), leituras de humidade (RF03) e validação automática de anomalias (RF04).
3. **Núcleo do técnico:** validação de leituras (RF05) e emissão de recomendações com os catálogos de culturas (RF06, RF07, RF08).
4. **Pragas:** catálogo com filtro por cultura (RF09), reporte de ocorrências (RF10) e acompanhamento e resolução (RF11).
5. **Administração:** gestão de utilizadores, atribuição técnico ↔ agricultor e CRUD dos catálogos (RF14).
6. **Comunicação e alertas:** chat com histórico (RF12) e alertas com marcar como lido (RF13). Esta é a única funcionalidade que a monografia admite não estar concluída.
7. **Dashboards:** ligar os três dashboards a dados reais e substituir os valores estáticos ou a zero.
8. **Melhorias (só depois do núcleo):** meteorologia local via API gratuita (Open-Meteo), PWA e suporte offline com sincronização.

## Fase 3 — Implementação

Para cada item do plano, por ordem:
- Implementa **apenas o que falta ou está parcial**. Reutiliza o que já existe e **não reescrevas** código que funciona.
- Segue as convenções já presentes no repositório (estrutura de pastas, nomes, estilo de componentes e Tailwind). Se não houver convenção, usa o App Router, Server Components por omissão e `@supabase/ssr`.
- Cria migrações SQL versionadas para qualquer alteração ao esquema, com as políticas RLS correspondentes.
- Valida entradas no cliente e no servidor.
- Mostra sempre estados de carregamento, vazio e erro.
- Textos da interface em **português de Moçambique**, linguagem simples e directa, adequada a utilizadores de baixa literacia.
- Visual coerente com as telas existentes: verde-escuro com acentos verde-lima, fundo creme, menu lateral recolhível, avatar e perfil no topo.
- Após cada sprint, corre `lint`, `typecheck` e `build`, e testa manualmente os fluxos principais. Corrige o que falhar antes de avançar.
- Faz commits pequenos e descritivos, um por funcionalidade (ex.: `feat(parcelas): CRUD de parcelas do agricultor (RF02)`).

## Regras de negócio a respeitar

- **Humidade do solo:** valor em percentagem (0–100). Cada leitura fica associada a uma parcela e ao agricultor, com data e hora. A faixa normal de referência no painel é 40–75%. Valores fora da faixa (ou abaixo da `humidadeMinima` da cultura, quando houver) são marcados como **anomalia** e geram alerta ao técnico responsável (RF04).
- **Leituras e recomendações** têm o campo `validadoPorTecnico`. Só o técnico associado ao agricultor pode validar.
- **Recomendação:** criada pelo técnico para uma parcela e uma cultura, com descrição. Gera um alerta para o agricultor.
- **Ocorrência de praga:** criada pelo agricultor para uma parcela e uma praga, com descrição e data. Gera um alerta para o técnico. Tem estado `resolvida`, e só o técnico a marca como resolvida.
- **Mensagens:** só entre um agricultor e o **seu** técnico. Mantêm histórico e o estado `lida`.
- **Alertas:** tipos `leitura`, `recomendacao`, `praga` e `mensagem`. Têm `visualizado` e podem ser marcados como lidos. Devem chegar ao destinatário em tempo real (Supabase Realtime) ou, em alternativa, por *polling* a cada 30 s.
- **Perfis:** `administrador | tecnico | agricultor`. Cada perfil só acede às suas rotas. O registo público cria apenas **agricultores**. Técnicos e administradores são criados pelo administrador.
- **Catálogos** (culturas e pragas): leitura para todos os perfis autenticados, escrita só para o administrador.

## O que NÃO fazer

- Não migres para Flutter, Node/Express ou MySQL.
- Não uses dados fictícios no código final. Podes criar um *seed* de desenvolvimento, claramente separado.
- Não apagues ou reescrevas módulos que já estão completos e a funcionar.
- Não alargues o âmbito às "sugestões futuras" (IoT, machine learning, expansão regional) sem eu pedir.
- Não declares um requisito como concluído sem o teres verificado a funcionar.

## Formato das respostas

- Fala comigo em português.
- No fim de cada fase, dá um resumo curto: o que fizeste, o que ficou por fazer e o que preciso de decidir.
- Se encontrares um problema que me possa afectar na defesa ou na entrega (por exemplo, uma funcionalidade que a monografia afirma ter e o código não tem), avisa-me de forma explícita.

**Começa agora pela Fase 1.**
