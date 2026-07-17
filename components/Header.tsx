"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="font-bold">
        Language-exchange
      </Link>

      {user && (
        <div className="group relative">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "使用者頭像"}
              width={36}
              height={36}
              className="cursor-pointer rounded-full"
            />
          ) : (
            <div className="h-9 w-9 cursor-pointer rounded-full bg-gray-200" />
          )}

          <div className="invisible absolute right-0 top-full z-10 w-40 rounded-lg border bg-white text-black opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
            <Link
              href="/user"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              會員資料
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              登出
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
