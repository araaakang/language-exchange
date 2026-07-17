"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOwnProfile } from "@/hooks/useOwnProfile";

export function useFavorites() {
  const { user, loading: ownProfileLoading } = useOwnProfile();
  const [favoriteUserIds, setFavoriteUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ownProfileLoading || !user) return;

    const fetchFavorites = async () => {
      const snapshot = await getDocs(
        collection(db, "users", user.uid, "favorites")
      );

      setFavoriteUserIds(snapshot.docs.map((favoriteDoc) => favoriteDoc.id));
      setLoading(false);
    };

    fetchFavorites();
  }, [ownProfileLoading, user]);

  const isFavorited = (targetUid: string) =>
    favoriteUserIds.includes(targetUid);

  const toggleFavorite = async (targetUid: string) => {
    if (!user || targetUid === user.uid) return;

    const wasFavorited = isFavorited(targetUid);
    const favoriteRef = doc(db, "users", user.uid, "favorites", targetUid);

    setFavoriteUserIds((prev) =>
      wasFavorited
        ? prev.filter((id) => id !== targetUid)
        : [...prev, targetUid]
    );

    try {
      if (wasFavorited) {
        await deleteDoc(favoriteRef);
      } else {
        await setDoc(favoriteRef, {
          uid: targetUid,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(err);
      alert("操作失敗，請稍後再試");

      setFavoriteUserIds((prev) =>
        wasFavorited
          ? [...prev, targetUid]
          : prev.filter((id) => id !== targetUid)
      );
    }
  };

  return { favoriteUserIds, isFavorited, toggleFavorite, loading };
}
