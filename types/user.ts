export const LANGUAGE_OPTIONS = ["中文", "英文", "韓文", "日文", "馬來文"] as const;

export type Language = (typeof LANGUAGE_OPTIONS)[number];

export const INTEREST_OPTIONS = [
  "KPOP", "韓劇", "動漫", "電影", "旅遊", "咖啡", "美食", "遊戲",
  "運動", "閱讀", "音樂", "攝影", "程式設計", "投資理財", "語言學習",
] as const;

export type Interest = (typeof INTEREST_OPTIONS)[number];

export const MAX_INTERESTS_SELECTION = 5;
export const MAX_INTERESTS_PREVIEW = 3;

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  nativeLanguage?: Language;
  targetLanguage?: Language;
  bio: string;
  interests?: Interest[];
  contact: string;
  createdAt: Date;
}

export function isProfileComplete(data?: {
  nativeLanguage?: string;
  targetLanguage?: string;
} | null): boolean {
  return (
    LANGUAGE_OPTIONS.includes(data?.nativeLanguage as Language) &&
    LANGUAGE_OPTIONS.includes(data?.targetLanguage as Language)
  );
}
