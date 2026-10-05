# Plano de Organizacao e Trabalho Sincronizado (Backend & Frontend)
Projeto KulimaTech - SDAE Nhamatanda

Este documento estabelece as responsabilidades, fronteiras tecnicas e diretrizes de trabalho para a equipe de desenvolvimento, composta por Paulo e Amancio. O objetivo central e permitir o desenvolvimento paralelo, sem bloqueios mútuos e sem conflitos de codigo no repositorio.

---

## 1. Identificacao da Equipe e Papeis

* **Paulo**: Responsavel pelo **Backend** (Banco de dados, regras de negocio, seguranca e APIs).
* **Amancio**: Responsavel pelo **Frontend** (Interfaces de utilizador, componentes, estados de tela e consumo de dados).

---

## 2. Definicao de Responsabilidades (O que Deve e Nao Deve Fazer)

### 2.1. Paulo (Backend)

#### O que Paulo DEVE fazer:
* Modelar e manter o esquema do banco de dados no arquivo `prisma/schema.prisma`.
* Executar migracoes e configuracoes de conexao com o Supabase/PostgreSQL.
* Desenvolver todos os endpoints e controladores em `src/app/api/**/route.ts`.
* Implementar a logica de autenticacao, geracao e verificacao de tokens JWT (`src/lib/auth/`).
* Implementar o controlo de acesso por perfil (RBAC: Administrador, Tecnico SDAE, Agricultor) em `src/lib/rbac/`.
* Validar e sanitizar os dados recebidos nas requisicoes antes de gravar no banco.
* Fornecer dados mockados ou documentacao de contrato para Amancio quando um novo endpoint for planeado.
* Garantir que todas as respostas da API sigam rigorosamente a estrutura padronizada acordada.

#### O que Paulo NAO DEVE fazer:
* Nao deve editar páginas visuais de aplicacao (`page.tsx`, `layout.tsx`) em `src/app/(auth)/` ou `src/app/(dashboard)/`.
* Nao deve alterar componentes visuais de interface em `src/components/` ou `src/features/*/components/`.
* Nao deve alterar folhas de estilo CSS (`globals.css`) ou configuracoes de layout visual do Tailwind.
* Nao deve alterar hooks de interface do React criados para renderizacao de tela.

---

### 2.2. Amancio (Frontend)

#### O que Amancio DEVE fazer:
* Desenvolver todas as telas e rotas de navegacao em `src/app/(auth)/` e `src/app/(dashboard)/`.
* Criar componentes visuais modulares e reutilizaveis em `src/components/` e `src/features/*/components/`.
* Gerir os estados de tela, validacoes de formularios com Zod/React Hook Form e feedback visual (mensagens de erro, carregamento e sucesso).
* Simular os dados da API com mocks temporarios em `src/features/*/services/` para nao depender do backend estar finalizado.
* Consumir as rotas oficiais criadas por Paulo atraves de servicos organizados.
* Garantir a responsividade das paginas para dispositivos moveis e computadores.
* Respeitar rigorosamente a especificacao de perfis (Administrador, Tecnico, Agricultor) ocultando ou exibindo elementos conforme a regra de negocio.

#### O que Amancio NAO DEVE fazer:
* Nao deve alterar arquivos dentro de `prisma/` nem rodar comandos destrutivos no banco de dados.
* Nao deve criar ou modificar endpoints de API em `src/app/api/`.
* Nao deve alterar a conexao direta com o banco de dados (`src/lib/prisma.ts`).
* Nao deve implementar logica de hashing de senhas ou regras de banco de dados diretamente no cliente.
* Nao deve alterar tipos de dados acordados (`types.ts`) sem alinhamento previo com Paulo.

---

## 3. Principio "Contrato Primeiro" (API First)

Para evitar que Amancio fique parado aguardando as rotas de Paulo ficarem prontas:

1. **Alinhamento do Contrato**:
   Antes de iniciar um modulo, Paulo e Amancio definem juntos a estrutura dos dados no arquivo `src/features/<modulo>/types.ts`.
2. **Desenvolvimento Paralelo com Mocks**:
   * Amancio implementa as telas consumindo dados simulados (mock) criados no arquivo `services/<modulo>Service.ts`.
   * Paulo implementa o banco de dados e as rotas em `src/app/api/<modulo>/route.ts`.
3. **Integracao Final**:
   Quando Paulo concluir e testar a rota, Amancio apenas atualiza o servico para chamar a URL real (`/api/...`).

---

## 4. Divisao Fisica de Diretorios no Repositorio

| Diretorio / Arquivo | Responsavel Principal | Descricao |
| :--- | :---: | :--- |
| `prisma/` | **Paulo** | Modelagem do banco, migrations e seeds. |
| `src/app/api/**` | **Paulo** | Rotas e regras de negocio de backend. |
| `src/lib/prisma.ts`, `src/lib/auth/`, `src/lib/rbac/` | **Paulo** | Conexao de dados, seguranca e autorizacao. |
| `src/app/(auth)/**` | **Amancio** | Telas de login, registo e recuperacao de senha. |
| `src/app/(dashboard)/**` | **Amancio** | Telas de gestao (painel, parcelas, leituras, etc.). |
| `src/components/**` | **Amancio** | Componentes UI genericos (botoes, tabelas, modais). |
| `src/features/*/components/` | **Amancio** | Componentes especificos de cada funcionalidade. |
| `src/features/*/hooks/` | **Amancio** | Hooks de estado e comportamento de tela. |
| `src/features/*/services/` | **Transicao (Amancio/Paulo)** | Amancio cria o mock inicial; integracao com a API real. |
| `src/features/*/types.ts` | **Ambos (Alinhamento)** | Contrato compartilhado de tipos de dados. |
| `src/features/*/schemas/` | **Ambos (Alinhamento)** | Schemas de validacao Zod compartilhados. |

---

## 5. Padrao de Comunicacao da API (Formato de Respostas)

Para garantir que Amancio saiba exatamente o que esperar de qualquer rota desenvolvida por Paulo, todas as respostas do backend devem seguir o padrao:

### Resposta de Sucesso (HTTP 200 / 201):
```json
{
  "success": true,
  "data": {
    "id": "uuid-exemplo",
    "nome": "Talhao 1"
  }
}
```

### Resposta de Erro (HTTP 400 / 401 / 403 / 404 / 500):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Credenciais invalidas ou sessao expirada."
  }
}
```

Codigos padrao de erro recomendados:
* `VALIDATION_ERROR`: Dados invalidos enviados pelo cliente.
* `UNAUTHORIZED`: Token ausente, invalido ou expirado.
* `FORBIDDEN`: Perfil sem permissao para realizar a acao.
* `NOT_FOUND`: Registo nao encontrado no banco de dados.
* `SERVER_ERROR`: Falha interna de execucao.

---

## 6. Fluxo de Trabalho no Git (Prevecao de Conflitos)

1. **Branch principal**: `main`.
2. **Nomes de branch**:
   * Para Paulo: `backend/f1-auth`, `backend/f2-parcelas`, etc.
   * Para Amancio: `frontend/f1-login`, `frontend/f2-parcelas-ui`, etc.
3. **Regra de Sincronizacao**:
   * No inicio de cada sessao de trabalho, executar `git pull origin main`.
   * Nunca enviar codigo diretamente para a branch do outro colega.
   * Modificacoes em arquivos compartilhados (`types.ts` ou `package.json`) devem ser avisadas previamente.

---

## 7. Roteiro de Execucao por Funcionalidades (F1 a F6)

A execucao deve seguir a ordem de dependencia estabelecida no documento de especificacao de interfaces:

### Fase 1: F1 - Autenticacao e Gestao de Utilizadores
* **Paulo**: Model `User` no Prisma; endpoints `POST /api/auth/login`, `POST /api/auth/register`; validacao de senha com hash; geracao de token JWT contendo perfil e id.
* **Amancio**: Telas de Login e Registo; validacao de campos; armazenamento seguro de sessao; redirecionamento de acordo com o perfil (Administrador, Tecnico, Agricultor).

### Fase 2: F2 - Gestao de Parcelas
* **Paulo**: Model `Parcela` associado ao agricultor; endpoints `GET /api/parcelas` e `POST /api/parcelas`; filtro para que agricultor veja apenas suas parcelas e tecnico veja parcelas associadas.
* **Amancio**: Tela de listagem de parcelas; formulario de cadastro/edicao de parcela; componente de exibicao em card ou listas.

### Fase 3: F3 - Registo de Leitura do Solo
* **Paulo**: Model `LeituraSolo`; endpoints para registo e consulta de historico; validacao dos limites de humidade.
* **Amancio**: Tela de entrada rapida de leitura; tela de historico com indicadores visuais de niveis criticos.

### Fase 4: F4 - Catalogo de Culturas e Recomendacoes
* **Paulo**: Models `Cultura` e `Recomendacao`; endpoints para listagem de culturas e emissao de parecer tecnico.
* **Amancio**: Catalogo de consulta para agricultor; interface para tecnico vincular recomendacao a uma parcela.

### Fase 5: F6 - Canal de Comunicacao e Alertas
* **Paulo**: Models `Mensagem` e `Alerta`; regras de criacao de notificacoes automaticas baseadas nas leituras.
* **Amancio**: Painel de alertas no dashboard; interface simples de mensagens entre tecnico e agricultor.

### Fase 6: F5 - Catalogo de Pragas e Ocorrencias
* **Paulo**: Models `Praga` e `Ocorrencia`; endpoints para registo e acompanhamento de ocorrencias.
* **Amancio**: Catalogo informativo de pragas; formulario de reporte de ocorrencia com descricao e data.

---

## 8. Criterios de Aceitacao de cada Etapa (Definition of Done)

Uma funcionalidade so e considerada concluida quando:
1. O contrato de dados (`types.ts`) for estritamente cumprido por ambas as partes.
2. A interface desenvolvida por Amancio estiver consumindo com sucesso a API real de Paulo.
3. Cenarios de erro (dados em branco, credenciais invalidas) forem tratados no backend e informados com clareza na tela pelo frontend.
4. As restricoes de perfil (RBAC) estiverem testadas e validadas tanto na API quanto na exibicao das paginas.
