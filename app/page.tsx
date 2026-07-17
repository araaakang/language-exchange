"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { useFavorites } from "@/hooks/useFavorites";
import {
  Interest,
  isProfileComplete,
  Language,
  LANGUAGE_OPTIONS,
} from "@/types/user";
import PartnerCard, { PartnerCardData } from "@/components/PartnerCard";
import InterestChipToggle from "@/components/InterestChipToggle";
import { useRouter } from "next/navigation";

function matchesFilters(
  partner: PartnerCardData,
  filters: {
    nativeLanguage: Language | "";
    targetLanguage: Language | "";
    interests: Interest[];
  }
): boolean {
  if (
    filters.nativeLanguage &&
    partner.nativeLanguage !== filters.nativeLanguage
  ) {
    return false;
  }

  if (
    filters.targetLanguage &&
    partner.targetLanguage !== filters.targetLanguage
  ) {
    return false;
  }

  if (filters.interests.length > 0) {
    const partnerInterests = partner.interests ?? [];
    const hasAll = filters.interests.every((interest) =>
      partnerInterests.includes(interest)
    );

    if (!hasAll) return false;
  }

  return true;
}

export default function Home() {
  const router = useRouter();
  const { user, profile, loading } = useOwnProfile();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [partners, setPartners] = useState<PartnerCardData[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState(false);

  const [nativeLanguageFilter, setNativeLanguageFilter] = useState<Language | "">("");
  const [targetLanguageFilter, setTargetLanguageFilter] = useState<Language | "">("");
  const [interestsFilter, setInterestsFilter] = useState<Interest[]>([]);

  const toggleInterestFilter = (interest: Interest) => {
    setInterestsFilter((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const clearFilters = () => {
    setNativeLanguageFilter("");
    setTargetLanguageFilter("");
    setInterestsFilter([]);
  };

  const hasActiveFilters =
    nativeLanguageFilter !== "" ||
    targetLanguageFilter !== "" ||
    interestsFilter.length > 0;

  const filteredPartners = useMemo(
    () =>
      partners.filter((partner) =>
        matchesFilters(partner, {
          nativeLanguage: nativeLanguageFilter,
          targetLanguage: targetLanguageFilter,
          interests: interestsFilter,
        })
      ),
    [partners, nativeLanguageFilter, targetLanguageFilter, interestsFilter]
  );

  useEffect(() => {
    // profile is temporarily null while useOwnProfile()
    // finishes the initial Firestore fetch.
    if (loading || !user || profile === null) {
      return;
    }

    if (!isProfileComplete(profile)) {
      router.push("/profile");
      return;
    }

    const fetchPartners = async () => {
      try {
        const usersQuery = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          limit(20)
        );

        const snapshot = await getDocs(usersQuery);

        const results = snapshot.docs
          .map((doc) => doc.data() as PartnerCardData)
          .filter((partner) => partner.uid !== user.uid);

        setPartners(results);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setListLoading(false);
      }
    };

    fetchPartners();
  }, [loading, user, profile, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <p>載入中...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center">
        <button
          onClick={handleLogin}
          className="rounded-lg bg-black px-6 py-3 text-white"
        >
          使用 Google 登入
        </button>
      </main>
    );
  }

  if (!isProfileComplete(profile)) {
    return null;
  }

  if (listLoading) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <p>載入中...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <p>載入會員列表失敗，請稍後再試。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">會員列表</h1>

      <div className="mb-8 space-y-4 rounded-lg border p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label
              htmlFor="nativeLanguageFilter"
              className="mb-1 block text-sm font-medium"
            >
              母語
            </label>

            <select
              id="nativeLanguageFilter"
              value={nativeLanguageFilter}
              onChange={(e) =>
                setNativeLanguageFilter(e.target.value as Language | "")
              }
              className="rounded-lg border px-3 py-2"
            >
              <option value="">全部</option>
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="targetLanguageFilter"
              className="mb-1 block text-sm font-medium"
            >
              學習語言
            </label>

            <select
              id="targetLanguageFilter"
              value={targetLanguageFilter}
              onChange={(e) =>
                setTargetLanguageFilter(e.target.value as Language | "")
              }
              className="rounded-lg border px-3 py-2"
            >
              <option value="">全部</option>
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">興趣</span>
          <InterestChipToggle
            selected={interestsFilter}
            onToggle={toggleInterestFilter}
          />
        </div>

        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
        >
          清除篩選
        </button>
      </div>

      {filteredPartners.length === 0 ? (
        <p>
          {partners.length === 0
            ? "目前還沒有其他會員。"
            : "沒有符合篩選條件的會員。"}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredPartners.map((partner) => (
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
