# Asset provenance — V2

All runtime media and fonts are local. The original source was retrieved and visually inspected on 2026-11-14. V2 derivatives were generated from the same licensed footage, without introducing new unverified stock URLs.

## Pexels

License: https://www.pexels.com/license/ — retrieved successfully; snapshot in `docs/licenses/pexels-license.html`. Free use and modification are allowed. Attribution is appreciated, not required. Identifiable performers must not be represented as endorsing the fictional academy. Faculty photos are explicitly presented as dance studies.

| Local asset | Source |
| --- | --- |
| `public/media/film-hd/001.webp`–`288.webp`, `public/media/film-mobile-24/001.webp`–`288.webp`, both `film-poster*.webp` files | Pexels video 26491560, https://www.pexels.com/video/26491560/ ; downloaded direct source: https://videos.pexels.com/video-files/26491560/11954287_1280_720_24fps.mp4 |
| `public/images/dance.jpg` | Classical studio rehearsal, https://www.pexels.com/photo/8463037/ |
| `public/images/contemporary.jpg` | Contemporary dancer, https://www.pexels.com/photo/1701208/ |
| `public/images/urban.jpg` | Urban group, https://www.pexels.com/photo/8973450/ |
| `public/images/ensemble.jpg` | Ensemble performance, https://www.pexels.com/photo/175658/ |

HD frames are 1280×720 at 24 samples/second for 12 seconds. Mobile frames are 540×960 portrait crops retaining the original 23.976 samples/second, generated with `crop=406:720:(iw-406)/2:0,scale=540:960`. No rotation of the filmed dancer, synthetic choreography, alpha extraction or jump is claimed. The first-frame posters match the footage instead of showing a different point in the clip.

Actual neighbouring decoded frames are composited with `screen` blending during the motion-echo transition. These are photographic afterimages, not isolated alpha silhouettes. Geometric stage/fabric effects belong to the environment layer.

No full sequence download blocks entry. Desktop and mobile prefetch the displayed neighbourhood, directional lookahead and latest target with four and three requests respectively. Decoded ImageBitmaps are capped at 20 desktop (about 70 MiB of RGBA pixels), 12 mobile (about 24 MiB), explicitly closed on eviction and unmount. Stale fetches are cancelled. Compressed assets use HTTP caching. Missing frames preserve the nearest decoded image or poster.

## Fonts

Barlow Condensed and DM Sans, locally hosted in `public/fonts/`, downloaded from Google Fonts. SIL Open Font License texts are included in `docs/licenses/`. Italics use the device’s Georgia serif.

No additional asset is required to run the demonstration. A bespoke film and authentic faculty portraits would be production identity improvements, not missing demo dependencies.

The media-only smoothing patch is documented in `docs/VIDEO-SCROLL-FIX.md`. Both current variants contain 288 real samples; the old half-rate mobile namespace was removed.
