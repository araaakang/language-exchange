"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChatRoomHeader from "@/components/ChatRoomHeader";
import MessageBubble from "@/components/MessageBubble";
import ChatInputBar from "@/components/ChatInputBar";
import { Message } from "@/types/message";

const mockOwnUid = "mock-own-uid";

const mockPartner = {
  uid: "mock-partner-uid",
  displayName: "Jennifer",
  photoURL: null as string | null,
};

const mockMessages: Message[] = [
  {
    senderId: mockPartner.uid,
    type: "text",
    text: "嗨，你好！看到你也在學韓文，要不要交換一下語言？",
    createdAt: new Date("2026-07-20T09:00:00"),
    status: "sent",
  },
  {
    senderId: mockOwnUid,
    type: "text",
    text: "你好！好啊，我最近剛開始學，很多都還不熟悉",
    createdAt: new Date("2026-07-20T09:02:00"),
    status: "sent",
  },
  {
    senderId: mockPartner.uid,
    type: "text",
    text: "沒關係，我們可以互相練習！你平常方便什麼時候聊呢？",
    createdAt: new Date("2026-07-20T09:03:00"),
    status: "sent",
  },
];

export default function ChatRoomPage() {
  const router = useRouter();
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    // 尚未接 Firestore，暫不實作送出
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col">
      <ChatRoomHeader partner={mockPartner} onBack={() => router.back()} />

      <div className="h-[65vh] space-y-3 overflow-y-auto p-4">
        {mockMessages.map((message, index) => (
          <MessageBubble
            key={index}
            text={message.text}
            createdAt={message.createdAt}
            isOwn={message.senderId === mockOwnUid}
          />
        ))}
      </div>

      <ChatInputBar value={draft} onChange={setDraft} onSend={handleSend} />
    </main>
  );
}
