"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { ChatDocument } from "@/types/chat";
import { UserProfile } from "@/types/user";

interface ChatListItemProps {
  chat: ChatDocument;
  partner: Partial<UserProfile> | undefined;
}

function formatChatTimestamp(value: Date | Timestamp | null): string | null {
  if (!value) return null;
  const date = value instanceof Timestamp ? value.toDate() : value;
  return date.toLocaleString("zh-TW", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatListItem({ chat, partner }: ChatListItemProps) {
  const router = useRouter();

  const goToChat = () => router.push(`/chat/${chat.chatId}`);
  const lastUpdatedLabel = formatChatTimestamp(chat.lastMessageAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToChat}
      onKeyDown={(e) => {
        if (e.key === "Enter") goToChat();
      }}
      className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition hover:border-gray-400"
    >
      {partner?.photoURL ? (
        <Image
          src={partner.photoURL}
          alt={partner.displayName ?? "使用者頭像"}
          width={48}
          height={48}
          className="rounded-full"
        />
      ) : (
        <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold">{partner?.displayName ?? "使用者"}</h2>
          {lastUpdatedLabel && (
            <span className="shrink-0 text-xs text-gray-500">
              {lastUpdatedLabel}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-gray-600">
          {chat.lastMessage?.text ?? "尚無訊息"}
        </p>
      </div>
    </div>
  );
}
