"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types/user";

export function useChatPartner(chatId: string, ownUid: string) {
  const [partner, setPartner] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      setLoading(true);
      try {
        const chatSnapshot = await getDoc(doc(db, "chats", chatId));
        const participants = (chatSnapshot.data()?.participants ?? []) as string[];
        const partnerUid = participants.find((uid) => uid !== ownUid);

        if (!partnerUid) {
          setPartner(null);
          return;
        }

        const partnerSnapshot = await getDoc(doc(db, "users", partnerUid));
        setPartner(
          partnerSnapshot.exists()
            ? (partnerSnapshot.data() as Partial<UserProfile>)
            : null
        );
      } catch (err) {
        console.error(err);
        setPartner(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [chatId, ownUid]);

  return { partner, loading };
}
