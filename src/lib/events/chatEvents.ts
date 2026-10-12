// src/lib/events/chatEvents.ts
import { EventEmitter } from 'events';

declare global {
  // eslint-disable-next-line no-var
  var __chatEventsInstance: EventEmitter | undefined;
}

if (!globalThis.__chatEventsInstance) {
  globalThis.__chatEventsInstance = new EventEmitter();
  globalThis.__chatEventsInstance.setMaxListeners(200);
}

export const chatEvents = globalThis.__chatEventsInstance;

export const CHAT_EVENT_TYPES = {
  NEW_MESSAGE: 'new_message',
  MESSAGES_READ: 'messages_read',
  NEW_ALERTA: 'new_alerta',
} as const;
