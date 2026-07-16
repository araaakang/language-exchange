"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import Image from "next/image";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isProfileComplete } from "@/types/user";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);

        if (!currentUser) return;

        const userRef = doc(
          db,
          "users",
          currentUser.uid
        );

        const snapshot = await getDoc(userRef);
        const data = snapshot.exists() ? snapshot.data() : null;

        if (data) {
          setProfile(data);
        }

        if (!isProfileComplete(data)) {
          router.push("/profile");
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

const handleLogin = async () => {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(auth, provider);

  const user = result.user;

  const userRef = doc(db, "users", user.uid);

  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    });

    console.log("新使用者建立成功");
  } else {
    console.log("使用者已存在");
  }
};

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <button
          onClick={handleLogin}
          className="rounded-lg bg-black px-6 py-3 text-white"
        >
          使用 Google 登入
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      {user.photoURL && (
        <Image
          src={user.photoURL}
          alt="profile"
          width={100}
          height={100}
          className="rounded-full"
        />
      )}

      <h1 className="text-3xl font-bold">
        嗨，{user.displayName} 👋
      </h1>

      <p>{user.email}</p>
      {profile && (
        <>
          <p>母語：{profile.nativeLanguage}</p>
          <p>學習語言：{profile.targetLanguage}</p>
          <p>自我介紹：{profile.bio}</p>
          <p>聯絡方式：{profile.contact}</p>
        </>
      )}
      <Link
        href="/profile"
        className="rounded-lg bg-blue-500 px-4 py-2 text-white"
      >
        編輯個人資料
      </Link>
      <Link
        href="/users"
        className="rounded-lg bg-blue-500 px-4 py-2 text-white"
      >
        瀏覽會員
      </Link>
      <button
        onClick={handleLogout}
        className="rounded-lg bg-red-500 px-4 py-2 text-white"
      >
        登出
      </button>
    </main>
  );
}