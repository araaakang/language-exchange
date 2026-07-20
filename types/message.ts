export const MESSAGE_TYPES = ["text", "image", "system"] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];

export const MESSAGE_STATUSES = ["sent", "deleted"] as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export interface Message {
  senderId: string;
  type: MessageType;
  text: string;
  createdAt: Date;
  status: MessageStatus;
}
