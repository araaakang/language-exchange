"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { isProfileComplete } from "@/types/user";
import ProfileDetail from "@/components/ProfileDetail";

export default function UserPage() {
  const router = useRouter();
  const { user, profile, loading } = useOwnProfile();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (!isProfileComplete(profile)) {
      router.push("/profile");
    }
  }, [loading, user, profile, router]);

  if (loading || !user || !isProfileComplete(profile)) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>載入中...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <ProfileDetail
        data={{
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          nativeLanguage: profile?.nativeLanguage,
          targetLanguage: profile?.targetLanguage,
          bio: profile?.bio,
          interests: profile?.interests,
          contact: profile?.contact,
        }}
      />

      <Link
        href="/profile"
        className="mt-6 inline-block rounded-lg bg-blue-500 px-4 py-2 text-white"
      >
        編輯個人資料
      </Link>
    </main>
  );
}
