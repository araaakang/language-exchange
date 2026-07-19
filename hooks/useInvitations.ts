"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import {
  getInvitationPairId,
  getInvitationParticipants,
  Invitation,
  InvitationStatus,
} from "@/types/invitation";

export function useInvitations() {
  const { user, loading: ownProfileLoading } = useOwnProfile();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ownProfileLoading || !user) return;

    const fetchInvitations = async () => {
      try {
        const snapshot = await getDocs(
          query(
            collection(db, "invitations"),
            where("participants", "array-contains", user.uid)
          )
        );

        setInvitations(snapshot.docs.map((d) => d.data() as Invitation));
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [ownProfileLoading, user]);

  const getInvitationWith = (targetUid: string) => {
    if (!user) return undefined;
    const pairId = getInvitationPairId(user.uid, targetUid);
    return invitations.find((invitation) => invitation.pairId === pairId);
  };

  const sendInvitation = async (targetUid: string) => {
    if (!user || targetUid === user.uid) return;

    const pairId = getInvitationPairId(user.uid, targetUid);
    const optimisticInvitation: Invitation = {
      pairId,
      fromUid: user.uid,
      toUid: targetUid,
      participants: getInvitationParticipants(user.uid, targetUid),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setInvitations((prev) => [...prev, optimisticInvitation]);

    try {
      await setDoc(doc(db, "invitations", pairId), {
        pairId,
        fromUid: user.uid,
        toUid: targetUid,
        participants: getInvitationParticipants(user.uid, targetUid),
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      alert("邀請失敗，請稍後再試");
      setInvitations((prev) =>
        prev.filter((invitation) => invitation.pairId !== pairId)
      );
    }
  };

  const respondInvitation = async (
    pairId: string,
    status: Extract<InvitationStatus, "accepted" | "rejected">
  ) => {
    const previousStatus = invitations.find(
      (invitation) => invitation.pairId === pairId
    )?.status;

    setInvitations((prev) =>
      prev.map((invitation) =>
        invitation.pairId === pairId
          ? { ...invitation, status, updatedAt: new Date() }
          : invitation
      )
    );

    try {
      await updateDoc(doc(db, "invitations", pairId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      alert("操作失敗，請稍後再試");
      if (previousStatus) {
        setInvitations((prev) =>
          prev.map((invitation) =>
            invitation.pairId === pairId
              ? { ...invitation, status: previousStatus }
              : invitation
          )
        );
      }
    }
  };

  const removePartner = async (pairId: string) => {
    const target = invitations.find(
      (invitation) => invitation.pairId === pairId
    );
    if (!target || target.status !== "accepted") return;

    if (!window.confirm("確定要解除語伴嗎？")) return;

    setInvitations((prev) =>
      prev.filter((invitation) => invitation.pairId !== pairId)
    );

    try {
      await deleteDoc(doc(db, "invitations", pairId));
    } catch (err) {
      console.error(err);
      alert("操作失敗，請稍後再試");
      setInvitations((prev) => [...prev, target]);
    }
  };

  return {
    invitations,
    loading,
    error,
    getInvitationWith,
    sendInvitation,
    respondInvitation,
    removePartner,
  };
}
