# Plano de Implementação: Módulo F6 — Canal de Comunicação e Alertas
**Projeto:** KulimaTech / iMunda — SDAE Nhamatanda  
**Responsável Técnico:** Paulo Tivane (Backend Developer)  
**Status do Projeto:** Fase 5 / Módulo F6 (Prioridade Alta)  
**Data:** 2026-10-05  

---

## 1. Contexto e Justificativa

Conforme estabelecido no [PLANO_SINCRONIZACAO_EQUIPE.md](./PLANO_SINCRONIZACAO_EQUIPE.md) e na [Especificacao_Interfaces_Web_Marcelo.md](./Especificacao_Interfaces_Web_Marcelo.md), o desenvolvimento segue a metodologia **API First** com estrita divisão de responsabilidades:

- **Paulo Tivane (Backend):** Camada de dados, modelos Prisma, regras de negócio em rotas de API (`src/app/api/**`), validações com Zod, autorização por perfil (RBAC) e testes automatizados.
- **Amancio (Frontend):** Interfaces visuais em `src/app/(dashboard)/**`, componentes de tela e integração através dos serviços.

### Estado Atual do Repositório:
- **F1 (Autenticação/Usuários):** Concluído e verificado.
- **F2 (Gestão de Parcelas):** Concluído e verificado.
- **F3 (Registo de Leituras do Solo):** Rotas base concluídas, pendente apenas o disparo de alerta para anomalias.
- **F4 (Culturas e Recomendações):** Concluído e verificado.
- **F6 (Comunicação e Alertas):** **Pendente no backend** — telas no frontend estão atualmente como páginas placeholder aguardando contratos e APIs.

Este plano fornece o passo a passo completo para que **Paulo Tivane desenvolva 100% da camada de backend do Módulo F6 de forma isolada e autônoma**, sem gerar conflitos nem depender de telas prontas.

---

## 2. Escopo Exclusivo de Tivane (Fronteiras Técnicas)

```mermaid
graph TD
    subgraph Tivane [Escopo Exclusivo de Tivane - Backend]
        A1[src/features/comunicacao/types.ts]
        A2[src/features/comunicacao/schemas/comunicacaoSchemas.ts]
        A3[src/app/api/alertas/route.ts]
        A4[src/app/api/alertas/[id]/route.ts]
        A5[src/app/api/mensagens/route.ts]
        A6[src/app/api/leituras/route.ts - Trigger Anomalia]
        A7[scripts/verify-comunicacao.mjs]
    end

    subgraph Amancio [Escopo Reservado ao Amancio - Frontend]
        B1[src/app/(dashboard)/mensagens/page.tsx]
        B2[src/app/(dashboard)/mensagens/alertas/page.tsx]
        B3[src/features/comunicacao/components/**]
        B4[src/features/comunicacao/hooks/**]
    end

    A1 -. Fornece Contrato de Tipos .-> B1
    A1 -. Fornece Contrato de Tipos .-> B2
    A3 -. Consumo HTTP .-> B2
    A5 -. Consumo HTTP .-> B1
```

> [!IMPORTANT]
> **Regra de Ouro:** Tivane **não deve** alterar arquivos visuais (`page.tsx`, `layout.tsx`, arquivos de estilos CSS ou componentes React em `src/components`). O trabalho concentra-se nos contratos de dados, endpoints da API e na suite de verificação automatizada.

---

## 3. Especificação dos Contratos de Dados (API First)

### 3.1. Arquivo: `src/features/comunicacao/types.ts`
Contrato compartilhado com o frontend:

```typescript
import { AlertaTipo } from '@prisma/client';

export interface InterlocutorDTO {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'TECNICO' | 'AGRICULTOR';
  telefone?: string | null;
  zonaAtuacao?: string | null;
}

export interface MensagemDTO {
  id: string;
  remetenteId: string;
  destinatarioId: string;
  conteudo: string;
  lida: boolean;
  createdAt: string;
  remetente?: InterlocutorDTO;
  destinatario?: InterlocutorDTO;
}

export interface ConversaResumoDTO {
  interlocutor: InterlocutorDTO;
  ultimaMensagem: {
    id: string;
    conteudo: string;
    createdAt: string;
    enviadaPorMim: boolean;
  };
  totalNaoLidas: number;
}

export interface AlertaDTO {
  id: string;
  userId: string;
  tipo: AlertaTipo;
  titulo: string;
  mensagem: string;
  link?: string | null;
  lido: boolean;
  createdAt: string;
}

export interface EnviarMensagemInput {
  destinatarioId: string;
  conteudo: string;
}
```

### 3.2. Arquivo: `src/features/comunicacao/schemas/comunicacaoSchemas.ts`
Validações de segurança com Zod:

```typescript
import { z } from 'zod';

export const enviarMensagemSchema = z.object({
  destinatarioId: z.string().min(1, 'ID do destinatário é obrigatório.'),
  conteudo: z
    .string()
    .trim()
    .min(1, 'A mensagem não pode estar vazia.')
    .max(1000, 'A mensagem não pode ter mais de 1000 caracteres.'),
});

export const atualizarAlertaSchema = z.object({
  lido: z.boolean(),
});
```

---

## 4. Endpoints a Implementar

### 4.1. Endpoints de Alertas (`/api/alertas`)

#### `GET /api/alertas`
- **Acesso:** Qualquer utilizador autenticado (`ADMIN`, `TECNICO`, `AGRICULTOR`).
- **Regras RBAC:**
  - `AGRICULTOR` e `TECNICO`: filtram apenas os seus próprios alertas (`where: { userId: session.userId }`).
  - `ADMIN`: pode consultar visão consolidada do sistema ou filtrar por `userId` específico.
- **Filtros suportados via Query String:**
  - `?lido=false`: lista somente alertas não lidos.
  - `?tipo=HUMIDADE_CRITICA`: filtra por categoria do enum `AlertaTipo`.
  - `?limite=30`: controle de paginação simples.
- **Resposta Sucesso (200):**
  ```json
  {
    "success": true,
    "data": {
      "alertas": [...],
      "totalNaoLidos": 4
    }
  }
  ```

#### `PATCH /api/alertas/[id]`
- **Acesso:** Proprietário do alerta ou `ADMIN`.
- **Ação:** Atualiza o campo `lido` (ex: `lido: true`). Retorna erro `403 FORBIDDEN` caso o alerta pertença a outro usuário.

#### `PATCH /api/alertas` (Marcar Todos Como Lidos)
- **Ação:** Executa `prisma.alerta.updateMany` com `{ where: { userId: session.userId, lido: false }, data: { lido: true } }`.

---

### 4.2. Endpoints de Mensagens (`/api/mensagens`)

#### `GET /api/mensagens`
- **Acesso:** `AGRICULTOR` e `TECNICO`.
- **Comportamento condicional por Query Param:**
  1. **Se informado `?interlocutorId=<id>`**:
     - Valida vínculo: se for Agricultor, o interlocutor deve ser seu técnico supervisor; se for Técnico, o interlocutor deve ser um dos seus agricultores acompanhados.
     - Busca o histórico de mensagens trocadas (`(remetente=A AND dest=B) OR (remetente=B AND dest=A)`), ordenadas cronologicamente (`createdAt: 'asc'`).
     - Atualiza atomicamente mensagens recebidas daquele interlocutor para `lida: true`.
     - Retorna array de `MensagemDTO`.
  2. **Se omitido `interlocutorId`**:
     - Retorna array de `ConversaResumoDTO` com a lista de pessoas vinculadas, a última mensagem trocada e a contagem de não lidas.

#### `POST /api/mensagens`
- **Acesso:** `AGRICULTOR` e `TECNICO`.
- **Validação de Vínculo de Segurança (RBAC Multi-tenant):**
  - Se remetente for `AGRICULTOR`: verifica no banco se existe registro em `TecnicoAgricultor` com `agricultorId = session.userId` e `tecnicoId = destinatarioId`. Se não existir, rejeita com `403 FORBIDDEN` ("Não possui vínculo de acompanhamento com este técnico").
  - Se remetente for `TECNICO`: verifica se existe `TecnicoAgricultor` com `tecnicoId = session.userId` e `agricultorId = destinatarioId`.
- **Execução Transacional Atômica (`prisma.$transaction`):**
  1. Cria o registro na tabela `Mensagem`.
  2. Cria automaticamente uma notificação na tabela `Alerta` para o destinatário:
     - `userId: destinatarioId`
     - `tipo: AlertaTipo.NOVA_MENSAGEM`
     - `titulo: "Nova mensagem de ${remetente.nome}"`
     - `mensagem: "${resumoDoConteudo}"`
     - `link: "/mensagens?interlocutorId=${remetente.id}"`
- **Resposta Sucesso (201):** Retorna o objeto da mensagem recém-criada com dados do remetente.

---

### 4.3. Trigger de Anomalia de Humidade em Leituras (F3)

- **Arquivo:** `src/app/api/leituras/route.ts`
- **Requisito do Documento de Interfaces:**
  > *"Se o valor estiver fora do padrão normal, a leitura é assinalada como anomalia e é gerado automaticamente um alerta para o técnico responsável."*
- **Ação Técnica de Tivane:**
  No método `POST /api/leituras`, quando `statusHumidade === 'CRITICA'`, buscar o técnico responsável pelo agricultor dono da parcela através de `prisma.tecnicoAgricultor.findFirst({ where: { agricultorId: parcela.agricultorId } })`. Se existir técnico associado, gerar o alerta `AlertaTipo.HUMIDADE_CRITICA` associado ao ID do técnico.

---

## 5. Roteiro de Execução em 5 Fases

| Fase | Ação do Tivane | Arquivo Alvo | Estimativa |
| :---: | :--- | :--- | :---: |
| **1** | Definição dos tipos DTO e Schemas Zod | `src/features/comunicacao/types.ts`<br>`src/features/comunicacao/schemas/comunicacaoSchemas.ts` | 30 min |
| **2** | Criação das rotas de Alertas | `src/app/api/alertas/route.ts`<br>`src/app/api/alertas/[id]/route.ts` | 45 min |
| **3** | Criação das rotas de Mensagens e autorização de vínculo | `src/app/api/mensagens/route.ts` | 60 min |
| **4** | Automação do alerta de humidade crítica em Leituras | `src/app/api/leituras/route.ts` | 20 min |
| **5** | Criação e execução da suite de testes automatizados | `scripts/verify-comunicacao.mjs` | 45 min |

---

## 6. Suite de Testes Automatizada: `scripts/verify-comunicacao.mjs`

A suite de testes deve ser escrita no mesmo padrão de excelência de `verify-backend.mjs` e `verify-culturas.mjs`:

```javascript
// scripts/verify-comunicacao.mjs
// Testes automatizados do Backend para o Módulo F6 (Comunicação e Alertas)
import 'dotenv/config';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Bateria de Testes:
// 1. Validar que Agricultor envia mensagem para seu Técnico com sucesso.
// 2. Validar que o Alerta (NOVA_MENSAGEM) foi gerado automaticamente para o destinatário.
// 3. Validar que tentativa de enviar mensagem para usuário sem vínculo resulta em ERRO 403.
// 4. Validar que leitura de solo com humidade crítica (<25%) gera alerta automático para o técnico.
// 5. Validar marcação de alerta como lido (PATCH) e isolamento entre utilizadores.
// 6. Teardown e limpeza dos dados de teste.
```

---

## 7. Critérios de Conclusão (Definition of Done)

Para que a tarefa de Tivane seja homologada:
1. **Contrato de Tipos:** `src/features/comunicacao/types.ts` preenchido e utilizável pelo Amancio sem necessidade de ajustes estruturais.
2. **Padrão de Resposta:** Todas as rotas de backend seguem estritamente `createSuccessResponse()` e `handleApiError()`.
3. **Isolamento de Dados (RBAC):** Nenhum agricultor ou técnico visualiza mensagens de pessoas fora da sua relação de acompanhamento.
4. **Alerta Automático:** Mensagens e leituras anômalas disparam alertas nas tabelas de forma transacional.
5. **Zero Erros nos Testes:** `node scripts/verify-comunicacao.mjs` executa e exibe `[PASS]` em todos os cenários.
6. **Integridade de UI mantida:** Nenhuma alteração foi realizada em arquivos de tela de frontend.
