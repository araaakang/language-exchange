"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { PartnerCardData } from "@/components/PartnerCard";
import { isProfileComplete } from "@/types/user";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { useFavorites } from "@/hooks/useFavorites";
import { useInvitations } from "@/hooks/useInvitations";
import ProfileDetail from "@/components/ProfileDetail";
import { getChatId } from "@/types/chat";

type PartnerDetail = PartnerCardData & { contact?: string };

export default function UserDetailPage() {
  const params = useParams<{ uid: string }>();
  const router = useRouter();
  const uid = params.uid;
  const { user, profile: ownProfile, loading: ownLoading } = useOwnProfile();
  const { isFavorited, toggleFavorite } = useFavorites();
  const {
    getInvitationWith,
    sendInvitation,
    respondInvitation,
    removePartner,
  } = useInvitations();

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

  if (!user) {
    return null;
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

      {uid !== user.uid && (
        <div className="mb-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => toggleFavorite(uid)}
            aria-label={isFavorited(uid) ? "取消收藏" : "收藏"}
            className="text-3xl leading-none"
          >
            {isFavorited(uid) ? "♥" : "♡"}
          </button>

          {(() => {
            const invitation = getInvitationWith(uid);

            if (!invitation) {
              return (
                <button
                  type="button"
                  onClick={() => sendInvitation(uid)}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white"
                >
                  發送邀請
                </button>
              );
            }

            if (invitation.status === "pending") {
              if (invitation.toUid === user.uid) {
                return (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => respondInvitation(invitation.pairId, "accepted")}
                      className="rounded-lg bg-blue-500 px-4 py-2 text-white"
                    >
                      接受
                    </button>
                    <button
                      type="button"
                      onClick={() => respondInvitation(invitation.pairId, "rejected")}
                      className="rounded-lg border px-4 py-2"
                    >
                      拒絕
                    </button>
                  </div>
                );
              }

              return <p className="text-sm text-gray-600">邀請中，等待對方回覆</p>;
            }

            if (invitation.status === "accepted") {
              return (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">已成為語伴</p>
                  <button
                    type="button"
                    onClick={() => router.push(`/chat/${getChatId(user.uid, uid)}`)}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white"
                  >
                    聊天
                  </button>
                  <button
                    type="button"
                    onClick={() => removePartner(invitation.pairId)}
                    className="rounded-lg border border-red-500 px-4 py-2 text-sm text-red-500"
                  >
                    解除語伴
                  </button>
                </div>
              );
            }

            return <p className="text-sm text-gray-600">邀請已被拒絕</p>;
          })()}
        </div>
      )}

      <ProfileDetail data={partner} />
    </main>
  );
}
