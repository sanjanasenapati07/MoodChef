# MoodChef

MoodChef helps you choose manageable activities based on your energy level. It presents everyday tasks as a personal “dopamine menu,” so you can build a routine that feels achievable and rewarding.

## Features

- Sign up, sign in, and manage your profile.
- Browse activities grouped into Starters, Mains, and Desserts.
- Choose activities for your daily routine and track completion toward a daily goal.
- Add and manage activities, including an energy level and optional image.
- Sync activity data through Supabase.
- Build for the web and run as a native app with Ionic and Capacitor.

## Tech stack

- React 19 and TypeScript
- Ionic React
- Vite
- Supabase
- Capacitor for Android and iOS

## Getting started

Install dependencies:

```bash
npm install
```

Configure your Supabase project in `src/supabaseClient.ts`. The app uses Supabase Authentication and an `activities` table; configure the table, access policies, and any required storage in your Supabase project before using those features. Use only a publishable/anon key in the client, with appropriate Row Level Security policies. Never put a Supabase service-role key in a client app.

Start the development server:

```bash
npm run dev
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project and create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run test.unit` | Run unit tests with Vitest. |
| `npm run test.e2e` | Run end-to-end tests with Cypress. |
| `npm run lint` | Run ESLint. |

## Native apps

The Android and iOS Capacitor projects are in `android/` and `ios/`. After building the web app, use the [Capacitor documentation](https://capacitorjs.com/docs) to sync and open the native projects for your platform.
