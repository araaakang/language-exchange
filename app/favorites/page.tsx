"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { useFavorites } from "@/hooks/useFavorites";
import { isProfileComplete } from "@/types/user";
import PartnerCard, { PartnerCardData } from "@/components/PartnerCard";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, profile, loading: ownLoading } = useOwnProfile();
  const {
    favoriteUserIds,
    isFavorited,
    toggleFavorite,
    loading: favoritesLoading,
  } = useFavorites();

  const [favoritePartners, setFavoritePartners] = useState<PartnerCardData[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasFetchedFavorites, setHasFetchedFavorites] = useState(false);

  useEffect(() => {
    if (ownLoading || favoritesLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (!isProfileComplete(profile)) {
      router.push("/profile");
      return;
    }

    if (hasFetchedFavorites) return;

    const fetchFavoritePartners = async () => {
      try {
        const results = await Promise.all(
          favoriteUserIds.map(async (id) => {
            const snapshot = await getDoc(doc(db, "users", id));
            return snapshot.exists()
              ? (snapshot.data() as PartnerCardData)
              : null;
          })
        );

        setFavoritePartners(
          results.filter((partner): partner is PartnerCardData => partner !== null)
        );
        setHasFetchedFavorites(true);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setListLoading(false);
      }
    };

    fetchFavoritePartners();
  }, [
    ownLoading,
    favoritesLoading,
    user,
    profile,
    router,
    favoriteUserIds,
    hasFetchedFavorites,
  ]);

  const displayedFavorites = useMemo(
    () => favoritePartners.filter((partner) => favoriteUserIds.includes(partner.uid)),
    [favoritePartners, favoriteUserIds]
  );

  if (ownLoading || favoritesLoading || listLoading) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <p>載入中...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <p>載入收藏清單失敗，請稍後再試。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">我的收藏</h1>

      {displayedFavorites.length === 0 ? (
        <p>目前還沒有收藏任何語伴。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {displayedFavorites.map((partner) => (
            <PartnerCard
              key={partner.uid}
              partner={partner}
              isFavorited={isFavorited(partner.uid)}
              onToggleFavorite={() => toggleFavorite(partner.uid)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
