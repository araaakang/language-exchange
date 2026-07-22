import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CHAT_SCHEMA_VERSION, getChatId, getChatParticipants } from "@/types/chat";

// Chat domain's Firestore entry point. Future chat operations (getChat,
// sendMessage, subscribeMessages, markAsRead, updateLastMessage) belong
// here too, not scattered across hooks.

export async function ensureDirectChat(
  uidA: string,
  uidB: string
): Promise<{ chatId: string; created: boolean }> {
  if (uidA === uidB) {
    throw new Error("無法建立聊天室：參與者不可相同");
  }

  const chatId = getChatId(uidA, uidB);
  const chatRef = doc(db, "chats", chatId);

  const created = await runTransaction(db, async (transaction) => {
    const chatSnapshot = await transaction.get(chatRef);

    if (chatSnapshot.exists()) {
      return false;
    }

    transaction.set(chatRef, {
      participants: getChatParticipants(uidA, uidB),
      type: "direct",
      status: "active",
      version: CHAT_SCHEMA_VERSION,
      lastMessage: null,
      lastMessageAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return true;
  });

  return { chatId, created };
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("訊息內容不可為空");
  }

  const chatRef = doc(db, "chats", chatId);
  const messageRef = doc(collection(chatRef, "messages"));

  const batch = writeBatch(db);

  batch.set(messageRef, {
    senderId,
    type: "text",
    text: trimmed,
    status: "sent",
    createdAt: serverTimestamp(),
  });

  batch.update(chatRef, {
    lastMessage: {
      text: trimmed,
      senderId,
      type: "text",
      createdAt: serverTimestamp(),
    },
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}
