# Haven (mobile app)

Haven is a cross-platform **React Native** app built with **Expo SDK 54**, **expo-router**, and **TypeScript**. It serves two audiences in one binary:

- **Clients** — AI-assisted chat and voice therapy, mood and gratitude tooling, booking and messaging with human therapists.
- **Therapists** — dashboard, clients, scheduling, wallet, video sessions, and secure messaging, authenticated separately from clients.

The app talks to the **Havens API** (see the sibling `havens-backend` repository). This README focuses on running and configuring **Haven** locally and connecting it to your API.

---

## Prerequisites

Install the following before you begin.

| Requirement | Notes |
|-------------|--------|
| **Node.js** | **20+** recommended (Expo 54 / RN 0.81 tooling works well on current LTS). |
| **Package manager** | **pnpm** (`corepack enable && corepack prepare pnpm@latest --activate`) or **npm**. The repo contains both `pnpm-lock.yaml` and `package-lock.json`; pick one consistently. |
| **Git** | For cloning the repo. |
| **Expo CLI** | Usually used via `npx expo` (no global install required). |
| **iOS (macOS only)** | Xcode + Command Line Tools + CocoaPods (Expo may run `pod install` during prebuild). Simulator or a physical device with the **Expo Go** app or a **development build**. |
| **Android** | Android Studio (SDK, emulator, or USB debugging). **JDK 17** is typical for current RN/Gradle stacks. |
| **A running API** | The backend must be reachable at the URL you configure (see [Environment variables](#environment-variables)). Default dev assumption: `http://<your-lan-ip>:3333` or `http://localhost:3333` where applicable. |

Optional but useful:

- **Watchman** (macOS) for better Metro file watching.
- **EAS CLI** (`npm i -g eas-cli`) if you use Expo Application Services for builds.

---

## Clone and install

```bash
git clone https://github.com/hycienti/software-prototype Haven
cd Haven
```

Install dependencies (choose one):

```bash
pnpm install
# or
npm install
```

## Required first step (native bindings)

Because this app uses native bindings/modules, run a clean prebuild before starting iOS or Android development:

```bash
pnpm prebuild --clean
# or
npx expo prebuild --clean
```

This regenerates native projects and ensures bindings are synced with current dependencies.

---

## Environment variables

Create a **`.env`** file in the **Haven project root** (same folder as `package.json`). This file is **gitignored**; do not commit secrets.

### Required for a good local experience

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | **Base URL of the Havens API** (no path suffix). Example: `http://192.168.1.42:3333` when testing on a physical device, or `http://localhost:3333` for some emulators. If unset, dev builds infer the host from Metro (`Constants.expoConfig.hostUri`) and append port **3333**; physical devices often **cannot** reach `localhost` on your laptop—you must use your machine’s LAN IP. |

### Optional (real-time features)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_PUSHER_KEY` | Pusher **public** key for streaming / realtime where implemented. |
| `EXPO_PUBLIC_PUSHER_CLUSTER` | Pusher cluster (e.g. `mt1`). |

If unset, the app may fall back to inline defaults in code—**override these in production** with your own Pusher app.

### Example `.env`

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3333
EXPO_PUBLIC_PUSHER_KEY=your_pusher_key
EXPO_PUBLIC_PUSHER_CLUSTER=your_cluster
```

**Reload the bundler** after changing `.env` (`r` in the Metro terminal, or stop and `npx expo start` again). Expo embeds `EXPO_PUBLIC_*` at bundle time.

---

## Running the app

Run this first (required for native bindings):

```bash
pnpm prebuild --clean
```

### Start Metro (development server)

```bash
pnpm start
# or: npx expo start
```

From the Expo CLI UI you can:

- Press **`i`** — iOS simulator (macOS + Xcode).
- Press **`a`** — Android emulator or device.
- Scan the QR code with **Expo Go** (same Wi‑Fi as your computer, unless using tunnel).

### Platform-specific runs (after native projects exist)

If you have run `expo prebuild` and committed generated `ios`/`android` (this repo may gitignore them—check `.gitignore`):

```bash
pnpm ios
pnpm android
```

Otherwise, **Expo Go** or **development builds** are the typical paths during early development.

### Web (experimental / limited)

```bash
pnpm web
```

Not all native modules (e.g. some audio/video stacks) behave identically on web.

---

## Connecting Haven to the backend

1. **Start PostgreSQL and the API** using the steps in `havens-backend/README.md`.
2. **Run migrations** (and optional seeds) so the database has schema and data.
3. Set **`EXPO_PUBLIC_API_URL`** to a URL the **phone or emulator** can reach:
   - **iOS Simulator** on Mac: often `http://localhost:3333` works if the API binds to localhost.
   - **Android emulator**: commonly `http://10.0.2.2:3333` hits the host machine’s localhost (adjust if your API uses another host).
   - **Physical device**: use your computer’s **LAN IP** and ensure the API listens on `0.0.0.0` or that IP (Docker Compose dev usually exposes port `3333`).
4. **Android cleartext**: `app.json` already enables permissive ATS / cleartext for development-style HTTP to local servers. Use **HTTPS** in production.

### Health check

With the API up, you should be able to open (in a browser or `curl`):

`GET http://<host>:3333/` — the API returns a short JSON status payload.

API routes in code are under prefix **`/api/v1`** (see `constants/api.ts`).

---

## Project layout (high level)

| Path | Role |
|------|------|
| `app/` | **expo-router** file-based routes: `(auth)`, `(tabs)` (client), `(therapist-tabs)`, `(therapist-settings)`, `(therapist-sessions)`, etc. |
| `components/` | Shared UI (auth modals, chat, Gluestack blocks). |
| `constants/` | API endpoints, tab bar helpers (`therapistTabBar.ts`). |
| `contexts/` | React context (e.g. conversation). |
| `hooks/` | Data fetching (e.g. React Query + therapist APIs). |
| `screens/` | Larger screen compositions referenced from routes. |
| `services/` | API clients (`api/client.ts`, `therapist/*`, `therapistMessages`, etc.). |
| `store/` | Zustand stores (auth, UI alerts). |
| `types/` | Shared TypeScript types. |
| `prd/` | Product requirements (reference only). |

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Expo / Metro. |
| `pnpm ios` / `pnpm android` | Run native projects (when generated). |
| `pnpm prebuild` | Generate `ios` / `android` with Expo prebuild. |
| `pnpm lint` | ESLint + Prettier check. |
| `pnpm format` | ESLint fix + Prettier write. |
| `pnpm web` | Start web target. |

---

## Native capabilities and third-party services

These features expect backend or vendor configuration:

- **Video sessions** — VideoSDK-related env on the **server** (`VIDEO_SDK_*`). The app uses `@videosdk.live/react-native-sdk`.
- **OAuth (Google / Apple)** — Configure keys in the backend and platform consoles; see backend README and `app.json` (`ios.bundleIdentifier`, `android.package`).
- **Push / realtime** — Pusher keys (client + server alignment).
- **AI voice / STT** — ElevenLabs and related keys on the **server**; the app streams audio per implemented flows.

If something fails silently, check Metro logs, device logs, and that **`EXPO_PUBLIC_API_URL`** matches where the API actually listens.

---

## Troubleshooting

| Symptom | Things to check |
|---------|-----------------|
| **Network request failed / timeout** | Wrong `EXPO_PUBLIC_API_URL`, firewall, API not binding to `0.0.0.0`, or Android emulator using wrong host alias. |
| **401 / logged out unexpectedly** | Token vs role mismatch was addressed with split storage; ensure you are on a recent build. Server token expiry and clock skew on the device. |
| **Cannot reach API from phone** | Use LAN IP, not `localhost`. Same Wi‑Fi; VPN off if it splits interfaces. |
| **Video room fails** | Server `VIDEO_SDK_API_KEY` + `VIDEO_SDK_SECRET` (or token), session still valid, therapist auth. |
| **Metro “Unable to resolve module”** | `pnpm install`, clear cache: `npx expo start -c`. |

---

## License / legal

Refer to your organization’s license for this repository. **Do not commit `.env`** or production secrets.

---

## Related repository

- **API & database:** https://github.com/hycienti/software-prototype-backend — see **`havens-backend/README.md`** for PostgreSQL, migrations, Docker, and all server-side environment variables.
