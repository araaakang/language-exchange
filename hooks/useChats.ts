"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { ChatDocument } from "@/types/chat";

export function useChats() {
  const { user, loading: ownProfileLoading } = useOwnProfile();
  const [chats, setChats] = useState<ChatDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ownProfileLoading || !user) return;

    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        setChats(
          snapshot.docs.map(
            (d) => ({ chatId: d.id, ...d.data() }) as ChatDocument
          )
        );
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [ownProfileLoading, user]);

  return { chats, loading, error };
}
