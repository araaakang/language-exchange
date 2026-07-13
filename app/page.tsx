"use client";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Home() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);

    console.log(result.user);
  };

  return (
    <button onClick={handleLogin}>
      使用 Google 登入
    </button>
  );
}