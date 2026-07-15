"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc,updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [bio, setBio] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;

      const userRef = doc(
        db,
        "users",
        auth.currentUser.uid
      );

      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) return;

      const data = snapshot.data();

      setNativeLanguage(data.nativeLanguage || "");
      setTargetLanguage(data.targetLanguage || "");
      setBio(data.bio || "");
      setContact(data.contact || "");
    };

    fetchProfile();
  }, []);


  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("請先登入");
      return;
    }

    try {
      const userRef = doc(
        db,
        "users",
        auth.currentUser.uid
      );

      await updateDoc(userRef, {
        nativeLanguage,
        targetLanguage,
        bio,
        contact,
      });

      alert("個人資料儲存成功！");
    } catch (error) {
      console.error(error);
      alert("儲存失敗");
    }

    router.push("/");
  };

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        編輯個人資料
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label
            htmlFor="nativeLanguage"
            className="mb-2 block font-medium"
          >
            母語
          </label>

          <input
            id="nativeLanguage"
            type="text"
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value)}
            placeholder="例如：中文"
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="targetLanguage"
            className="mb-2 block font-medium"
          >
            想學習的語言
          </label>

          <input
            id="targetLanguage"
            type="text"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            placeholder="例如：韓文"
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="mb-2 block font-medium"
          >
            自我介紹
          </label>

          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="介紹一下自己吧！"
            className="min-h-32 w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="contact"
            className="mb-2 block font-medium"
          >
            聯絡方式
          </label>

          <input
            id="contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Discord、Instagram、Telegram..."
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-6 py-3 text-white"
        >
          儲存個人資料
        </button>
      </form>
    </main>
  );
}