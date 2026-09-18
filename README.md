# KulimaTech - Sistema de Apoio a Decisao Agricola

Plataforma integrada de apoio a decisao agricola voltada para o Distrito de Nhamatanda, Provincia de Sofala, Mocambique. O sistema conecta agricultores familiares e tecnicos extensionistas do Servico Distrital de Actividades Economicas (SDAE), fundamentando tomadas de decisao em dados de humidade do solo, catalogo de culturas e alertas fitossanitarios.

Projeto desenvolvido em cooperacao institucional entre a Universidade Zambeze (UniZambeze) e o SDAE de Nhamatanda.

---

## Indice

- [Visao Geral](#visao-geral)
- [Papeis e Perfis de Acesso (RBAC)](#papeis-e-perfis-de-acesso-rbac)
- [Modulos Funcionais](#modulos-funcionais)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pre-requisitos](#pre-requisitos)
- [Instalacao e Configuracao](#instalacao-e-configuracao)
- [Scripts Disponiveis](#scripts-disponiveis)
- [Padroes de Desenvolvimento](#padroes-de-desenvolvimento)
- [Licenca](#licenca)

---

## Visao Geral

O KulimaTech atua diretamente no fortalecimento da extensao agraria e na seguranca alimentar de Nhamatanda. O sistema mitiga os impactos de extremos climaticos e otimiza o uso da agua atraves do acompanhamento continuo da humidade do solo, validacao tecnica de dados de campo e distribuicao direcionada de recomendacoes agronomicas.

### Principais Objetivos

- Centralizar o registo e a monitoria de dados agroclimaticos e condicoes de solo.
- Fornecer recomendacoes tecnicas personalizadas de rega e maneio com base em estagios fenologicos.
- Agilizar a identificacao e notificacao precoce de pragas e doencas agricolas.
- Estabelecer um canal estruturado de comunicacao bidirecional entre tecnicos do SDAE e produtores rurais.

---

## Papeis e Perfis de Acesso (RBAC)

A plataforma implementa controle de acesso baseado em funcoes (Role-Based Access Control) segmentado em tres niveis:

1. **Administrador**
   - Gestao global de utilizadores e permissoes.
   - Configuracao de parametros do sistema e tabelas de referencia agronomica.
   - Auditoria de dados e relatorios operacionais consolidados.

2. **Tecnico SDAE**
   - Validacao agronomica das leituras de humidade submetidas pelos agricultores.
   - Emissao de recomendacoes tecnicas de rega, adubacao e preparo do solo.
   - Triagem e investigacao de ocorrencias fitossanitarias.
   - Acompanhamento dos agricultores sob sua area de extensao distrital.

3. **Agricultor**
   - Registo diario ou periodico de leituras de humidade do solo.
   - Consulta ao plano de rega e recomendacoes tecnicas ativas para suas parcelas.
   - Reporte de suspeitas de pragas ou anomalias nas culturas.
   - Envio e recepcao de comunicacoes diretas com o tecnico extensionista designado.

---

## Modulos Funcionais

O sistema divide-se em seis frentes funcionais principais:

- **F1 - Autenticacao e Gestao de Utilizadores**: Registo, login seguro, gestao de sessao JWT, recuperacao de credenciais e administracao de perfis.
- **F2 - Gestao de Parcelas Agricolas**: Cadastro geografico e tecnico de propriedades, talhoes, tipos de solo e historico de cultivo.
- **F3 - Leituras e Humidade do Solo**: Registo de dados de tensiometros ou sensores, historico temporal, validacao tecnica e visualizacao analitica.
- **F4 - Culturas e Recomendacoes**: Base de dados de culturas agricolas, curvas de necessidade hidrica por fase fenologica e recomendacoes agronomicas automatizadas/validadas.
- **F5 - Pragas e Ocorrencias Fitossanitarias**: Registo de ocorrencias em campo, catalogo de diagnosticos e alertas de proliferacao na regiao.
- **F6 - Comunicacao e Alertas**: Modulo de notificacoes criticas (secas, pragas, alertas meteorologicos) e mensageria direta entre agentes de campo.

---

## Arquitetura do Projeto

A organizacao do codigo segue o padrao Feature-Driven Development (FDD) desacoplado do Next.js App Router, garantindo manutencao isolada, testabilidade e alta escalabilidade:

```
src/
|-- app/                         # Rotas e layouts do Next.js (apenas orquestracao)
|   |-- (auth)/                  # Grupo de rotas publicas (login, registo, recuperacao)
|   |-- (dashboard)/             # Grupo de rotas autenticadas por perfil
|   |   |-- dashboard/           # Painel principal consolidado
|   |   |-- utilizadores/        # Gestao de contas (acesso restrito Admin)
|   |   |-- parcelas/            # Registo e detalhes de parcelas
|   |   |-- leituras/            # Insercao e historico de leituras
|   |   |-- culturas/            # Catalogo e recomendacoes tecnicas
|   |   |-- pragas/              # Ocorrencias fitossanitarias
|   |   `-- mensagens/           # Alertas e canal de comunicacao
|   |-- globals.css              # Estilos globais
|   `-- layout.tsx               # Layout raiz
|
|-- features/                    # Nucleo de logica de negocio (1 modulo por frente)
|   |-- auth/                    # Componentes, hooks, schemas, servicos e tipos de auth
|   |-- users/                   # Gestao de utilizadores e associacoes territoriais
|   |-- parcelas/                # Componentes e logica de parcelas agricolas
|   |-- leituras/                # Formularios de leitura, graficos e validacoes
|   |-- culturas/                # Catalogo agronomico e motor de recomendacoes
|   |-- pragas/                  # Fichas de ocorrencia e tabelas de pragas
|   `-- comunicacao/             # Interfaces de chat, alertas e polling de mensagens
|
|-- components/                  # Componentes reutilizaveis globais (Design System)
|   |-- landing/                 # Secoes da landing page institucional
|   |-- layout/                  # Sidebar, Header, Navbar e Footer compartilhados
|   `-- ui/                      # Elementos atomicos (Button, Card, Input, Modal, etc.)
|
|-- lib/                         # Configuracoes de infraestrutura e clientes
|   |-- api/                     # Cliente HTTP base, interceptores e endpoints
|   |-- auth/                    # Gestao de tokens JWT e persistencia de sessao
|   `-- rbac/                    # Regras e validadores de permissoes de rota
|
|-- hooks/                       # React hooks genericos (useDebounce, useMediaQuery, etc.)
|-- theme/                       # Constantes de tema e paleta de cores
|-- types/                       # Definicoes globais de tipos TypeScript
|-- utils/                       # Utilitarios puros, formatadores, mascaras e validadores
`-- proxy.ts                     # Proxy de interceptacao e protecao de rotas (Next.js 16)
```

---

## Tecnologias Utilizadas

- **Framework**: Next.js (App Router)
- **Biblioteca de Interface**: React
- **Linguagem**: TypeScript (Strict Mode)
- **Estilizacao**: Tailwind CSS
- **Animacoes**: Framer Motion
- **Icones**: Lucide React
- **Controle de Codigo e Qualidade**: ESLint, PostCSS

---

## Pre-requisitos

Antes de iniciar, certifique-se de possuir em seu ambiente de desenvolvimento:

- Node.js versao 18.17.0 ou superior (recomendado: Node.js 20 LTS)
- Gerenciador de pacotes npm (ou pnpm / yarn)
- Git instalado e configurado

---

## Instalacao e Configuracao

1. Clone o repositorio:
   ```bash
   git clone https://github.com/seu-usuario/imunda.git
   cd imunda
   ```

2. Instale as dependencias do projeto:
   ```bash
   npm install
   ```

3. Configure as variaveis de ambiente criando o arquivo `.env.local` com base nas configuracoes necessarias da API:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse a aplicacao no navegador:
   ```
   http://localhost:3000
   ```

---

## Scripts Disponiveis

No diretorio do projeto, estao configurados os seguintes comandos npm:

| Comando | Descricao |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento local com hot-reloading |
| `npm run build` | Gera a compilacao de producao otimizada da aplicacao |
| `npm run start` | Executa o servidor Node.js com a build de producao gerada |
| `npm run lint` | Executa a verificacao estatica de codigo via ESLint |
| `npm run organize` | Executa o script de auditoria e criacao da estrutura de diretorios |

---

## Padroes de Desenvolvimento

- **Separacao de Responsabilidades**: O diretorio `app/` deve conter apenas componentes de pagina e definicoes de rota. Logicas de negocio, chamadas a servicos e validacoes de formulario residem exclusivamente em `features/`.
- **Tipagem Forte**: Todo novo modulo deve declarar suas interfaces em arquivos `types.ts` dedicados, evitando o uso de `any`.
- **Componentes Compartilhados**: Elementos visuais sem acoplamento a regras de negocio especificas pertencem a `components/ui/`.
- **Roteamento e Permissoes**: Novas rotas no painel administrativo devem ser mapeadas de acordo com as politicas definidas em `src/lib/rbac/permissions.ts` e protegidas no `proxy.ts`.

---

## Licenca

Este projeto e propriedade institucional e seu uso destina-se a fins operacionais e de investigacao agricola no Distrito de Nhamatanda, Sofala. Consulte os termos de distribuicao junto a cooperacao UniZambeze e SDAE Nhamatanda.
