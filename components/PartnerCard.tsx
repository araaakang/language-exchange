import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Interest, Language, MAX_INTERESTS_PREVIEW } from "@/types/user";
import { useInvitations } from "@/hooks/useInvitations";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { getChatId } from "@/types/chat";

export interface PartnerCardData {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  nativeLanguage?: Language;
  targetLanguage?: Language;
  bio?: string;
  interests?: Interest[];
}

interface PartnerCardProps {
  partner: PartnerCardData;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

const BIO_PREVIEW_LENGTH = 100;

export default function PartnerCard({
  partner,
  isFavorited,
  onToggleFavorite,
}: PartnerCardProps) {
  const router = useRouter();
  const { user } = useOwnProfile();
  const { getInvitationWith } = useInvitations();

  const isAccepted = getInvitationWith(partner.uid)?.status === "accepted";

  const handleChat = () => {
    if (!user) return;
    router.push(`/chat/${getChatId(user.uid, partner.uid)}`);
  };

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
      <div className="flex items-center justify-between gap-3">
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

        <div className="flex items-center gap-3">
          {isAccepted && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleChat();
              }}
              className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white"
            >
              聊天
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={isFavorited ? "取消收藏" : "收藏"}
            className="text-2xl leading-none"
          >
            {isFavorited ? "♥" : "♡"}
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm">母語：{nativeLanguage || "尚未設定"}</p>
      <p className="text-sm">學習語言：{targetLanguage || "尚未設定"}</p>

      {bioPreview && (
        <p className="mt-2 text-sm text-gray-600">{bioPreview}</p>
      )}

      {interests.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {interests.slice(0, MAX_INTERESTS_PREVIEW).map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-black px-3 py-1 text-xs text-white"
            >
              {interest}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
