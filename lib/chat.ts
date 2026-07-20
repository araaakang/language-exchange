import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
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
