import Image from "next/image";
import Link from "next/link";

export interface PartnerCardData {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  nativeLanguage?: string;
  targetLanguage?: string;
  bio?: string;
  interests?: string[];
}

const BIO_PREVIEW_LENGTH = 100;
const MAX_INTERESTS = 3;

export default function PartnerCard({ partner }: { partner: PartnerCardData }) {
  const bio = partner.bio ?? "";
  const interests = partner.interests ?? [];
  const nativeLanguage = partner.nativeLanguage ?? "";
  const targetLanguage = partner.targetLanguage ?? "";

  const bioPreview =
    bio.length > BIO_PREVIEW_LENGTH
      ? `${bio.slice(0, BIO_PREVIEW_LENGTH)}...`
      : bio;

  return (
    <Link
      href={`/users/${partner.uid}`}
      className="block rounded-lg border p-4 transition hover:border-gray-400"
    >
      <div className="flex items-center gap-3">
        {partner.photoURL ? (
          <Image
            src={partner.photoURL}
            alt={partner.displayName ?? "使用者頭像"}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-200" />
        )}

        <h2 className="font-bold">
          {partner.displayName ?? "匿名使用者"}
        </h2>
      </div>

      <p className="mt-3 text-sm">母語：{nativeLanguage || "尚未設定"}</p>
      <p className="text-sm">學習語言：{targetLanguage || "尚未設定"}</p>

      {bioPreview && (
        <p className="mt-2 text-sm text-gray-600">{bioPreview}</p>
      )}

      {interests.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {interests.slice(0, MAX_INTERESTS).map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs"
            >
              {interest}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
