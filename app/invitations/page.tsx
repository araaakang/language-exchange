"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { useInvitations } from "@/hooks/useInvitations";
import { isProfileComplete } from "@/types/user";
import { Invitation } from "@/types/invitation";
import { PartnerCardData } from "@/components/PartnerCard";

function InvitationRow({
  invitation,
  partner,
  isReceived,
  onAccept,
  onReject,
  onRemove,
}: {
  invitation: Invitation;
  partner: PartnerCardData | undefined;
  isReceived: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
      <Link href={`/users/${partner?.uid ?? ""}`} className="flex items-center gap-3">
        {partner?.photoURL ? (
          <Image
            src={partner.photoURL}
            alt={partner.displayName ?? "使用者頭像"}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200" />
        )}
        <span className="font-bold">
          {partner?.displayName ?? "使用者"}
        </span>
      </Link>

      {isReceived && invitation.status === "pending" ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white"
          >
            接受
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            拒絕
          </button>
        </div>
      ) : invitation.status === "accepted" ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">已成為語伴</span>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-red-500 px-4 py-2 text-sm text-red-500"
          >
            解除語伴
          </button>
        </div>
      ) : (
        <span className="text-sm text-gray-600">
          {invitation.status === "pending" && "等待對方回覆"}
          {invitation.status === "rejected" && "已拒絕"}
        </span>
      )}
    </div>
  );
}

export default function InvitationsPage() {
  const router = useRouter();
  const { user, profile, loading: ownLoading } = useOwnProfile();
  const {
    invitations,
    loading: invitationsLoading,
    error: invitationsError,
    respondInvitation,
    removePartner,
  } = useInvitations();

  const [partners, setPartners] = useState<Record<string, PartnerCardData>>({});
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [partnersError, setPartnersError] = useState(false);
  const [hasFetchedPartners, setHasFetchedPartners] = useState(false);

  useEffect(() => {
    if (ownLoading || invitationsLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (!isProfileComplete(profile)) {
      router.push("/profile");
      return;
    }

    if (hasFetchedPartners) return;

    const otherUids = Array.from(
      new Set(
        invitations.map((invitation) =>
          invitation.fromUid === user.uid ? invitation.toUid : invitation.fromUid
        )
      )
    );

    const fetchPartners = async () => {
      if (invitationsError) {
        setHasFetchedPartners(true);
        setPartnersLoading(false);
        return;
      }

      try {
        const entries = await Promise.all(
          otherUids.map(async (uid) => {
            const snapshot = await getDoc(doc(db, "users", uid));
            return snapshot.exists()
              ? [uid, snapshot.data() as PartnerCardData]
              : null;
          })
        );

        setPartners(
          Object.fromEntries(
            entries.filter((entry): entry is [string, PartnerCardData] => entry !== null)
          )
        );
        setHasFetchedPartners(true);
      } catch (err) {
        console.error(err);
        setPartnersError(true);
      } finally {
        setPartnersLoading(false);
      }
    };

    fetchPartners();
  }, [
    ownLoading,
    invitationsLoading,
    invitationsError,
    user,
    profile,
    router,
    invitations,
    hasFetchedPartners,
  ]);

  const received = useMemo(
    () =>
      user
        ? invitations.filter((invitation) => invitation.toUid === user.uid)
        : [],
    [invitations, user]
  );

  const sent = useMemo(
    () =>
      user
        ? invitations.filter((invitation) => invitation.fromUid === user.uid)
        : [],
    [invitations, user]
  );

  if (ownLoading || invitationsLoading || partnersLoading) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>載入中...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (invitationsError || partnersError) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>載入邀請清單失敗，請稍後再試。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-3xl font-bold">邀請</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">收到的邀請</h2>
        {received.length === 0 ? (
          <p className="text-sm text-gray-600">目前沒有收到邀請。</p>
        ) : (
          <div className="space-y-3">
            {received.map((invitation) => (
              <InvitationRow
                key={invitation.pairId}
                invitation={invitation}
                partner={partners[invitation.fromUid]}
                isReceived
                onAccept={() => respondInvitation(invitation.pairId, "accepted")}
                onReject={() => respondInvitation(invitation.pairId, "rejected")}
                onRemove={() => removePartner(invitation.pairId)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">送出的邀請</h2>
        {sent.length === 0 ? (
          <p className="text-sm text-gray-600">目前沒有送出邀請。</p>
        ) : (
          <div className="space-y-3">
            {sent.map((invitation) => (
              <InvitationRow
                key={invitation.pairId}
                invitation={invitation}
                partner={partners[invitation.toUid]}
                isReceived={false}
                onRemove={() => removePartner(invitation.pairId)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
