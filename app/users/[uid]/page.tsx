"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { PartnerCardData } from "@/components/PartnerCard";

type PartnerDetail = PartnerCardData & { contact?: string };

export default function UserDetailPage() {
  const params = useParams<{ uid: string }>();
  const router = useRouter();
  const uid = params.uid;

  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "users", uid));

        if (!snapshot.exists()) {
          setNotFound(true);
        } else {
          setPartner(snapshot.data() as PartnerDetail);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [uid, router]);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>載入中...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>載入使用者資料失敗，請稍後再試。</p>
      </main>
    );
  }

  if (notFound || !partner) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="mb-4">找不到此使用者。</p>
        <Link href="/users" className="text-blue-500 underline">
          返回會員列表
        </Link>
      </main>
    );
  }

  const bio = partner.bio ?? "";
  const interests = partner.interests ?? [];
  const nativeLanguage = partner.nativeLanguage ?? "";
  const targetLanguage = partner.targetLanguage ?? "";
  const contact = partner.contact ?? "";

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link
        href="/users"
        className="mb-6 inline-block text-blue-500 underline"
      >
        返回會員列表
      </Link>

      <div className="flex items-center gap-4">
        {partner.photoURL ? (
          <Image
            src={partner.photoURL}
            alt={partner.displayName ?? "使用者頭像"}
            width={96}
            height={96}
            className="rounded-full"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-gray-200" />
        )}

        <h1 className="text-3xl font-bold">
          {partner.displayName ?? "匿名使用者"}
        </h1>
      </div>

      <p className="mt-6">母語：{nativeLanguage || "尚未設定"}</p>
      <p>學習語言：{targetLanguage || "尚未設定"}</p>

      <p className="mt-4 whitespace-pre-wrap">
        {bio || "這位使用者還沒有填寫自我介紹。"}
      </p>

      {interests.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs"
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      <p className="mt-6">聯絡方式：{contact || "尚未設定"}</p>
    </main>
  );
}
