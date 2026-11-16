# KÍNETIC — media-only scroll smoothing

## Scope

Production changes are limited to `components/film/FramePlayer.tsx`, `lib/sequence.ts`, new `lib/playhead.ts`, and the mobile frame assets. The approved CSS, layout, typography, colors, scene timings, GSAP master timeline, WebGL, navigation and commercial functions are unchanged. This was checked with a Git diff against the published V2 commit.

## Cause

The player already used Canvas/ImageBitmap frames; there was no `video.currentTime`, autoplay player, seek queue or active Lenis instance. A single ScrollTrigger supplies the existing GSAP master progress. Its `scrub: true`, duration and scene choreography are retained.

The old player rounded that raw progress directly to an image index and painted only on scroll/load notifications. A discrete wheel input therefore moved several source frames in one paint. The former global nearest-frame fallback could also choose a frame ahead of the requested position and then paint an older frame when it finished decoding. Small symmetric preload windows and cancellation around only the final target made intermediate playback less resilient to cold/slow loads. Mobile additionally sampled only half the source frames.

## Chosen solution

- Keep the full-precision GSAP target, a separate displayed media playhead, and the last actually rendered source index.
- Use one gated RAF chain for video convergence, not one loop per wheel event. No React state changes per frame.
- Apply time-based exponential interpolation to the media only: 45ms response for ordinary movement, 30ms for large seeks, without overshoot. Reach the exact target after at most 140ms from the latest sampled target when assets are ready; stop scheduling convergence frames at rest. This is a short media catch-up, not a change to approved scene animation timing.
- Prefetch the displayed neighbourhood, directional lookahead and the exact latest destination. Protect destination requests while cancelling obsolete work. Desktop has four active requests and at most 20 decoded bitmaps; mobile has three requests and at most 12. Eviction/unmount explicitly close ImageBitmaps.
- Never paint a future cached sample and then backtrack during a forward gesture. On a miss, hold the existing valid canvas pixels. Resize the surface only once the replacement variant's frame is decoded, in the same paint as drawImage.
- Use 288 genuine source samples on both devices. The mobile variant keeps the approved portrait crop and resolution (540×960), but now retains the original cadence. Its new `film-mobile-24` URL namespace prevents a stale HTTP cache from mixing old half-rate files with the new sequence.
- No frame blending, optical-flow invention, duplicated intermediate assets, added blur or CSS animation is used to disguise motion. Existing approved motion-echo compositing remains intact.

## Source and alternative

FFprobe measured H.264, 1280×720, 24000/1001 fps (23.976), 44.669625 seconds in the licensed original. The used opening clip contains 288 decoded frames with no duplicate raw-frame hashes. The original keyframe interval is approximately 10.427 seconds. Those dependencies would matter for native repeated video seeks; they are not the cause of this Canvas player's stutter.

| Option | Evidence / tradeoff |
| --- | --- |
| Existing long-GOP MP4 seeking | Approximately 10.4-second keyframe gaps; native seek completion is asynchronous and browser-dependent. Not used by the site. |
| Re-encoded 12-second all-intra H.264 | An actual offline encode with `-g 1 -crf 20` was approximately 8.5 MiB. It improves random access but still requires native seek serialization and browser-specific presentation timing. It was not deployed. |
| Retained Canvas sequence | HD assets total 5.23 MiB; the new portrait sequence totals 3.39 MiB. Only a small decoded window is held; individual source indices are deterministic in both directions and no HTMLMediaElement seek queue is needed. |

The new mobile files were extracted from the original without an FPS-upconversion filter. All 288 desktop and 288 mobile asset hashes are distinct. The existing Pexels license and provenance remain applicable; see `ASSETS.md`.

## Before / after profile

Same Chromium headless setup, 1440×900 viewport, warm-up, ten 120px wheel inputs with 100ms requested pauses, followed by settling. Browser automation and software rendering affect actual input cadence; this is a paired local observation, not a field benchmark.

| Measurement | V2 baseline | Media fix |
| --- | ---: | ---: |
| Distinct rendered pose changes | 10 | 27 |
| Mean source-frame step per changed paint | 4.60 | 1.70 |
| Largest forward step | 5 | 3 |
| Unexpected reverse steps | 0 | 0 |
| Final rendered / target index | 46 / 46 | 46 / 46 |
| Peak decoded images | 20 | 20 |
| Observed rAF cadence, mean | 27.2 fps | 28.5 fps |
| Observed rAF interval, P95 | 83.5 ms | 50.1 ms |

Raw traces are retained locally in ignored `artifacts/scrub-before.json` and `artifacts/scrub-after.json`. The important improvement is distributing actual poses across paints instead of presenting one multi-frame jump per wheel pulse. These numbers do not establish 60fps on physical hardware; the profiling browser used software rendering. ImageBitmap pixel memory is outside the JS heap: the 20-HD / 12-mobile decoded-cache budgets remain approximately 70 / 24 MiB, plus transient requests, canvas/GPU surfaces and the rest of the page.

## Tests

`npm run lint`, `npm run typecheck` and the production export passed. **14 tests passed in 35.4 seconds**: the existing eight regression cases plus six targeted smoothing cases.

Coverage includes slow small inputs approximating trackpad scroll, regular wheel pulses, fast seeking, repeated forward/reverse motion, exact rest, return to identical canvas pixels, mid-sequence refresh, desktop/mobile resize, source-rate portrait frames, native Chromium touch swipes in both directions through CDP, delayed delivery, missing samples, cache/request bounds, reduced motion, WebGL fallback, menus, final CTA and commercial form validation. Unit tests establish non-overshooting time-based convergence and safe frame selection when future/late samples arrive.

## Remaining limits

Source motion is 23.976 fps; extremely slow scrubbing still holds each genuine source pose until the next sample. Creating smoother slow-motion footage would require new higher-frame-rate source material, not copied frames. Very large or very fast seeks may skip source samples to keep latency bounded. A network/decode stall can hold the last valid image beyond the filter's convergence budget; it never intentionally paints an empty canvas. The approved GSAP choreography remains immediate, while media catches up over the short response window.

Trackpad-like inputs and touch were emulated in Chromium. Physical trackpads, iOS Safari, Android hardware and sustained real-device performance remain unverified. No claim of perfect device-independent or 60fps playback is made.
