@AGENTS.md

# Language Exchange

A web app for language exchange partners to sign in with Google, fill out a
language-learning profile (native language, target language, bio, contact), and
view their profile.

## Tech Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS 4** (via `@tailwindcss/postcss`) for styling
- **Firebase 12** — Google Authentication + Cloud Firestore

> ⚠️ Next.js 16 has breaking changes vs. older versions. Per `AGENTS.md`, read
> the relevant guide in `node_modules/next/dist/docs/` before writing code.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project Structure

- `app/layout.tsx` — root layout (Geist fonts, global styles)
- `app/page.tsx` — home page: Google sign-in/out, creates the user's Firestore
  document on first login, and displays the current user's profile
- `app/profile/page.tsx` — profile editor: loads and updates the signed-in
  user's Firestore document, then redirects home
- `lib/firebase.ts` — Firebase app/auth/Firestore initialization (singleton)
- `types/user.ts` — `UserProfile` interface
- `app/globals.css` — Tailwind + global CSS

## Firebase

- **Auth**: Google provider via `signInWithPopup`. Auth state is observed with
  `onAuthStateChanged` on the client.
- **Firestore**: profiles live in the `users` collection, keyed by `user.uid`.
  On first login a document is created with `uid`, `displayName`, `email`,
  `photoURL`, and `createdAt` (`serverTimestamp()`). The profile editor updates
  `nativeLanguage`, `targetLanguage`, `bio`, and `contact`.
- Config comes from `NEXT_PUBLIC_FIREBASE_*` environment variables (set these in
  `.env.local`).

## Notes

- All pages are Client Components (`"use client"`) because they use the Firebase
  client SDK for auth/Firestore.
- Google profile images are loaded via `next/image`; `lh3.googleusercontent.com`
  is allowlisted in `next.config.ts`.
- UI copy is in Traditional Chinese.
