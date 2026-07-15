interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  nativeLanguage: string;
  targetLanguage: string;
  bio: string;
  interests: string[];
  contact: string;
  createdAt: Date;
}