# أثر القارئ (Reader Impact)

An Arabic-only, RTL, local-first book-reading tracker distributed as an installable Progressive Web App. The project is intentionally a static Vanilla HTML/CSS/JavaScript application: there is no APK, iOS binary, native wrapper, framework, package manager, or cloud dependency.

## Run locally

PWA installation, service workers, notifications, microphone access, and camera access require HTTPS or `localhost`. Do not open `index.html` through `file://` for feature testing.

```powershell
cd readingTracker
python -m http.server 8080
```

Open `http://localhost:8080`.

## Current product structure

The persistent bottom navigation is ordered right-to-left:

1. الرئيسية — Main
2. الجلسات — Sessions
3. مكتبتي — My Library
4. التحليلات — Analytics
5. دليل القارئ — Reader Guide

The previous Study tab and standalone study timer were removed. Offline focus soundscapes remain available inside live reading sessions.

The left sidebar was removed. Settings, notifications, data tools, installation, and About are available through Settings or the three-dot header menu. My Quotes is embedded in the Main tab.

## Features

- Required book title and page count, with optional author, category, current page, and cover.
- Live reading timer with start, pause, resume, finish, reminders, notes, and offline focus sounds.
- Manual session entry using native calendar and time picker controls.
- Manual sessions are labeled `أُضيفت يدويًا` everywhere they are presented.
- Post-reading rating and notes flow with explicit Save or Discard choices. A saved session becomes permanent and has no delete action.
- Per-session and whole-book average time per page.
- Personal pace classification based on standard deviation rather than percentage:
  - At most 100 historical sessions: the latest 20 valid sessions are sampled.
  - More than 100 historical sessions: the latest 20% are sampled.
  - At least five earlier valid sessions are required before pace classification.
- Eight supportive Arabic messages for faster-than-usual pace and eight for slower-than-usual pace.
- Full book detail and session history, including start/end pages, timestamp, duration, time per page, notes, manual label, and session-linked quotes.
- Rich quotes that may contain text, one image, and one audio clip together.
- In-session camera with pinch-to-zoom and tap-to-focus where exposed by the browser, plus a native camera/file fallback.
- Approximately 20 locally calculated achievements. All locked and unlocked achievements appear in Analytics. Newly unlocked achievements are celebrated only after a session is saved.
- Daily and weekly goals, streaks, reading reports, time-of-day analysis, session-length analysis, focus ratings, and book summaries.
- Article read-state checkmarks persisted locally for each article.
- Article source data remains in code for editorial traceability but is hidden from the user interface.
- CSV export plus complete JSON backup/restore, including quote media.
- Fully local storage: lightweight data in `localStorage`, quote media in IndexedDB.
- Offline app shell through the service worker after the first successful HTTPS/localhost load.

## PWA installation lifecycle

The Download App action appears on Main and in Settings before installation. It is intentionally absent from the header.

- Chromium browsers use `beforeinstallprompt` when available.
- `appinstalled` records successful installation.
- Accepted install prompts are saved as a fallback because `appinstalled` is not universal.
- Standalone display mode (`display-mode: standalone` or iOS `navigator.standalone`) is checked whenever the app starts or returns to the foreground.
- Once installed, Main hides its download card. Settings replaces its button with `تم تحميل التطبيق`.
- Safari users may need Share → Add to Home Screen because iOS does not expose Chromium's install prompt.

## Camera compatibility

The camera uses `getUserMedia`, touch handlers, canvas capture, and media-track constraints. Pinch zoom is applied only when the camera track reports a zoom capability. Tap-to-focus requests a point of interest and single-shot focus where supported; otherwise the browser continues managing focus automatically. File input with `capture="environment"` remains available on every device.

Desktop/headless and responsive browser tests can verify UI behavior, fallbacks, and error handling. Camera feel and installed-home-screen behavior must also be accepted on physical Android and iOS devices because browser/device camera capabilities cannot be reproduced faithfully through desktop emulation.

## Single-source app identity

[`app.config.json`](app.config.json) is the single source of truth for the app name, description, colors, storage key, export identity, and feature flags. After changing it, run:

```powershell
node scripts/sync-app-config.mjs
```

The script regenerates `app-config.js` and synchronizes the static manifest and HTML metadata. The generated files remain committed so GitHub Pages can host the project without a build step.

Legacy `midad` storage and backup identifiers are accepted only for backward-compatible migration. They are not user-facing branding.

## Article picture prompts

[`picture_prompts/`](picture_prompts/) contains one OpenAI ImageGen prompt for each current Reader Guide article. Every prompt:

- Is shorter than 2,000 characters.
- Reflects its article's specific subject and mood.
- Uses the real application palette from CSS: `#821b20`, `#b92b31`, `#fbc23a`, `#f6f2ef`, `#62616a`, and `#18181b`.
- Specifies RTL-aware composition, lighting, subject, style, and exclusions.

When articles are added or substantially rewritten, add or update the matching prompt file.

## Offline boundaries

Books, sessions, reports, achievements, article read-state, local quotes, generated focus sounds, and cached interface files work offline after the first complete load. External research links, future authentication, future cloud synchronization, and any future live advertising require a connection.

## Future Upgrades

### Advertising

The post-session advertising interstitial is disabled through the `postSessionAds` feature flag rather than deleted. A future monetization phase may restore one controlled post-session placement with privacy, consent, frequency limits, and institutional-account rules.

### Accounts and cloud synchronization

A future phase may add Google/Microsoft authentication and Supabase synchronization. It must remain local-first, include conflict handling, enforce Row Level Security, and verify institutional email-domain benefits on the server.

### Native shell, widgets, and outside-session controls

This project has no native wrapper today. True Android/iOS home-screen widgets and a persistent pause/play notification outside the reading screen are not possible purely in the current web codebase.

Those capabilities require a distinct future native-shell phase, such as wrapping the PWA with Capacitor and writing real platform code:

- Android: an App Widget plus a foreground-service notification plugin implemented in Kotlin/Java.
- iOS: a WidgetKit extension plus Live Activities/ActivityKit implemented in Swift.
- iOS distribution and Live Activities also require Apple Developer Program membership.

No native build tooling should be introduced into this repository unless that future phase is explicitly approved.

## Deployment

GitHub Pages can host the static files. A dedicated subdomain such as `read.a-a.education` remains preferable because it isolates service-worker scope and PWA routing while keeping the institutional identity.

All committed assets should remain small. User-created covers, photos, and audio stay in browser storage and are never written into the Git repository.
