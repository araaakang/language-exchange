import { MessageType } from "@/types/message";

export const CHAT_TYPES = ["direct", "group"] as const;

export type ChatType = (typeof CHAT_TYPES)[number];

export const CHAT_STATUSES = ["active", "closed"] as const;

export type ChatStatus = (typeof CHAT_STATUSES)[number];

export const CHAT_SCHEMA_VERSION = 1;

export interface ChatLastMessage {
  text: string;
  senderId: string;
  type: MessageType;
  createdAt: Date;
}

export interface Chat {
  participants: string[];
  type: ChatType;
  status: ChatStatus;
  lastMessage: ChatLastMessage | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface ChatDocument extends Chat {
  chatId: string;
}

export function getChatId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("_");
}

export function getChatParticipants(uidA: string, uidB: string): string[] {
  return [uidA, uidB].sort();
}
