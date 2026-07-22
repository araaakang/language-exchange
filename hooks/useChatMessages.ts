"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Message } from "@/types/message";

async function loadMessages(chatId: string): Promise<Message[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    )
  );

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
    } as Message;
  });
}

export function useChatMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        setMessages(await loadMessages(chatId));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [chatId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      setMessages(await loadMessages(chatId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, fetchMessages };
}
