# Learnova AI

React + TypeScript + Vite + Tailwind.

```
npm install
npm run dev
```

## Backend
Every backend call lives in `src/api/`. Copy `.env.example` to `.env`, set `VITE_API_URL=https://your-api.com`
and restart `npm run dev`. With no `VITE_API_URL` the app runs on built-in sample data.

Sample-data mode: any email works to sign in (password at least 6 characters).
`taken@mail.com` simulates "email already registered".

## Project structure
```
src/
  main.tsx              entry point
  App.tsx               picks the page from the address, sends logged-out visitors to /login
  index.css             all styling
  api/
    index.ts            one function per endpoint (the route is written above each one)
    types.ts            the shapes of the data the backend sends back
    client.ts           base URL, login token, the request helper
    mock.ts             sample data (delete once the backend is connected)
  pages/                one file per page
    Auth.tsx  Dashboard.tsx  Upload.tsx  Library.tsx  Overview.tsx
    Lesson.tsx  Quiz.tsx  Flashcards.tsx  Progress.tsx  Settings.tsx
  components/           pieces shared by several pages
    AppShell.tsx        sidebar + top bar
    LessonPlayer.tsx    lesson audio player
    Avatar.tsx          the animated instructor drawing
    Icon.tsx  ui.tsx    icons, toasts, loading wrapper, small inputs
  lib/                  helpers
    router.ts           page routing   hooks.ts  data loading   auth.ts  login check / sign out
    useMouth.ts         audio volume -> mouth movement   format.ts  time formatting
```
