// src/app/api/mensagens/stream/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/rbac/guard';
import { chatEvents, CHAT_EVENT_TYPES } from '@/lib/events/chatEvents';

export const dynamic = 'force-dynamic';

interface MessagePayload {
  id: string;
  remetenteId: string;
  destinatarioId: string;
  conteudo: string;
  lida: boolean;
  createdAt: Date | string;
  remetente?: {
    id: string;
    nome: string;
    email: string;
    role: string;
    telefone?: string | null;
  };
  destinatario?: {
    id: string;
    nome: string;
    email: string;
    role: string;
    telefone?: string | null;
  };
}

interface ReadPayload {
  leitorId: string;
  outroUsuarioId: string;
}

/**
 * GET /api/mensagens/stream
 * Canal de Server-Sent Events (SSE) para entrega de mensagens e confirmações em tempo real (Push Events).
 * Elimina polling a intervalos e atualiza instantaneamente.
 */
export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const userId = session.userId;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        // Enviar handshake de conexão inicial
        const connectedData = JSON.stringify({
          userId,
          status: 'connected',
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`event: connected\ndata: ${connectedData}\n\n`));

        // Handler de nova mensagem (Push)
        const onNewMessage = (novaMensagem: MessagePayload) => {
          if (novaMensagem.remetenteId === userId || novaMensagem.destinatarioId === userId) {
            try {
              const data = JSON.stringify(novaMensagem);
              controller.enqueue(encoder.encode(`event: message\ndata: ${data}\n\n`));
            } catch (err) {
              console.error('[SSE] Erro ao enfileirar nova mensagem:', err);
            }
          }
        };

        // Handler de confirmação de leitura (Push)
        const onMessagesRead = (readData: ReadPayload) => {
          if (readData.outroUsuarioId === userId) {
            try {
              const data = JSON.stringify(readData);
              controller.enqueue(encoder.encode(`event: read\ndata: ${data}\n\n`));
            } catch (err) {
              console.error('[SSE] Erro ao enfileirar confirmação de leitura:', err);
            }
          }
        };

        // Handler de novo alerta emitido pelo sistema
        const onNewAlerta = (alerta: any) => {
          if (alerta.userId === userId) {
            try {
              const data = JSON.stringify(alerta);
              controller.enqueue(encoder.encode(`event: alerta\ndata: ${data}\n\n`));
            } catch (err) {
              console.error('[SSE] Erro ao enfileirar alerta:', err);
            }
          }
        };

        chatEvents.on(CHAT_EVENT_TYPES.NEW_MESSAGE, onNewMessage);
        chatEvents.on(CHAT_EVENT_TYPES.MESSAGES_READ, onMessagesRead);
        chatEvents.on(CHAT_EVENT_TYPES.NEW_ALERTA, onNewAlerta);

        // Keep-alive heartbeat a cada 20 segundos para manter conexões proxy/HTTP abertas
        const pingInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': ping\n\n'));
          } catch {
            clearInterval(pingInterval);
          }
        }, 20000);

        // Cleanup quando a conexão fecha ou cliente desconecta
        req.signal.onabort = () => {
          clearInterval(pingInterval);
          chatEvents.off(CHAT_EVENT_TYPES.NEW_MESSAGE, onNewMessage);
          chatEvents.off(CHAT_EVENT_TYPES.MESSAGES_READ, onMessagesRead);
          chatEvents.off(CHAT_EVENT_TYPES.NEW_ALERTA, onNewAlerta);
          try {
            controller.close();
          } catch {}
        };
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[SSE Stream Auth Error]:', error);
    return new Response(JSON.stringify({ error: 'Não autorizado ou falha no stream SSE' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
