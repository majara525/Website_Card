# AdWatch — شاهد الإعلان

AdWatch is a production-oriented, Arabic-first mobile web learning app for Al-Ma'had Al-Aali's College of Communication, Public Relations & Advertising. It combines an ad-discovery feed, guided targeting analysis, 15 long-form editorial lessons, and quiz-gated progress in a responsive installable PWA.

All shipped UI and learning content is Arabic and RTL. This README is intentionally English for the development team.

## Quick start

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

For a production check:

```bash
npm run typecheck
npm run validate:data
npm run build
npm run preview
```

Vite prints the local URL. The PWA service worker is registered by the app and is most representative in a production build served over HTTPS or localhost.

## Product routes

- `/home` — student home feed, categories, playable-ad demos, Ad of the Week, Brand Spotlight and targeting explorer.
- `/articles` — all 15 articles, search, category/tag filters and persisted completion state.
- `/articles/:slug` — Markdown article and its three-question completion quiz.
- `/about` — product background and Al-Ma'had Al-Aali contact details.
- `/welcome` — Microsoft 365 onboarding interaction stub.
- `/campaign-analyzer` — read-only future ad-account connection concept.
- `/dev/instructor` — intentionally hidden, read-only mock instructor dashboard. It is not linked from the student tab bar.

The bottom navigation has exactly two student tabs and remains fixed throughout the routed application.

## Architecture

```text
src/
  components/       Reusable shell, cards, sheets, quiz, targeting and stub UI
  data/             Local JSON records: 30 ads and 15 full articles
  pages/            Lazy-loaded route screens
  services/         Typed interfaces and local/mock implementations
  store/            Zustand state with a persisted local-storage subset
  types/            Shared domain types
public/
  manifest.webmanifest
  sw.js             Offline shell/runtime asset cache
  app-icon.svg
```

Routes are code-split with `React.lazy`. Article Markdown is rendered with `react-markdown` and `remark-gfm`. The UI uses Tailwind plus a CSS-variable light/dark token layer. Cairo is shipped from `@fontsource/cairo`, so Arabic typography does not depend on Google Fonts being reachable at runtime.

### Design system

- Primary: violet (`#6d3df5`), secondary: teal, accent: coral.
- Semantic success, warning and error tokens are defined for both light and dark themes.
- Cairo type scale, an 8px spacing rhythm, three elevation levels, and 16–32px radius families.
- Framer Motion handles route/sheet transitions, press feedback, progress, completion checks and confetti.
- Reduced-motion preferences are respected by CSS.
- Icon-only actions have Arabic `aria-label` values, focus rings are visible, and content uses semantic landmarks.

## Data and state

`src/data/ads.json` contains 30 mock ads with the required targeting fields. The image URLs point to a lightweight local SVG poster so the demo works offline and the repository stays small.

`src/data/articles.json` contains exactly 15 full Arabic articles (each 900–1,800 words), each with exactly three multiple-choice questions, answer explanations and one correct option.

The service layer keeps data access out of components:

- `ArticleService` and `AdService` currently use local JSON and small simulated latency for skeleton states.
- A backend implementation can replace either interface without changing cards or pages.
- Completion, correctly answered question IDs, theme, notification preference and demo premium unlocks are persisted by Zustand in local storage under `adwatch-state-v1`.

An article is completed only when all three unique question IDs are correct. Incorrect answers remain immediately retryable. No manual “mark as read” path exists.

## Future API boundaries

### Ad targeting

`src/services/AdTargetingProvider.ts` defines `AdTargetingProvider` and returns local mock targeting today. A server-backed provider can later normalize:

- Meta Ad Library API `ads_archive` responses.
- TikTok Commercial Content Library API responses.

Credentials must stay on a server. The client should receive a normalized `TargetingSnapshot`; no platform token should ever be included in the Vite bundle.

The learning note in the targeting explorer explicitly distinguishes mock data from targeting detail publicly disclosed for EU/UK ads under ad-repository requirements and Meta political/social-issue ads.

### Campaign analytics

`src/services/CampaignAnalyticsProvider.ts` defines a read-only seam for a future Meta Marketing API or Google Ads API integration. The current implementation returns no connection and makes no external calls. OAuth exchange, refresh tokens and account access must be server-side.

### Microsoft 365 and instructor data

The Microsoft button is a visual interaction stub only. A real implementation should use an institution-managed Microsoft identity application, authorization-code flow with PKCE, server-side role mapping and clear session expiry. The instructor dashboard uses static roster data and has no authorization or personal data.

## PWA and offline behavior

- `manifest.webmanifest` sets Arabic/RTL metadata, standalone display, theme/background colors, icon and shortcuts.
- `sw.js` precaches the app shell and caches same-origin runtime assets. Navigation falls back to the cached SPA entry while offline.
- The initial HTML includes a branded launch/splash state before React mounts.
- The icon is an original lightweight maskable SVG. For an eventual iOS store/Capacitor package, generate platform-specific raster icon and splash sets from the SVG.

When the app is deployed below a subpath, update Vite's `base`, the manifest `start_url`/`scope`, and service-worker shell paths together. Static hosts must rewrite client-side routes to `index.html`.

## Monetization placeholders and policy guardrail

`MonetizationPlaceholders.tsx` contains:

- A responsive banner slot placeholder on Home.
- A visually distinct sponsored Brand Spotlight card.
- A demo rewarded-content gate on two premium articles.
- A commented playable-ad integration seam.

There are no live SDK calls. A real AdMob rewarded unit must offer only disclosed, non-transferable in-app rewards such as content or badges. Cash, cryptocurrency, gift cards or other transferable rewards must never be offered.

## GitHub upload — what to upload

Create a repository and upload the contents of this `ads` folder, including:

- `src/` — all app code and both JSON data files.
- `public/` — manifest, service worker and lightweight visual assets.
- `index.html`.
- `package.json` and `package-lock.json`.
- `vite.config.ts`, all `tsconfig*.json`, `tailwind.config.js`, and `postcss.config.js`.
- `.gitignore` and this `README.md`.

Do **not** upload:

- `node_modules/` — reconstructed with `npm install` and usually far too large.
- `dist/` — generated with `npm run build`; publish it as a deployment artifact only if your host explicitly needs it.
- `.vite/`, logs, OS metadata, or editor caches.
- `.env` files, API keys, tokens or credentials. Only a safe `.env.example` should ever be committed if environment variables are introduced.

Every source asset in this project is intentionally far below GitHub's requested 20MB per-file ceiling. The largest-file audit command used before handoff is documented below:

```powershell
Get-ChildItem -File -Recurse | Where-Object { $_.FullName -notmatch 'node_modules|dist' } |
  Sort-Object Length -Descending | Select-Object -First 20 FullName, Length
```

## Project Status & Next Steps

### Fully implemented and working

- Responsive RTL shell, sticky header, fixed two-tab navigation and global institute footer strip.
- Premium light/dark design system, local Cairo font, motion, skeletons, empty/error states and accessibility basics.
- Home feed with 30 local mock ads, eight category filters, playable demos, editorial Ad of the Week, banner placeholder and sponsored Brand Spotlight.
- Ad detail modal and mock targeting explorer with age, gender, locations and public-disclosure explainer.
- Exactly 15 full Arabic articles with category/tag filtering and search.
- Exactly three quiz questions per article, inline retry/feedback, persisted correct answers, strictly quiz-gated completion and completion celebration.
- Installable PWA structure and offline app-shell/runtime caching.
- About/contact screen and responsive not-found state.

### Intentionally stubbed

- Meta/TikTok targeting uses mock JSON through `AdTargetingProvider`; no external request is made.
- Microsoft 365 button has interaction feedback but no OAuth.
- Instructor dashboard is a read-only static demo without auth, roles or a backend.
- Campaign Analyzer has a typed service boundary and “Coming soon” UI but no account connection.
- Banner, rewarded, playable and sponsored ad surfaces have no live monetization SDK.
- Notifications toggle is a persisted UI preference only.

### Concrete next steps

1. Build a secure backend and wire Meta Ad Library `ads_archive` into `AdTargetingProvider` where data is legally/publicly available.
2. Wire TikTok Commercial Content Library responses into the same normalized provider.
3. Register the institutional Microsoft identity app and implement real Microsoft 365 OAuth, session handling and logout.
4. Add instructor/student auth, role authorization, course membership, consent and a real progress database.
5. Connect read-only Meta/Google Ads OAuth and metrics to `CampaignAnalyticsProvider` through the backend.
6. Replace monetization placeholders with policy-reviewed native/Capacitor SDK components and real consent handling.
7. Add Web Push (or native push after Capacitor) behind an explicit permission flow.
8. Generate Android/iOS raster icon and splash catalogs, add Capacitor, and run store-specific accessibility/privacy reviews.
9. Add automated unit tests for completion state and filters, component tests for sheets/quiz retry, and Playwright mobile flows.
10. Add a CI workflow that runs type-check, build, tests, bundle-size limits and Lighthouse PWA/accessibility audits.

## Final QA checklist

- Verify Arabic direction and punctuation on a 320px viewport and a tablet viewport.
- Confirm no article list check appears until all three questions are correct.
- Reload after completion and confirm progress persists.
- Try a wrong answer, then retry immediately and verify the explanation updates.
- Confirm the search/filter controls appear only on `/articles`.
- Toggle dark mode and inspect every sheet, modal, card, quiz state and stub screen.
- Navigate long articles and confirm the footer/tab bars remain fixed without covering content.
- Build and run a Lighthouse mobile audit over HTTPS/localhost.
