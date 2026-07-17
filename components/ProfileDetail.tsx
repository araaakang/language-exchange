import Image from "next/image";
import { Interest, Language } from "@/types/user";

export interface ProfileDetailData {
  displayName: string | null;
  email?: string | null;
  photoURL: string | null;
  nativeLanguage?: Language;
  targetLanguage?: Language;
  bio?: string;
  interests?: Interest[];
  contact?: string;
}

export default function ProfileDetail({ data }: { data: ProfileDetailData }) {
  const nativeLanguage = data.nativeLanguage ?? "";
  const targetLanguage = data.targetLanguage ?? "";
  const bio = data.bio ?? "";
  const interests = data.interests ?? [];
  const contact = data.contact ?? "";

  return (
    <div>
      <div className="flex items-center gap-4">
        {data.photoURL ? (
          <Image
            src={data.photoURL}
            alt={data.displayName ?? "使用者頭像"}
            width={96}
            height={96}
            className="rounded-full"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-gray-200" />
        )}

        <div>
          <h1 className="text-3xl font-bold">
            {data.displayName ?? "匿名使用者"}
          </h1>
          {data.email && <p className="text-sm text-gray-600">{data.email}</p>}
        </div>
      </div>

      <p className="mt-6">母語：{nativeLanguage || "尚未設定"}</p>
      <p>學習語言：{targetLanguage || "尚未設定"}</p>

      <p className="mt-4 whitespace-pre-wrap">
        {bio || "尚未填寫自我介紹"}
      </p>

      {interests.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-black px-3 py-1 text-xs text-white"
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      <p className="mt-6">聯絡方式：{contact || "尚未設定"}</p>
    </div>
  );
}
