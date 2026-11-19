## Revisione superficie WebGL — 19 novembre 2026

Apertura fotografica con progetti originali, hero VÉRA e marchio senza asterischi. Rimossi scenografia tropicale generata e bagliori dalla nuova apertura. Nuovo WarpPreview.tsx: singola superficie WebGL deformata con GLSL, passaggi tra texture allo scroll e trascinamento con ripristino. Caricamento differito, DPR limitato, sospensione fuori vista, fallback HTML e movimento ridotto. Tutti i 13 progetti, demo e backend esistenti conservati.

Build statica con /one-man e cinque test Chromium superati, incluso renderer WebGL, touch CDP, menu, iframe controllato, audit axe, intro/skip/replay, cinque viewport e WebGL negato. Safari e dispositivi fisici non collaudati. Memoria sessione one-man-cinema-surface; ?intro=1 per rivedere l’apertura. Sorgente aggiornato in one-man-source.zip.

---

## Aggiornamento neon tropicale — 19 novembre 2026

Nuova scena originale in /one-man/assets/one-man-neon.webp (circa 208 KiB), condivisa da intro e hero. Tipografia inclinata, rosa/turchese, dettagli Art Déco e palme; cornici delle anteprime aggiornate. Tutti i 13 progetti correnti sono preservati, incluso il progetto ospitalità aggiunto successivamente, con iframe relativi allo stesso dominio. Gli altri siti e backend non vengono modificati.

?intro=1 forza la riproduzione dell’apertura, salvo reduced motion. Nuova chiave sessione one-man-cinema-neon. Script per registrare una presentazione verticale senza audio: node scripts/capture-opening.mjs (richiede Playwright e ffmpeg).

TypeScript, lint, build statica e quattro scenari Chromium superati sull’export con prefisso /one-man: progetti/menu/dettaglio, touch, accessibilità, intro/replay e cinque viewport. Telefoni fisici e Safari non collaudati. Nessuna garanzia di viralità. Il sorgente aggiornato è in one-man-source.zip.

---

# ONE MAN — Portfolio cinematografico

Pubblicazione: https://www.salvatorecannavale.it/ — repository Sasy130/salvatore-cannavale-portfolio.

La homepage in public/one-man/index.html conserva il rewrite esistente. Le altre demo non sono state sostituite. Il sorgente Next.js modificabile è in one-man-source.zip. Dopo estrazione: npm ci, npm run dev.

## Contenuti e build

I 13 progetti originali sono configurati in lib/restored-projects.ts; email e biografia in lib/portfolio-data.ts. La precedente galleria rimane su /one-man/mostra.html. Per costruire l’export del dominio:

NEXT_PUBLIC_ASSET_BASE=/one-man NEXT_PUBLIC_SITE_URL=https://www.salvatorecannavale.it npm run build:static

Copiare out/ in public/one-man/ preservando gli altri file. Non copiare .next o credenziali.

## Esperienza

Scroll nativo con composizione CSS 3D animata da GSAP, 13 copertine originali, indice completo, vista essenziale, controllo touch elastico, menu editoriale a pieno schermo, scheda progetto con copertina e un iframe interattivo alla volta. Riduzione del movimento, focus nativo del dialogo e chiusura Esc.

## Verifica

TypeScript, lint e build superati. Quattro scenari Playwright superati anche sull’export con prefisso /one-man: progetti/menu/dettaglio, touch mobile, movimento ridotto/audit axe, intro/replay/cinque viewport. Il test touch è stato ripetuto due volte. Nessuna violazione axe negli scenari controllati. I test dell’iframe usano una risposta simulata per verificarne il collegamento; i 12 siti originali sono stati verificati separatamente via HTTP. Safari e telefoni fisici ancora da collaudare. Le schermate mobile sono state ispezionate.

CASA MIA aggiunta alla raccolta: apertura e iframe puntano a `/demos/dimora-mia/`, sullo stesso dominio. La copia è una simulazione locale, con font e asset locali; sorgenti e limiti in `demo-sources/dimora-mia/PORTFOLIO.md`.
