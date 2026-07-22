"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatRoomHeader from "@/components/ChatRoomHeader";
import MessageBubble from "@/components/MessageBubble";
import ChatInputBar from "@/components/ChatInputBar";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatPartner } from "@/hooks/useChatPartner";
import { sendMessage } from "@/lib/chat";

export default function ChatRoomPage() {
  const params = useParams<{ chatId: string }>();
  const router = useRouter();
  const { user } = useOwnProfile();
  const { messages, loading } = useChatMessages(params.chatId);
  const { partner, loading: partnerLoading } = useChatPartner(
    params.chatId,
    user?.uid ?? ""
  );
  const [draft, setDraft] = useState("");

  const handleSend = async () => {
    if (!user || !draft.trim()) return;

    try {
      await sendMessage(params.chatId, user.uid, draft);
      setDraft("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col">
      <ChatRoomHeader
        partner={{
          displayName: partnerLoading ? "載入中..." : partner?.displayName ?? null,
          photoURL: partnerLoading ? null : partner?.photoURL ?? null,
        }}
        onBack={() => router.back()}
      />

      <div className="h-[65vh] space-y-3 overflow-y-auto p-4">
        {loading ? (
          <p>載入中...</p>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={index}
              text={message.text}
              createdAt={message.createdAt}
              isOwn={message.senderId === user?.uid}
            />
          ))
        )}
      </div>

      <ChatInputBar value={draft} onChange={setDraft} onSend={handleSend} />
    </main>
  );
}
