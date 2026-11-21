# Copertine dei siti e finale tipografico — 21 novembre 2026

La sezione «I miei progetti» chiarisce l’autorialità personale richiesta dal titolare. Dodici nuove schermate delle pagine effettive sostituiscono le precedenti copertine; per VELMORA è conservata la schermata completa già disponibile, ricodificata WebP, perché la nuova cattura 3D in questo ambiente non è risultata affidabile. Nuova resa contain per preservare la composizione. Descrizioni dimostrative e indicazione dei redesign indipendenti preservate.

Metodo rimosso dalla homepage e dal menu; vecchio #indice punta ai progetti. Nuovo finale «Facciamo il prossimo segno»: SVG originale, tipografia, firma ONE MAN, email/copia e replay. Nessuna nuova dipendenza. Dati in lib/restored-projects.ts; componente FinalContact.tsx e final-contact.css. Vedere docs/COPERTINE-E-FINALE.md nell’archivio sorgente.

Verifiche: TypeScript, lint e build statica di produzione superati. Suite Playwright 13/13 passati; test finale/navigation ripetuto dopo correzione dell’offset sotto header, passato. Inclusi axe, cinque viewport, tutte le immagini HTTP 200, progetti, menu, intro/replay, touch, clipboard e fallback. Mobile verificato in emulazione Chromium.

---

# Metodo creativo al posto dell’elenco duplicato — 21 novembre 2026

Rimosso il blocco «Scegli dove entrare» che ripeteva i progetti. Inserita la sezione «Prima l’idea. Poi il segno.»: Identità, Interazione, Sviluppo, un segno vettoriale su desktop e CTA reale ai contatti. Menu Metodo → #metodo; vecchio #indice compatibile. Sezione progetti e copertine preservate.

Componenti: components/vice/CreativeMethod.tsx e creative-method.css. Documentazione: docs/METODO-CREATIVO.md nell’archivio sorgente. Nessuna nuova dipendenza.

Verifiche: TypeScript, lint e build statica di produzione superati; 13/13 scenari Playwright passati, inclusi axe, menu Metodo, CTA contatti, formati 320/390/768/1440, regressioni intro/progetti e touch. Mobile verificato in emulazione Chromium.

---

# Progetti: selezione editoriale — 21 novembre 2026

Sostituita soltanto la galleria di copertine con un indice numerato e anteprima sticky su desktop, dettagli espandibili su mobile/tablet. Selezione mouse/tastiera/tocco, rivelazione tramite clip-path, reduced motion e dettagli HTML utilizzabili senza script. Conservati tredici lavori, copertine, demo, dialogo progetto, intro SC, hero tipografica, menu e sezioni successive. Nessuna nuova dipendenza.

Componenti: components/vice/EditorialProjects.tsx, editorial-projects.css. Dati: lib/restored-projects.ts. Documentazione: docs/PROGETTI-EDITORIALI.md nell’archivio sorgente.

Verifiche: TypeScript, lint e build statica di produzione superati. Suite finale Playwright: 12/12 passati, inclusi cinque viewport, axe, selezione da tastiera/mobile, fallback senza script, intro/replay, menu, anteprime e copia email. Smartphone verificato in emulazione Chromium; non è una certificazione su dispositivi fisici.

---

# Sfondo tipografico — 21 novembre 2026

Sostituito esclusivamente lo sfondo a nastri della hero con lettere vettoriali astratte, parallasse a tre livelli mouse/touch e reduced motion. Intro SC e resto del portfolio preservati. Nessuna nuova dipendenza. Documentazione: docs/SFONDO-TIPOGRAFICO.md nell’archivio sorgente.

Verifiche: TypeScript, lint e build statica di produzione superati. Dieci scenari Playwright superati nella suite completa; scenario touch/scroll corretto nel simulatore e ripetuto con esito positivo (undici scenari verificati complessivamente). Inclusi cinque viewport, axe, intro/replay, menu, progetti, clipboard e fallback script/WebGL.

---

## Firma SC — 21 novembre 2026

Modifica limitata all'apertura. Nuovo SignatureOpening.tsx: iniziali SC ritagliate con una maschera SVG su superficie color carta, con lo sfondo esistente visibile nelle lettere. Espansione della geometria e apertura circolare fino alla homepage. Nessun video o nuovo canvas. Hero, progetti, indice, biografia e contatti conservano lo stesso blocco sorgente, verificato tramite SHA-256; menu, 13 lavori, immagini, demo e backend mantenuti.

Automatico, tocco, Entra subito, salto, Escape, replay, focus e timeout di sicurezza. Memoria one-man-signature; ?intro=1 forza l'apertura. Con reduced motion il replay richiesto mostra la versione statica senza animazioni. Con script bloccati l'overlay resta nascosto. Cleanup completo della timeline anche interrompendo l'uscita e riaprendo subito.

TypeScript, lint, build statica /one-man e nove scenari Chromium superati. Movimento ridotto e axe ricontrollati sull'ultima build. Schermata mobile ispezionata. Safari e telefoni fisici non collaudati. Sorgente aggiornato in one-man-source.zip.

---

## Apertura automatica e sfondo originale — 20 novembre 2026

Modifica circoscritta all'intro e allo sfondo della hero. Nuova opera generata appositamente per ONE MAN: one-man-vice-art.webp, 210860 byte, rosa/magenta/turchese e texture pittoriche. La precedente fotografia non è più utilizzata. Il resto del sito, la parete dei 13 lavori, le demo e il backend sono conservati.

L'apertura non richiede più trascinamenti: parte automaticamente, oppure con un tocco sullo schermo o Entra subito. Nome animato, tre tagli diagonali, progresso visibile, skip, Escape, replay, reduced motion e timer di sicurezza. L'overlay diventa visibile solo quando il codice interattivo è pronto; con script bloccati il sito resta accessibile. Memoria one-man-vice-art; ?intro=1 forza il replay.

TypeScript, lint e build /one-man superati. Otto scenari Chromium superati complessivamente, incluso automatico, tocco immediato, pulsante, skip/replay, script bloccati e regressioni del sito. Il test del pulsante è stato ripetuto dopo l'adattamento all'apertura automatica. Schermata mobile ispezionata. Safari e dispositivi fisici non collaudati. Sorgente aggiornato in one-man-source.zip.

---

## Vice Cut — 20 novembre 2026

Nuova homepage VicePortfolio: fotografia locale di Miami, nome SALVATORE CANNAVALE composto da 18 lettere animate e apertura interattiva con cinque tagli rosa/turchese. Il nome si può trascinare realmente con mouse o dito; pulsante e tastiera alternativi. Skip, Escape, replay, reduced motion e timeout all'uscita. L'animazione è HTML/CSS/GSAP, non un filmato. Fonte e licenza della foto in docs/FOTOGRAFIA-VICE.md e nel footer.

Rimossa dalla homepage la galleria con pannello fisso: 13 lavori in una parete continua di immagini, grande immagine alternata a due mezze pagine su desktop, colonna su mobile. Scroll nativo con maschere, parallasse e tipografia; menu fisso e indice testuale. Schede e demo originali riutilizzate. Copia email reale con gestione del fallimento. Precedenti componenti conservati nel sorgente; nessuna modifica ai backend o alle altre demo.

TypeScript, lint, build statica /one-man e sette scenari Chromium superati: intro/replay, progetti/demo/focus, menu e touch, reduced motion/audit axe, cinque viewport e asset, fallback senza WebGL e clipboard, trascinamento CDP sul nome. Apertura e mobile verificati nuovamente dopo il controllo delle icone. Telefoni fisici e Safari non collaudati. Sorgente aggiornato in one-man-source.zip.

---

## Tensione — ridisegno editoriale completo, 20 novembre 2026

Nuova direzione originale dopo il riferimento ad Awwwards: carta chiara, nero e vermiglio, tipografia monumentale e opera generativa. Sistema CSS riscritto per intro, hero, ingresso, galleria, archivio, menu, schede, biografia, contatti e mobile. Rimossa l'estetica neon. Theme color e schema colore aggiornati.

BrandArtwork genera 64 tracciati SVG: il pulsante Riscrivi la forma modifica realmente la geometria tramite GSAP ed è utilizzabile con touch e tastiera. Puntatore e reduced motion gestiti. È grafica vettoriale, non una simulazione fisica. Motore Next/React, renderer delle anteprime, 13 progetti, miniature, demo e backend originali conservati.

TypeScript, lint, build statica con /one-man e nove scenari Chromium superati. Nuovo test touch/tastiera sul cambiamento dei tracciati; controllo dedicato della maschera d'ingresso. Audit axe negli scenari controllati, cinque viewport, fallback WebGL e intro/replay inclusi. Schermate desktop e mobile ispezionate. Safari e dispositivi fisici non collaudati. Sorgente completo aggiornato in one-man-source.zip.

---

## Entrata in scena — 20 novembre 2026

Nuova apertura: linea di luce, ingresso prospettico di ONE MAN e apertura di due sipari sulla homepage. Rimossa la composizione illustrata ad anello. Hero viola scuro con rosa e turchese, tipografia CREA / OSA, cornici prospettiche e taglio luminoso. Effetti realizzati con HTML/CSS e GSAP, senza filmati né nuovi canvas. Nessuna copertina di progetto in intro, hero o ingresso. Progetti, miniature, schede e demo conservati.

TypeScript, lint, build con /one-man e otto test Chromium superati: sette di regressione e un test dell'entrata in scena con titolo, sipari e termine automatico. Skip, Escape, replay e reduced motion mantenuti. Schermate desktop/mobile ispezionate. Safari e telefoni fisici non collaudati. Sorgente aggiornato in one-man-source.zip.

---

## Anteprima del marchio — 20 novembre 2026

Rimossi copertine e nomi dei lavori da hero, intro e ingresso. Nuovo BrandArtwork.tsx: composizione SVG originale con sole rosa, gradiente turchese e anello cromato vettoriale. Tre varianti nella sequenza iniziale, oscillazione CSS disattivata con reduced motion e animazioni GSAP adattate al disegno. L'anello è grafica vettoriale, non una simulazione WebGL. I progetti iniziano nella sezione Progetti; tutti i 13 lavori, galleria, miniature, iframe e backend conservati.

TypeScript, lint, build con /one-man e sette test Chromium superati, comprese nuove asserzioni che intro, hero e ingresso non mostrino immagini dei progetti. Schermata mobile ispezionata. Safari e dispositivi fisici non collaudati. Sorgente aggiornato in one-man-source.zip.

---

## Studio delle anteprime — 20 novembre 2026

Nuova composizione: copertina completa affiancata da titolo, descrizione originale e CTA su desktop; immagine e informazioni separate su telefono. Selettore di 13 miniature con stato attivo e scorrimento locale automatico. Il movimento laterale dei pannelli è sostituito da rivelazione verticale GLSL fra due superfici sovrapposte, con profondità contenuta e copertine adattate senza ritaglio. Conservati ingresso solare, hero, indice, schede, demo, navigazione touch e fallback.

TypeScript, lint, build statica con prefisso /one-man e sette test Chromium superati (sei di regressione e un test touch del selettore e della separazione fra immagine e informazioni). Schermate desktop e mobile ispezionate. Safari e telefoni fisici non collaudati. Sorgente aggiornato in one-man-source.zip. Tutti i 13 progetti e il backend esistente conservati.

---

## Regia dei progetti — 20 novembre 2026

Hero e stile Costa conservati. Nuovo ProjectEntrance: il disegno solare condiviso con la hero si espande e apre una maschera circolare sul primo lavoro. Nuovo renderer: due pannelli tridimensionali con camera prospettica, rotazione e profondità, senza passaggio fra texture o dissolvenza. Un solo canvas, geometria condivisa, due materiali riutilizzati. Titoli HTML separati dalla scena. Comandi precedente/successivo con stato agli estremi, scroll nativo e controllo touch conservati. Vista essenziale e fallback HTML indipendenti da WebGL.

TypeScript, lint, build statica con /one-man e sei scenari Chromium superati (cinque di regressione e uno dedicato a ingresso, pannelli, percorso inverso e nuovi comandi). Tutti i 13 progetti, demo e backend originali conservati. Safari e telefoni fisici non collaudati. Sorgente aggiornato in one-man-source.zip.

---

## Direzione Costa — 20 novembre 2026

Palette avorio, rosa, turchese e viola scuro ispirata all’immaginario Vice City. Hero a due colonne su desktop e blocchi in sequenza su mobile: titolo, presentazione e anteprima non si sovrappongono. Grafica tropicale SVG locale, menu chiaro, passaggio tipografico allo scroll, anteprime WebGL con curvatura più marcata e passaggi direzionali. Titoli e didascalie rimangono separati dalle immagini. I 13 progetti e le demo originali sono conservati.

Build statica /one-man, TypeScript, lint e cinque test Chromium superati: navigazione, renderer, touch CDP, iframe controllato, reduced motion, axe, intro/skip/replay, fallback senza WebGL e cinque viewport. Nuovo controllo geometrico contro la sovrapposizione tra titolo e immagine della hero. Safari e telefoni fisici non collaudati. Memoria sessione one-man-cinema-coast; ?intro=1 forza l’apertura. Sorgente completo aggiornato in one-man-source.zip.

---

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
