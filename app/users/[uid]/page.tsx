"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { PartnerCardData } from "@/components/PartnerCard";
import { isProfileComplete } from "@/types/user";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import ProfileDetail from "@/components/ProfileDetail";

type PartnerDetail = PartnerCardData & { contact?: string };

export default function UserDetailPage() {
  const params = useParams<{ uid: string }>();
  const router = useRouter();
  const uid = params.uid;
  const { user, profile: ownProfile, loading: ownLoading } = useOwnProfile();

  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ownLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (!isProfileComplete(ownProfile)) {
      router.push("/profile");
      return;
    }

    const fetchPartner = async () => {
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
    };

    fetchPartner();
  }, [ownLoading, user, ownProfile, uid, router]);

  if (ownLoading || loading) {
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
        <Link href="/" className="text-blue-500 underline">
          返回會員列表
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link
        href="/"
        className="mb-6 inline-block text-blue-500 underline"
      >
        返回會員列表
      </Link>

      <ProfileDetail data={partner} />
    </main>
  );
}
