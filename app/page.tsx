"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { isProfileComplete } from "@/types/user";
import PartnerCard, { PartnerCardData } from "@/components/PartnerCard";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user, profile, loading } = useOwnProfile();
  const [partners, setPartners] = useState<PartnerCardData[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState(false);

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

      {partners.length === 0 ? (
        <p>目前還沒有其他會員。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {partners.map((partner) => (
            <PartnerCard key={partner.uid} partner={partner} />
          ))}
        </div>
      )}
    </main>
  );
}
