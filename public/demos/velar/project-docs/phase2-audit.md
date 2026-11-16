# VELAR — Fase 2: audit e motion system

## Analisi prima delle modifiche

La Fase 1 usa Next.js App Router, React 19.3 e GSAP. `AnimationController.ts` gestiva un ingrandimento del tavolo e due ScrollTrigger. Non sono presenti Three.js, scene WebGL, modelli PBR o una camera 3D: tutte le chiavi sono illustrazioni SVG, le auto fotografie. Nessuna nuova dipendenza è stata aggiunta nella Fase 2.

Problemi individuati:

- La selezione chiamava `progress(1)` sulla timeline precedente, imponendo il completamento prima del nuovo input.
- Il reveal animava `left`, `top`, `width` e `height`; queste proprietà introducevano layout durante il movimento.
- SVG dello stesso modello nel vault e nel reveal riutilizzavano gli stessi ID dei gradienti.
- Il ritorno dalle schede non conservava esplicitamente selezione, filtro e scroll. Gli effetti della navigazione non consideravano le pagine conservate in memoria da Next.js.
- Il prefetch parziale di Next.js caricava la sola struttura delle schede; questo può impedire il matching di elementi condivisi al cambio pagina.
- Le immagini della scheda usavano `sizes` da card anche nella hero.
- Alcune etichette piccole sul catalogo chiaro avevano contrasto inferiore a 4.5:1.

## Implementazione

### Camera e intro

`src/lib/camera.ts` controlla una camera **planare 2.5D** tramite truck, pedestal, dolly, pitch, yaw e roll. Non simula una rotazione intorno a una fotografia. La scena separa tre livelli: camera dello scroll, rig della selezione, sollevamento della singola chiave. Ogni livello ha un solo proprietario per le sue trasformazioni.

Una sola timeline di cinque secondi governa macro iniziale, movimento laterale, arretramento, orientamento, riflesso sul metallo, impulso del pulsante, riflesso sul tavolo e apertura del quadro completo. Le curve di posizione, orientamento e luce sono distinte. L'ultima posa è quella a riposo della Home, sullo stesso DOM. Skip completa il passaggio di stato e rimuove la timeline; il ridimensionamento durante l'intro porta alla Home senza lasciare una camera fuori asse.

### Scroll e selezione

Il vault usa una timeline ScrollTrigger reversibile e un solo avanzamento normalizzato per movimento della camera, esposizione delle sei chiavi e testo. Scroll nativo, senza pinning, Lenis o listener che impediscano wheel/touch. Su mobile gli spostamenti sono più contenuti. La selezione interrompe il tween precedente e riparte dai valori correnti: nessun completamento forzato. Le altre chiavi rimangono montate e nello stesso spazio.

`MOTION` centralizza durate, easing, ampiezze e scrub. `cinematics.ts` definisce le sei inquadrature, i target desktop/mobile e i parametri per le singole vetture.

### Reveal e navigazione

La chiave condivisa parte dalle dimensioni visive misurate, includendo la rotazione. Il movimento usa transform, non left/top/width/height per frame. Il reveal attraversa focus, connessione, presentazione e assestamento; le CTA vengono abilitate dopo l'assestamento. La fotografia è decodificata prima dell'apertura iniziale; un errore mostra un fallback dichiarato.

La chiusura parte dalla maschera e dalla posa correnti e torna alla chiave attualmente selezionata. Il selettore interno permette di cambiare tutte e sei le vetture senza rimontare la scena. Le richieste di immagini superate vengono invalidate: l'ultima selezione prevale. Le fotografie già visitate sono conservate solo durante la vita del dialog per consentire raccordi continui tra immagini decodificate.

React ViewTransition collega fotografia del catalogo/reveal e hero della scheda. I nomi sono distinti tra fleet e reveal; il prefetch completo e la cache dei contenuti per slug permettono il matching delle pagine pronte. Le animazioni durano 380 ms e non bloccano i click sugli altri contenuti. Dove l'API non è supportata, o il contenuto non è ancora pronto, la navigazione resta funzionante senza garantire il morph.

Il ritorno conserva filtro, selezione e posizione, anche con pagine mantenute in memoria. Gli stati sono controllati dal reducer e dalle politiche in `motion-state.ts`. Il modulo dimostrativo, la validazione e il riepilogo scaricabile della Fase 1 restano operativi. Book Now usa anche la selezione corrente come valore predefinito.

### Materiali e accessibilità

Gradienti SVG con ID univoci per istanza, passaggio luminoso sul metallo e luce riflessa sul piano. Nessun riflesso sintetico aggiunto alla carrozzeria fotografata. Titolo del reveal con maschera discreta; contenuti commerciali leggibili e fermi dopo l'assestamento. Contrasto delle etichette del catalogo portato a circa 4.83:1 sul fondo avorio; etichette chiavi circa 6.12:1 sul centro del tavolo. Focus visibile, pulsanti touch di almeno 44 px dove necessario, Tab/Escape nei dialog e reduced motion.

## File modificati rispetto alla Fase 1

- `src/app/layout.tsx`
- `src/app/collection/[slug]/page.tsx`
- `src/app/motion.css` — nuovo
- `src/components/AnimationController.ts`
- `src/components/HomeExperience.tsx`
- `src/components/CarReveal.tsx`
- `src/components/DetailExperience.tsx`
- `src/components/CarImage.tsx`
- `src/components/KeyArt.tsx`
- `src/components/ExperienceContext.tsx`
- `src/components/SiteShell.tsx`
- `src/data/cinematics.ts` — nuovo
- `src/lib/motion.ts` — nuovo
- `src/lib/camera.ts` — nuovo
- `src/lib/motion-state.ts` — nuovo
- `scripts/test-phase2.mjs` — nuovo
- `scripts/profile-motion.mjs` — nuovo
- `scripts/test-phase2-state.mjs` — nuovo
- `package.json`, `README.md`, questo report
- `artifacts/phase2/*` e profili JSON: risultati e screenshot di verifica

`Booking.tsx`, l'archivio delle sei vetture, gli asset e le licenze della Fase 1 sono conservati.

## Misure di produzione

Profili ripetibili tramite `scripts/profile-motion.mjs`, viewport 1440×1000, Chromium headless Linux, campionamento di circa 2.6 secondi. Esecuzioni sintetiche singole: descrivono questo ambiente, non una certificazione su hardware fisico.

| Scenario | Fase 1 | Fase 2 |
|---|---:|---:|
| Scroll: ricalcoli layout | 0 | 0 |
| Scroll: frame mediano | 16.7 ms | 16.7 ms |
| Scroll: P95 frame | 16.8 ms | 16.7 ms |
| Scroll: script | 50.2 ms | 70.2 ms |
| Scroll: frame oltre 34 ms | 1 | 0 |
| Reveal: ricalcoli layout | 61 | 18 |
| Reveal: P95 frame | 33.4 ms | 16.8 ms |
| Reveal: frame oltre 34 ms | 1 | 0 |
| Reveal: task CPU | 224.4 ms | 243.0 ms |

Il reveal riduce il lavoro di layout, ma il tempo CPU complessivo di questo campione aumenta. Le nuove luci dello scroll aumentano il costo di scripting; non viene dichiarato un miglioramento universale né un framerate garantito. Dati grezzi: `artifacts/phase1-profile.json`, `phase2-profile.json`, `phase1-reveal-profile.json`, `phase2-reveal-profile.json`.

## Verifica finale

Esito: **lint, TypeScript e build superati**. Suite cinematografica completa e regressione commerciale superate sul server di produzione `http://localhost:3001`, senza errori JavaScript di pagina; suite cinematografica senza errori di console.

| Viewport | Intro osservata dal test | Scarto geometrico finale |
|---|---:|---:|
| 360 px | 4868 ms | 0 px |
| 390 px | 4912 ms | 0 px |
| 430 px | 4936 ms | 0 px |
| 768 px | 4936 ms | 0 px |
| 1366 px | 4835 ms | 0 px |
| 1440 px | 4968 ms | 0 px |
| 1920 px | 4971 ms | 0 px |

La timeline dura esattamente cinque secondi; la misura parte quando Playwright osserva il dialog, dopo il suo montaggio. Il confronto misura posizione e dimensioni della prima chiave, non certifica l'identità pixel per pixel dell'intera schermata.

Un ulteriore controllo mirato ha verificato gli stati `CAR_EXPLORE → BOOKING → CAR_EXPLORE → VAULT_IDLE` dopo il ritorno a una scena conservata, e la navigazione/prenotazione con API ViewTransition assente e hardwareConcurrency impostata a 2. Esito in `artifacts/phase2/state-fallback.json`.

I risultati completi dell'ultima esecuzione sono in `artifacts/phase2/results.json`. La suite verifica le viewport 360, 390, 430, 768, 1366, 1440 e 1920 px, durata e geometria intro/Home, skip/replay, wheel sintetico con delta piccoli e grandi, scroll inverso, touch sintetico, orientamento, tutte le sei auto, selezioni rapide, chiusura anticipata, cambio auto senza rimontaggio, resize, prenotazione sopra reveal, ViewTransition nativa, ritorno con filtro/selezione/scroll, browser back, reduced motion, tastiera, focus e console browser. La suite della Fase 1 continua a verificare il modulo, comprese date non valide e riepilogo locale.

## Limiti e lavoro restante

- Le chiavi rimangono illustrazioni provvisorie, non asset fotorealistici ufficiali. La maggiore qualità della luce non sostituisce fotografie o modelli accurati autorizzati.
- Fotografie autentiche ma documentarie, non uno shooting uniforme da studio. Interni disponibili solo per la Revuelto; restano mancanti gli altri cinque interni e le fotografie di dettaglio.
- Nessuna orbita reale attorno all'auto o camera WebGL: i movimenti delle fotografie sono traslazioni/crop e ingrandimenti proporzionali.
- Browser test eseguiti con Chromium. Trackpad fisico, Safari, Firefox, dispositivi reali, lettori di schermo e consumi GPU non sono certificati da questi test.
- Il profiling non dimostra l'assenza assoluta di memory leak a lungo termine. Le risorse di scena, i listener e le timeline hanno cleanup esplicito.
- Contatti aziendali, invio della richiesta, disponibilità, condizioni definitive e WhatsApp restano non configurati. Nessuna prenotazione o pagamento reale è simulato come confermato.
