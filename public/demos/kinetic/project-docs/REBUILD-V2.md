# KÍNETIC — Cinematic rebuild V2

## Audit and correction

V1 already rendered a real WebP sequence to canvas; it was not an autoplay video. The observed limitations were architectural:

1. `motion.progress / .52` exhausted the sequence in the first half of the short opening scroll span. The rest of the home used unrelated vertical sections.
2. The frame player consumed raw ScrollTrigger progress while the typography/occlusion timeline had `scrub: 1`. Lenis added its own inertia. ScrollTrigger and Lenis were connected, but the displayed layers did not share the same eased playhead.
3. The sequence sampled the clip at only 12 fps on desktop; a bounded nearest-frame fallback could visibly hold a stale image after a large seek.
4. Hero, manifesto, courses, artists and events used separate layouts rather than a persistent stage.

V2 replaces that architecture with one native-scroll GSAP timeline, `scrub: true`, covering all six acts. It emits one normalized playhead to the canvas, typography, masks, WebGL surface, camera and scenic floor. Lenis is deliberately not used on this film, avoiding competing interpolation. The canvas maps the shared playhead to `round(min(1,p/.92)*(count-1))`.

The media player requests the target frame first, then neighbours. AbortController cancels obsolete requests, ImageBitmap decode runs asynchronously, and explicit bitmap eviction bounds memory. A decoded exact target replaces the nearest-frame fallback as soon as available. Playback is event-driven rather than an always-running player loop. Actual canvas pixels are checked for advance, stillness and exact reverse return.

## Direction and transitions

One CSS sticky fullscreen stage runs for 1000svh on desktop and 900svh on mobile; it never traps wheel/touch scrolling. Chapter buttons jump to fully formed reading poses rather than the middle of a transition. Direct commercial routes and the film bypass remain available.

| Transition | Global progress | Observed source cue and treatment |
| --- | --- | --- |
| Body to typography | .032–.18 | Opening movement and turn; monumental logo letters separate while outlined typography crosses the same stage. |
| Fabric portal | .16–.286 | Turn/skirt motion near clip seconds 2–3; sweeping red occlusion becomes a folded GLSL surface with a camera approach and manifesto reveal. |
| Stage collapse | .30–.425 | Real forward fold/descent near seconds 4–5; geometric floor overlay breaks into tiles and opens the discipline environment. |
| Motion echo | .525–.64 | Real rise near second 7; neighbouring frames form afterimages, which connect to photographic windows and faculty scenography. |
| Image aperture | .724–.818 | Faculty frames relinquish the stage to a growing ensemble photograph, preserving the stage/composition between acts. |
| Light explosion | .868–.974 | Real final arm opening near seconds 11–12; expanding ivory light reveals the invitation and trial CTA. |

Source cues were manually inspected in a twelve-frame contact sheet. They are editorial cue points, not pose detection. No jump, alpha silhouette, artificial 3D dancer rotation or physical reconstruction of the original stage is claimed. The film is a twelve-second stock performance, retimed spatially by scroll.

## Commercial and visual changes

- Six acts replace the former home’s independent sections.
- Monumental condensed logo/word planes, serif counterpoint, photographic windows, stage coordinates, a six-step rail and persistent progress line form one identity.
- Classical, contemporary and urban selection updates photography, environment tone, level, schedule and course/trial links without reloading.
- Artists use an asymmetric theatrical arrangement, retaining explicit illustrative-profile disclosure.
- Events remain readable with working program links; the final CTA opens the validated demo form.
- Header, fullscreen menu, page titles, course hover treatments and footer are refined. Trailing-slash routes retain the correct light-page header contrast.
- Reading-pose navigation, artist caption positions and overlapping course descriptions were corrected after visual inspection, beyond the functional assertions.

## Accessibility and resilience

Inactive directed panels are inert and aria-hidden. Chapter navigation, arrow/Home/End discipline tabs, visible focus, native dialog Escape/focus return and direct routes are available. Reduced-motion and no-JavaScript baselines show all six acts as ordinary readable content. The short intro can be skipped and automatically dismisses on wheel, touch or keyboard input.

Mobile receives a portrait sequence, different compositions, fewer decoded frames and no WebGL. Desktop WebGL uses demand rendering, a DPR cap of 1.25 and a failure boundary; CSS occlusion/floor/light fallbacks retain the complete story. Frame/player subscriptions, fetches, bitmaps, timelines, listeners and diagnostic RAFs are cleaned up.

Development or `?debug=1` exposes chapter, playhead, desired/rendered frame, bounded cache, pending requests, frame errors, observed cue and sampled rAF cadence. Diagnostic rAF runs only when that panel is enabled; this is not a claim about production Core Web Vitals or device GPU throughput.

## Verification

See `VERIFICATION.md` for the final run. Browser assertions exercise real exported pages and canvas pixels, not just mocked progress values. Desktop/mobile screenshots are retained in local `artifacts/`.

The first browser run caught the director reading a parent ref before it had been attached. The director was moved into the owning component’s layout hook and the tests rerun. This initialization defect was fixed before publication. Visual review then corrected chapter jump targets, mobile framing, unwanted blend colors and faculty caption positions.

## Remaining limits

This is a fictional commercial demo. There is no live booking backend; successful validation does not claim transmission or reservation. Stock photography illustrates disciplines, not the named faculty. Asset failure uses a photographic fallback rather than inventing unavailable motion. Browser QA uses Chromium and emulated mobile screens; real-device Safari/Firefox and measured Core Web Vitals remain separate production checks. No award, certification or client result is claimed.
