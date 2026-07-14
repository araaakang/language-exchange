"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import Image from "next/image";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
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

      <button
        onClick={handleLogout}
        className="rounded-lg bg-red-500 px-4 py-2 text-white"
      >
        登出
      </button>
    </main>
  );
}