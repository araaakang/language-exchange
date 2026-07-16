export const LANGUAGE_OPTIONS = ["中文", "英文", "韓文", "日文", "馬來文"] as const;

export type Language = (typeof LANGUAGE_OPTIONS)[number];

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  nativeLanguage?: Language;
  targetLanguage?: Language;
  bio: string;
  interests: string[];
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
