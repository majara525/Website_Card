# Athar Al-Qari Development Tracker

Last updated: 2026-08-08

This document is the maintained implementation record for the Arabic-only RTL PWA **أثر القارئ**.

## Product constraints

- Distribution: installable PWA / Add to Home Screen only.
- Runtime: static Vanilla HTML, CSS, and JavaScript.
- Persistence: localStorage plus IndexedDB.
- No APK, native iOS application, Capacitor wrapper, paywall, or cloud dependency in the current phase.
- User-facing copy is Arabic. Development documentation is English.

## Implemented scope

| ID | Area | Status | Notes |
|---|---|---|---|
| CONFIG-001 | Single-source application identity | Complete | `app.config.json` plus synchronization script |
| BRAND-003 | Rename to أثر القارئ | Complete | Manifest, metadata, runtime UI, About, exports, and docs |
| NAV-001 | Remove left sidebar | Complete | No sidebar HTML or JavaScript remains |
| NAV-002 | Five-item bottom navigation | Complete | Main, Sessions, Library, Analytics, Reader Guide |
| HEADER-001 | Dark-red header variable | Complete | `--color-header` |
| HEADER-002 | Brand, connection status, three-dot menu | Complete | Green online; yellow degraded/offline |
| INSTALL-001 | Main and Settings installation actions | Complete | Header action removed |
| INSTALL-002 | Installed-state lifecycle | Complete | Prompt, event, accepted-choice flag, standalone detection |
| INSTALL-003 | Installed Settings confirmation | Complete | Displays `تم تحميل التطبيق` |
| STUDY-REMOVAL | Remove standalone Study system | Complete | Timer, fullscreen, wake-lock, and guidance removed |
| AUDIO-002 | Preserve focus sounds in reading sessions | Complete | Three locally generated soundscapes |
| SESSION-001 | Live reading session | Complete | Start, pause, resume, finish, reminders, notes |
| SESSION-002 | Manual session entry | Complete | Native date/time controls and mandatory page range |
| SESSION-003 | Manual-entry labeling | Complete | Sessions, book detail, post result, and analytics |
| SESSION-004 | Save-or-discard finish gate | Complete | No session delete action after save |
| SESSION-005 | Post-session pace statistics | Complete | Session and weighted book average seconds/page |
| SESSION-006 | Adaptive personal pace | Complete | Latest 20 or latest 20%; standard-deviation classification |
| SESSION-007 | Encouragement bank | Complete | Eight faster and eight slower supportive messages |
| SESSION-008 | Global Sessions history | Complete | Live timer, manual entry, history, CSV export |
| BOOK-004 | Full book session history | Complete | Timestamp, pages, duration, pace, notes, linked quotes |
| QUOTE-004 | Quotes embedded in Main | Complete | Search, filtering, creation, and media retained |
| QUOTE-005 | Rich combined quote | Complete | Text plus optional image and optional audio |
| QUOTE-006 | Session-linked quotes | Complete | Quote records store the active session ID |
| CAMERA-001 | In-app camera | Complete in code | getUserMedia, canvas capture, front/rear switching |
| CAMERA-002 | Pinch zoom and tap focus | Complete with progressive enhancement | Physical Android acceptance pending |
| ACHIEVE-001 | Twenty achievements | Complete | Streak, page, time, session, quote, manual/tracked, book milestones |
| ACHIEVE-002 | Analytics achievement catalog | Complete | Locked and unlocked states shown |
| ACHIEVE-003 | Post-session-only celebration | Complete | No popup on load, start, active session, or other screens |
| ARTICLE-001 | Persistent article read state | Complete | Local per-article checkmark |
| ARTICLE-002 | Hide displayed source lists | Complete | Source objects remain in article data |
| PROMPT-001 | OpenAI ImageGen article prompts | Complete | Six prompts, each below 2,000 characters |
| ADS-002 | Disable post-session ad | Complete | Preserved behind `postSessionAds` feature flag |
| DOCS-001 | English development documentation | Complete | README and tracker rewritten |
| PWA-001 | Offline app shell | Complete | Service worker cache includes app configuration |
| DATA-004 | Backward-compatible rename migration | Complete | Legacy state and backup identifiers remain importable |

## Pace-analysis decision

Only sessions with positive duration and a positive page difference qualify. The current session is compared with earlier valid sessions for the same book:

- Five or more earlier valid sessions are required.
- With 100 or fewer historical sessions, use the latest 20 or all available if fewer.
- With more than 100 historical sessions, use the latest 20%.
- Faster/slower classification uses one historical standard deviation around the sample mean; no percentage deviation threshold is used.

## Physical-device QA still required

- Android Chrome installed-PWA installation and installed-state transition.
- Android camera permission, rear/front switching, pinch zoom, tap focus, capture quality, and fallback file picker.
- iOS Safari Add to Home Screen, standalone detection, microphone, camera, and supported gesture behavior.
- Confirm that device-specific camera limitations produce a clear fallback rather than a broken flow.

## Automated QA completed

The 2026-08-07 browser regression pass completed with zero runtime errors. It covered desktop and 390 px mobile layouts, live and manual sessions, the save/discard gate, post-session-only achievements, rich quote image/audio rendering, book history, native date/time input types, article read persistence, install-state UI, service-worker reload after the local server stopped, preservation of local session data while offline, and a 504 response for an uncached offline request.

The 2026-08-08 responsive regression pass covered all six application screens at 280, 320, 360, 375, 390, 412, 430, 480, 540, 667, 740, and 844 px. All 72 cases passed with the bottom navigation centered inside the viewport, document and body widths contained, and no visible element crossing a screen edge. The conflicting RTL fixed-navigation offsets were removed, narrow timer grids now shrink correctly, and mobile filters/charts no longer require sideways scrolling.

## Future phases

- Optional Supabase accounts and local-first synchronization.
- Feature-flagged monetization design.
- A separately approved native shell for true widgets, Android foreground-service controls, iOS WidgetKit, and Live Activities.

## Change log

| Date | Version | Summary |
|---|---|---|
| 2026-07-28 | 0.1.0 | Initial local-first Arabic reading tracker |
| 2026-07-28 | 0.2.0 | Forms identity, reports, articles, Study mode, and responsive QA |
| 2026-07-28 | 0.3.0 | Offline focus sounds and offline-reload validation |
| 2026-08-07 | 0.4.0 | Athar Al-Qari rename, premium navigation, session redesign, rich quotes/camera, achievements, install lifecycle, prompts, and English docs |
| 2026-08-08 | 0.4.1 | Corrected RTL phone navigation positioning and removed narrow-screen horizontal overflow |
