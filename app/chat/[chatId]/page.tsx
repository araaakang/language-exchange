"use client";

import { useParams } from "next/navigation";

export default function ChatRoomPage() {
  const params = useParams<{ chatId: string }>();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Chat Room</h1>
      <p>chatId: {params.chatId}</p>
    </main>
  );
}
