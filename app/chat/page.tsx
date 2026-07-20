"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { useChats } from "@/hooks/useChats";
import { isProfileComplete, UserProfile } from "@/types/user";
import { ChatDocument } from "@/types/chat";
import ChatListItem from "@/components/ChatListItem";

function getOtherUid(chat: ChatDocument, ownUid: string): string | undefined {
  return chat.participants.find((uid) => uid !== ownUid);
}

async function fetchParticipants(
  chats: ChatDocument[],
  ownUid: string
): Promise<Record<string, Partial<UserProfile>>> {
  const otherUids = Array.from(
    new Set(
      chats
        .map((chat) => getOtherUid(chat, ownUid))
        .filter((uid): uid is string => Boolean(uid))
    )
  );

  const entries = await Promise.all(
    otherUids.map(async (uid) => {
      const snapshot = await getDoc(doc(db, "users", uid));
      return snapshot.exists()
        ? ([uid, snapshot.data() as Partial<UserProfile>] as const)
        : null;
    })
  );

  return Object.fromEntries(
    entries.filter(
      (entry): entry is readonly [string, Partial<UserProfile>] =>
        entry !== null
    )
  );
}

export default function ChatListPage() {
  const router = useRouter();
  const { user, profile, loading: ownLoading } = useOwnProfile();
  const { chats, loading: chatsLoading, error: chatsError } = useChats();

  const [partners, setPartners] = useState<Record<string, Partial<UserProfile>>>({});
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [partnersError, setPartnersError] = useState(false);

  useEffect(() => {
    if (ownLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (!isProfileComplete(profile)) {
      router.push("/profile");
    }
  }, [ownLoading, user, profile, router]);

  useEffect(() => {
    if (ownLoading || chatsLoading || !user) return;

    fetchParticipants(chats, user.uid)
      .then(setPartners)
      .catch((err) => {
        console.error(err);
        setPartnersError(true);
      })
      .finally(() => setPartnersLoading(false));
  }, [ownLoading, chatsLoading, user, chats]);

  if (ownLoading || chatsLoading || partnersLoading) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>載入中...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (chatsError || partnersError) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>載入聊天列表失敗，請稍後再試。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-3xl font-bold">聊天</h1>

      {chats.length === 0 ? (
        <div className="text-center">
          <p className="mb-2 font-bold">還沒有任何聊天室</p>
          <p className="mb-6 text-sm text-gray-600">
            快去尋找語伴開始聊天吧！
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-500 px-4 py-2 text-white"
          >
            返回會員列表
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <ChatListItem
              key={chat.chatId}
              chat={chat}
              partner={partners[getOtherUid(chat, user.uid) ?? ""]}
            />
          ))}
        </div>
      )}
    </main>
  );
}
