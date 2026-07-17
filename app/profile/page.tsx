"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  INTEREST_OPTIONS,
  Interest,
  LANGUAGE_OPTIONS,
  Language,
  MAX_INTERESTS_SELECTION,
} from "@/types/user";
import { useOwnProfile } from "@/hooks/useOwnProfile";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading } = useOwnProfile();

  const [nativeLanguage, setNativeLanguage] = useState<Language | "">("");
  const [targetLanguage, setTargetLanguage] = useState<Language | "">("");
  const [bio, setBio] = useState("");
  const [contact, setContact] = useState("");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Adjust form state during render, once, when own profile data first arrives.
  if (!loading && user && !hasPrefilled) {
    setHasPrefilled(true);

    if (profile) {
      setNativeLanguage(
        profile.nativeLanguage && LANGUAGE_OPTIONS.includes(profile.nativeLanguage)
          ? profile.nativeLanguage
          : ""
      );
      setTargetLanguage(
        profile.targetLanguage && LANGUAGE_OPTIONS.includes(profile.targetLanguage)
          ? profile.targetLanguage
          : ""
      );
      setBio(profile.bio || "");
      setContact(profile.contact || "");
      setInterests(
        Array.isArray(profile.interests)
          ? profile.interests.filter((interest) =>
              INTEREST_OPTIONS.includes(interest)
            )
          : []
      );
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  const toggleInterest = (interest: Interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < MAX_INTERESTS_SELECTION
          ? [...prev, interest]
          : prev
    );
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      alert("請先登入");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        nativeLanguage,
        targetLanguage,
        bio,
        contact,
        interests,
      });

      alert("個人資料儲存成功！");
    } catch (error) {
      console.error(error);
      alert("儲存失敗");
    }

    router.push("/user");
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

          <select
            id="nativeLanguage"
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value as Language)}
            required
            className="w-full rounded-lg border px-4 py-2"
          >
            <option value="" disabled>
              請選擇母語
            </option>
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="targetLanguage"
            className="mb-2 block font-medium"
          >
            想學習的語言
          </label>

          <select
            id="targetLanguage"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value as Language)}
            required
            className="w-full rounded-lg border px-4 py-2"
          >
            <option value="" disabled>
              請選擇想學習的語言
            </option>
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-2 block font-medium">
            興趣（已選擇 {interests.length} / {MAX_INTERESTS_SELECTION}）
          </span>

          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);
              const disabled =
                !selected && interests.length >= MAX_INTERESTS_SELECTION;

              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  disabled={disabled}
                  className={`rounded-full px-3 py-1 text-sm ${
                    selected
                      ? "border border-black bg-white text-black"
                      : "bg-black text-white disabled:opacity-40"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
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
