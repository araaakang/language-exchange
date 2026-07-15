"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import PartnerCard, { PartnerCardData } from "@/components/PartnerCard";

export default function UsersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<PartnerCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }

      try {
        const usersQuery = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          limit(20)
        );

        const snapshot = await getDocs(usersQuery);

        const results = snapshot.docs
          .map((doc) => doc.data() as PartnerCardData)
          .filter((partner) => partner.uid !== currentUser.uid);

        setPartners(results);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
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
