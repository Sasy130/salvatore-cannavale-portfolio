# ONE MAN — Raccolta progetti

Aggiornamento del 30 ottobre 2026 su `www.salvatorecannavale.it`, repository `Sasy130/salvatore-cannavale-portfolio`.

## Modifica

- Preservati integralmente VELMORA, VANTA e LUNÉA, con demo sul dominio e casi studio.
- Aggiunte 16 schede nella sezione Progetti: ÉTERNA, MARÉ, BLACK LABEL, APEX KARTING, Rent Car Station, A&J Rent Car, NOIR, NERÈA, Sulla Via, FUORIGIOCO, ORBITA, OMBRA, FORGIA, Aevum, NØ/STATIC e MORSO. Totale: 19 progetti.
- Griglia responsive, filtri per settore, dettagli in dialog accessibile, anteprime WebP locali e collegamenti alle demo originali. Dati in `public/one-man/projects-data.js`; JavaScript e CSS della raccolta separati dal comportamento dei casi studio originali.
- Concept e redesign indipendenti sono esplicitati, senza attribuire incarichi o risultati commerciali reali.
- Il proprietario ha autorizzato esplicitamente l'accesso pubblico delle 16 nuove demo Sites. Tutte le 16 modifiche di accesso sono state confermate dal servizio; tutte le relative URL rispondono HTTP 200 senza autenticazione e mostrano il titolo del progetto.
- Le nuove demo rimangono sui loro indirizzi Sites. Le tre demo originarie sul dominio restano indipendenti; nessun sito nuovo viene presentato come copia locale del dominio.

## Verifiche

- `npm run typecheck`: riuscito.
- `npm run build`: riuscita con Next.js 16.3.5, preservando il rewrite della home e le route OPERAI/caso studio.
- Browser Chromium: tre schede originali e 16 nuove; filtri; dettagli; Escape e ritorno del focus; decodifica di tutte le anteprime; nessun overflow a 375, 390, 768 e 1440 px; nessun errore JavaScript rilevato.
- Axe sulla nuova raccolta: zero violazioni WCAG 2 A/AA e 2.1 AA rilevate. Il controllo automatico non è una certificazione di accessibilità.
- Verificate HTTP 200 per le tre demo locali e le route `/operai` e `/projects/business-management-system`; API OPERAI preservata (GET 405).
- Catture delle verifiche conservate localmente, non incluse nella pubblicazione.

## Pubblicazione

Base verificata: `3c90090e94a0872884515266d61c65a916f68cac`.
Pubblicazione completata attraverso GitHub → anteprima Vercel → main → dominio reale, come da `DEPLOYMENT.md`. Dettagli e verifica finale riportati sotto.

## Anteprima verificata

Commit preparato: `679f530f106b2ce8aabacf2364c94aa127fffad7`, branch `codex/portfolio-19-projects`. Build/deployment Vercel Preview: successo, deployment `7432188815`. La URL di anteprima richiede login Vercel: il contenuto non è stato dichiarato verificato anonimamente. I controlli visivi e funzionali sono stati eseguiti localmente; la verifica finale viene svolta sul dominio reale dopo la pubblicazione autorizzata.

## Pubblicazione di produzione

- Commit `679f530f106b2ce8aabacf2364c94aa127fffad7` promosso su `main` con verifica del riferimento precedente, senza forzare la cronologia.
- Deployment Vercel Production `7432224547`: successo. URL tecnico: https://salvatore-cannavale-portfolio-ck8mt4l6b-oneman-0b39.vercel.app.
- Dominio reale: https://www.salvatorecannavale.it/#work. HTML di produzione verificato: tre progetti originali presenti e 16 nuove schede.
- Moduli/anteprime pubblicati verificati con hash Git: nessuna differenza rispetto ai file locali testati.
- La verifica automatica sul dominio reale conferma filtri, apertura dettagli, Escape e ritorno focus, immagini, quattro larghezze e zero violazioni axe sulla raccolta. Le route delle tre demo originali e delle pagine legacy rispondono 200.
- La GET dell'API OPERAI risponde 405 sia in locale sia sul dominio reale. Non è stata eseguita alcuna POST e il codice di tale API non è stato modificato.
- Il risultato di produzione è aggiunto a questo registro locale dopo la pubblicazione; nessun file applicativo è stato cambiato dopo il deploy.

## Aggiornamento richiesto: raccolta e dominio

- Rimossi dalla raccolta NØ/STATIC, MORSO, AEVUM, FORGIA e OMBRA; mantenuti i tre progetti originali e 11 aggiunti.
- Copie statiche locali di NERÈA, Sulla Via, FUORIGIOCO e ORBITA sotto `/demos/`, collegate dalla raccolta. Gli altri sette progetti restano temporaneamente su Sites: non sono stati presentati come trasferiti.
- Le demo Sites originali rimangono separate e non sono state eliminate.
- Restano da trasferire ÉTERNA, MARÉ, BLACK LABEL, APEX KARTING, Rent Car Station, A&J Rent Car e NOIR: richiedono adattamenti di build, percorsi o servizi; completare il trasferimento e verificare ogni pagina prima di sostituire i link.

## Ulteriori demo locali

- A&J Rent Car, Rent Car Station e NOIR ricompilati con percorsi sotto `/demos/`, mantenendo navigazione interna e asset separati; aggiunti rewrite per le pagine delle esportazioni statiche.
- Restano da trasferire ÉTERNA, MARÉ, BLACK LABEL e APEX KARTING. Fino al completamento restano collegamenti Sites.

## Trasferimento completo delle demo sul portfolio

- Aggiunte le copie statiche di ÉTERNA, MARÉ, BLACK LABEL e APEX KARTING; con le copie già pubblicate, tutte le 11 demo aggiunte si aprono sul dominio del portfolio. Rimossi i collegamenti Sites dalla raccolta.
- Le applicazioni Next.js sono state ricompilate con un prefisso dedicato; i rewrite servono le pagine interne senza interferire con le route preesistenti. Per BLACK LABEL il catalogo dimostrativo è stato generato usando un database locale temporaneo con dati di esempio. MARÉ e BLACK LABEL non inviano richieste o prenotazioni dalla copia statica; ÉTERNA usa la modalità demo.
- In locale verificate le 11 homepage su viewport mobile, immagini caricate, assenza di link Sites nelle pagine controllate e navigazione di una pagina interna per le applicazioni Next.js. Build e TypeScript verificati; controllo finale della pubblicazione da eseguire dopo il deploy.
- Corretti i percorsi di navigazione interni di ÉTERNA e delle demo di noleggio. La galleria BLACK LABEL è stata verificata in Chromium: sei immagini decodificate senza errori di caricamento.

## Sezione redesign per aziende esistenti

- Separati Rent Car Station e A&J Rent Car dai nove concept aggiunti ideati da zero; entrambe le proposte hanno una sezione dedicata, collegamenti diretti alla demo e alla presentazione, e sono identificate come redesign indipendenti non commissionati né affiliati. VELMORA, VANTA e LUNÉA restano in evidenza; totale invariato di 14 progetti.
- Aggiunta a entrambe le homepage una panoramica responsive delle scelte di navigazione; A&J ha ora un caso studio dedicato `/demos/aj-rent-car/progetto/` e il menu mobile supporta Escape e gli attributi di accessibilità. Le demo non inviano richieste o prenotazioni.
- Salvati in `demo-sources/` i sorgenti ricostruibili e le istruzioni per aggiornare le due copie statiche; i file generati sono in `public/demos/`.
- Build separate delle due demo, TypeScript e build del portfolio completate. Chromium a 390 e 1440 px: nove concept nella raccolta, due redesign separati, filtro Automotive, dialog, Escape, link ai casi studio, assenza di overflow e di errori JavaScript rilevati. Axe sulla sezione redesign: nessuna violazione automatica WCAG A/AA rilevata; non costituisce una certificazione.

## Raccolta progetti e pagina Proposte

- Spostate le proposte per Rent Car Station e A&J Rent Car nella pagina `/proposte`, raggiungibile dai menu desktop e mobile, senza schede nella homepage; mantenute le rispettive demo e i casi studio indipendenti.
- Riordinata la raccolta dei nove concept con griglia desktop a tre colonne e filtri orizzontali su smartphone; i tre progetti in evidenza sono invariati.
- Sostituita nelle due demo la navigazione Next tra pagine statiche con link diretti sul dominio e corretti i percorsi delle ricerche: evita richieste di prefetch incompatibili con l'hosting del portfolio. Nessuna richiesta di prenotazione reale viene inviata.

## PROJECT ROULETTE — esperienza interattiva

- Aggiunta una roulette visiva che esplora i 12 progetti originali già presenti nel portfolio, con selezione casuale, pulsanti precedente/successivo, accesso diretto alle demo, selettori nominati e gesto orizzontale su touch. I redesign per attività esistenti restano soltanto nella pagina `/proposte`.
- Aggiunta una transizione a sipario per i tre progetti in evidenza; l'esperienza non intercetta lo scroll e conserva le sezioni e i collegamenti esistenti. La roulette è opzionale e la raccolta tradizionale resta disponibile senza JavaScript.
- Animazioni e interazioni rispettano `prefers-reduced-motion`; la roulette è immediata con movimento ridotto. La scultura 3D esistente continua a sospendere il rendering fuori schermo. I file della novità sono `public/one-man/arcade.js`, `index.html` e `style.css`.
- Verificati localmente TypeScript e build; Chromium a 320, 390, 768 e 1440 px con movimento ridotto e un controllo separato con animazione attiva. Controllati pulsanti, frecce, scelta casuale, stato accessibile, gesto touch, tutti i 12 collegamenti alle demo e le route `/proposte`, `/operai` e del caso studio esistente. Axe sulla roulette non ha rilevato violazioni WCAG 2 A/AA e 2.1 AA; non è una certificazione di accessibilità.

## Rifinitura motion e introduzioni progetto

- La scultura 3D risponde al trascinamento orizzontale su touch con una breve inerzia, lasciando nativo lo scorrimento verticale; le modalità esistenti e la sospensione del rendering fuori schermo restano attive.
- La roulette precarica le anteprime vicine e usa una dissolvenza tra immagini già decodificate, una transizione tipografica e tonalità dedicate per le categorie. Le selezioni rapide non sovrascrivono il risultato più recente. Con movimento ridotto gli effetti vengono disattivati anche se la preferenza cambia durante l'interazione.
- Arricchiti i casi studio di VELMORA, VANTA e LUNÉA con introduzioni visive e una transizione d'ingresso; i collegamenti diretti alle demo rimangono disponibili. Ritoccati i dettagli del finale contatti. Preservata la pagina separata `/proposte`.
- Verificati TypeScript e build; Chromium con e senza movimento ridotto, quattro larghezze, navigazione della raccolta, selezioni rapide, decodifica delle 12 immagini, chiusura dei casi studio e ritorno del focus, gesto touch sulla scultura e annullamento delle animazioni al cambio di preferenza. Le verifiche automatiche non equivalgono a una certificazione di accessibilità.
- Eseguito anche un gesto touch verticale sulla scultura con movimento attivo: lo scroll rimane operativo. Le 12 immagini della roulette sono state decodificate e associate al progetto corretto.


## FUOCO — Fase 1: Cinematic Experience

Consegna del 3 novembre 2026. La Fase 1 è completata nella checkout locale; la Fase 2 non è stata avviata. Nessun deploy del sito o pubblicazione dell’ambiente è stato eseguito da questo task.

### Architettura e componenti

- Nuova route autonoma `/fuoco` in `src/app/(fuoco)/fuoco/`, con root layout italiano, metadata, favicon dedicata, font locali e CSS propri. La home ONE MAN, i rewrite, OPERAI, i casi studio e le altre demo restano invariati.
- `page.tsx`: homepage server-rendered con hero, rituale, ingredienti, anteprima pizze, percorso dall’impasto alla tavola, CTA finale, contatti e footer.
- `src/features/fuoco/content.ts`: testi, ricette indicative, immagini, passaggi del racconto e configurazione dei contatti. Nessun tempo di lievitazione, metodo produttivo specifico, prezzo o dato del locale è stato inventato.
- `intro.tsx`: ignition GSAP di circa 2 secondi su desktop, alleggerita a 1,35 secondi su mobile; skip, Escape, gestione del focus, una sola volta per sessione, timeout di sicurezza, riduzione del movimento e nessun blocco dello scroll. L’overlay è nascosto nell’HTML senza JavaScript.
- `navigation.tsx`: navigazione desktop e menu mobile accessibile, stato espanso, chiusura esterna, Escape e ritorno del focus.
- `motion.tsx`: reveal di immagini e testi, parallax delicato su desktop e storytelling sincronizzato allo scroll con ScrollTrigger. Nessun pinning o scroll hijacking; cleanup delle animazioni anche al cambio di preferenza di movimento.
- `ui.tsx`: componenti riutilizzabili Photo, Eyebrow, TextLink e Brand. Immagini con `next/image`, dimensioni responsive e lazy loading fuori dalla hero. Palette carbone/crema con dettagli pomodoro/fuoco, serif editoriale, focus visibile, skip link e navigazione per ancore.

### Dipendenze

Stack esistente preservato: Next.js App Router 16.3.5, React 19.3.0, TypeScript 6.0.3 e Tailwind CSS 4.3.3 dal lockfile. Aggiunte con versioni esatte: `gsap` 3.15.0, `lucide-react` 1.67.0, `@fontsource/cormorant-garamond` 5.3.0 e `@fontsource/dm-sans` 5.3.0. I font sono self-hosted dai pacchetti, senza richieste a Google Fonts. Lockfile aggiornato per queste sole aggiunte.

### Fotografie e licenze

11 asset WebP locali in `public/images/fuoco/`, circa 1,5 MB complessivi, con alcuni scatti riutilizzati nelle sezioni. Registro completo di autori, fonti, copie verificate, trasformazioni e licenze in [CREDITS.md](public/images/fuoco/CREDITS.md), raggiungibile anche dal footer. Fotografie reali di repertorio, esplicitamente distinte da prodotti o persone di una pizzeria FUOCO reale; nessuna immagine generata.

Fonti documentate: Pexels, Unsplash, Pixabay e Wikimedia Commons. Le copie sono state acquisite da repository GitHub con crediti; l’accesso diretto alle pagine originali e ai CDN fotografici è bloccato dalla policy di rete, quindi non è stata dichiarata una nuova verifica diretta di tali pagine. La Marinara di Peter Van den Bossche è CC BY-SA 2.0: attribuzione, fonte, licenza e conversione WebP documentate e da preservare. Icona FUOCO SVG originale. Cormorant Garamond e DM Sans sono distribuiti con SIL Open Font License nei relativi pacchetti.

### Funzionalità completate e confini

- Homepage completa responsive e intro cinematografica, con fallback per movimento ridotto e contenuti visibili senza JavaScript.
- Tre pannelli ingredienti e tre pizze classiche (Margherita, Marinara, Diavola); ricette e immagini dichiarate illustrative. I pulsanti menu portano alla selezione presente nella homepage e alle informazioni sull’anteprima, senza pagine inesistenti o prezzi fittizi.
- Storia con quattro passaggi fotografici, navigazione per ancore e CTA finali funzionanti.
- Sezione contatti con indirizzo, orari e WhatsApp non configurati: disponibilità indicata come futura, senza numeri inventati o pulsanti di invio finti. SEO base e Open Graph; `noindex` mantenuto per il concept dimostrativo.

### Verifiche eseguite

- `npm ci --cache /tmp/codex-npm-cache --no-audit --no-fund`: riuscito, anche dopo l’aggiornamento del lockfile. La cache predefinita fuori dalle cartelle scrivibili causava il primo errore; corretta la destinazione senza disabilitare checksum, firme o TLS.
- `npm run typecheck`: superato; la build finale ha eseguito anche il controllo TypeScript integrato.
- `npx --no-install eslint 'src/features/fuoco/**' 'src/app/(fuoco)/**'`: superato.
- `npm run build`: superato sulla versione finale, con generazione statica di `/fuoco`.
- `npm run lint`: eseguito e fallito con 272 errori e 25801 avvisi nei file preesistenti, incluse copie statiche/vendor e tre segnalazioni sui link alla home di pagine legacy; nessuna segnalazione nei nuovi file FUOCO. Non sono stati modificati i file estranei alla consegna per nascondere questi esiti.
- Sviluppo su origine `localhost:3000`: HTML, immagine ottimizzata, idratazione, menu mobile e assenza di errori JavaScript verificati. L’origine `127.0.0.1` blocca gli endpoint HMR di questa versione di Next.js; il problema è stato diagnosticato usando la documentazione locale, senza ampliare le origini ammesse.
- Produzione con `npm start -- --port 3001`: HTTP 200 per `/fuoco`, home ONE MAN, `/operai`, `/projects/business-management-system`, `/proposte`, crediti e icona. GET `/api/operai/requests` risponde 405 come prima; nessuna POST eseguita.
- Chromium a 320, 390, 768 e 1440 px: nessun overflow orizzontale, tutte le 13 immagini della homepage decodificate, nessuna risposta HTTP fallita, nessun errore JavaScript e tutte le ancore risolte. Verificate anche le schermate desktop/mobile.
- Interazioni in produzione: intro automatica e per sessione, skip con focus sul contenuto, Tab durante l’intro, menu mobile, Escape con ritorno del focus, chiusura esterna, ancore, scroll nativo, preferenza di movimento iniziale e dinamica e contenuti senza JavaScript: superate.
- Axe-core 4.14.0, WCAG 2 A/AA e 2.1 AA, a 390 e 1440 px: zero violazioni automatiche rilevate dopo aver corretto il contrasto dei numeri del percorso. Due verifiche per viewport richiedono valutazione manuale; le schermate sono state ispezionate, ma il controllo automatico non costituisce una certificazione.
- `git diff --check`: superato. Log, script di verifica e screenshot conservati in `/tmp`, senza aggiungere test artificiali o output generati al repository.

### Ambiente cloud riutilizzabile

Installazione e avvio eseguiti nella macchina reale con Node 24.22.1 e npm 11.9.0; lettura GitHub verificata con l’autenticazione HTTPS già fornita. Nessun nuovo segreto o variabile applicativa richiesto. Policy di rete osservata come applicata.

Salvati nella bozza dell’ambiente `install_script` (npm ci con cache scrivibile e lockfile) e `start_skill` (directory, checkout esistente senza worktree, avvio e verifica del contenuto/client, origine localhost, validazioni e confini della Fase 1). La bozza è confermata salvata, ma non applica o pubblica da sola una nuova configurazione. Per rendere riutilizzabile lo snapshot, rivedere e salvare le modifiche nelle impostazioni dell’ambiente, poi pubblicare l’ambiente. Il ripristino in un nuovo task non è stato verificato.

### Problemi aperti e Fase 2

1. Ottenere fotografie originali autorizzate del locale; la mozzarella attuale è 400×267 px, meno dettagliata degli altri asset. Conservare/aggiornare crediti e condizioni delle fonti stock finché presenti.
2. Confermare storia, ricette, allergeni, prezzi, indirizzo, orari, contatti e numero WhatsApp reali prima di un lancio commerciale.
3. Realizzare il menu completo nella Fase 2 e definire separatamente eventuali prenotazioni o ordini; nessuna funzionalità di queste categorie è stata iniziata.
4. Definire con il titolare privacy e altri contenuti legali necessari al sito reale; non sono stati inventati documenti o dati aziendali. Rivedere `noindex` soltanto al lancio autorizzato.
5. Eventuale pubblicazione del sito attraverso il flusso GitHub → Vercel descritto in DEPLOYMENT.md è separata da questa consegna locale e dalla pubblicazione dello snapshot cloud.


## FUOCO — Fase 2: Complete Restaurant Experience

Fase 2 completata il 3 novembre 2026, proseguendo la homepage e il design della Fase 1. Esperienza pronta da presentare come concept demo. Nessun deploy del sito e nessuna pubblicazione dello snapshot cloud eseguiti da questo task.

### Implementazione

- Quattro pagine: `/fuoco`, `/fuoco/menu`, `/fuoco/storia`, `/fuoco/contatti`. Prefisso mantenuto per preservare home ONE MAN, OPERAI e altre demo. Navbar, stato della pagina attiva, footer, logo e indicatore demo condivisi nel layout.
- Menu digitale con 11 voci: sei pizze (Margherita, Marinara, Diavola, Quattro Formaggi, Capricciosa, Salsiccia e Friarielli), due fritti e tre bevande. Filtri reali per classiche/speciali/fritti/bevande, categoria completa, conteggio annunciato e scorrimento orizzontale su touch.
- Schede editoriali con prezzi demo configurabili, ingredienti e allergeni provvisori. Tre fotografie coerenti per le classiche; presentazioni tipografiche per le altre proposte senza fotografie appropriate. Nessuna immagine fittizia o pizza differente usata come sostituto.
- Dettagli in dialog nativo: immagine grande, ingredienti, prezzo opzionale, avvertenza allergeni, chiusura con pulsante/Escape/backdrop, contenimento del focus, ritorno al pulsante di apertura e ripristino dello scroll. Titoli e testi sono fuori dal pulsante esteso della scheda; prezzo e descrizione sono collegati con aria-describedby.
- Configurazione unica `src/features/fuoco/restaurant.ts`: nome, tagline, logo, telefono, WhatsApp, indirizzo, orari, social, fotografia reale del locale, modalità demo e SEO. Numero internazionale validato; messaggi WhatsApp generico/pizza codificati, messaggio generico per fritti e bevande. Nessun invio automatico, ordine o prenotazione confermati.
- Storia editoriale con passione, impasto, forno, ingredienti e tradizione. Testi esplicitamente demo e sostituibili; nessuna storia aziendale, premio, certificazione o processo produttivo inventati.
- Contatti e componente Location riutilizzato in homepage: link telefono, WhatsApp, social e indicazioni Google Maps solo con dati validi configurati; orari centralizzati. Mancanze esplicite soltanto nella demo. Motivo grafico al posto di una fotografia o mappa di un locale non documentato.
- Homepage preservata con CTA collegate alle nuove pagine e alle ancore del menu. Intro esclusiva della homepage, movimento ridotto, skip e focus mantenuti. Il contesto GSAP viene ricreato e pulito al cambio di pagina tramite pathname.
- Metadata per pagina, canonical, Open Graph e Twitter card; `/fuoco/sitemap.xml`, `/robots.txt` e schema Restaurant condizionale. La demo resta noindex e la sitemap vuota; demo:false + allowIndexing:true abilita le quattro URL. Lo schema richiede anche verifiedBusiness:true, indirizzo e telefono validi. Nessuna recensione o valutazione inventata; crawling del portfolio lasciato consentito.

### Architettura, dipendenze e documentazione

- `restaurant.ts`: configurazione pubblica del locale e costruzione/validazione dei link; `seo.ts`: metadata, sitemap e schema condizionale.
- `menu-data.ts`, `menu-experience.tsx`, `menu.css`: proposte, filtri, dialog e stile del menu. `location.tsx`, `restaurant-pages.css` e le due pagine editoriali: storia e contatti.
- `navigation.tsx`, `footer.tsx`, `ui.tsx`, `intro.tsx`, `motion.tsx`: componenti comuni e animazioni. Nessuna dipendenza aggiunta nella Fase 2.
- `tests/fuoco-config.test.mjs`: 11 test ripetibili con il runner nativo Node, usando il compilatore TypeScript già presente. Nuovi comandi `npm run test:fuoco` e `npm run lint:fuoco`.
- README aggiornato, guida completa [FUOCO.md](FUOCO.md), istruzioni Vercel e lista dei dati da richiedere al cliente. Nome, logo, fotografie, pizze, prezzi, telefono, WhatsApp, indirizzo e orari hanno percorsi di modifica documentati.
- Registro fotografico aggiornato in [CREDITS.md](public/images/fuoco/CREDITS.md): riuso degli asset della Fase 1, nessuna nuova fotografia o licenza acquisita. Restano valide provenienze e condizioni documentate; mozzarella 400×267 px da sostituire con un originale migliore.

### Verifiche finali eseguite

- `npm run lint:fuoco`: superato, inclusi configurazione, pagine, componenti, robots e test.
- `npm run test:fuoco`: 11 test eseguiti, 11 passati, zero falliti o saltati. Verificati numeri mancanti/non validi, messaggi generico e pizza, codifica di caratteri riservati, indirizzi Maps, social, prezzi assenti/demo, sitemap/schema e rendering dei contatti con e senza dati reali configurati. Le fixture di contatto sono solo nei test: nessun messaggio o richiesta esterna inviati.
- `npm run typecheck`: superato. `npm run build`: superato sulla versione finale con quattro pagine statiche, sitemap e robots. Corrette durante l’integrazione le importazioni di icone non più disponibili nella versione Lucide installata.
- `npm run lint`: eseguito, fallisce con gli stessi 272 errori e 25801 avvisi preesistenti nelle altre demo, asset vendor/minificati e link legacy; nessuna modifica per mascherarli. Tutti i file FUOCO e i test superano il lint dedicato.
- Produzione locale: 12 route verificate con esiti attesi, incluse le quattro FUOCO, sitemap/robots/crediti, home e route legacy. GET API OPERAI resta 405; nessuna POST eseguita.
- Chromium: 16 combinazioni pagina/viewport a 320, 390, 768 e 1440 px; immagini decodificate, zero overflow, zero errori JavaScript/console o risposte HTTP fallite. Ancore e collegamenti tra pagine risolti.
- 15 verifiche dei filtri, 18 verifiche delle sei schede pizza a tre larghezze: ingredienti, prezzi demo, allergeni provvisori, Escape, focus, chiusura esterna e ripristino dello scroll superati anche dopo il refactor semantico.
- 11 scansioni axe su pagine e dialog: zero violazioni automatiche WCAG 2 A/AA e 2.1 AA rilevate. Revisione visiva desktop/mobile e del focus eseguita; il risultato non è una certificazione.
- Navigazione mobile, percorsi SPA storia → contatti → menu, movimento ridotto iniziale/dinamico, menu senza JavaScript, canonical/OG/noindex, sitemap demo e assenza di schema Restaurant dimostrativo verificati.
- Emulazione touch Chromium a 390 e 412 px: tap del menu, navigazione, scorrimento orizzontale dei filtri, apertura da fotografia, chiusura, scroll verticale nativo e assenza di overflow/errori verificati. Non sono test su hardware iPhone/Android reale o sul motore Safari.
- `git diff --check`: superato. Screenshot e report browser in `/tmp/fuoco-phase2-qa/`; log e script di verifica UI in `/tmp`. I test di configurazione sono conservati nel repository.

### Ambiente e dati ancora da fornire

Aggiornato e confermato salvato `start_skill` della bozza cloud per le quattro pagine, i comandi di verifica, la configurazione e i confini della Fase 2. `install_script` esistente preservato: nessuna nuova installazione richiesta. Per rendere riutilizzabile lo snapshot, rivedere e salvare la bozza nelle impostazioni, poi pubblicare l’ambiente; il nuovo ripristino non è stato verificato. Questo passaggio è distinto dal deploy Vercel del sito.

Restano da ottenere i dati reali del cliente elencati in FUOCO.md: contatti e indirizzo, orari, menu/prezzi/allergeni confermati, storia approvata, logo e fotografie autorizzate. Queste assenze sono gestite dalla demo e non impediscono la presentazione del concept. Fino alla conferma restano disattivati i contatti non configurati e l’indicizzazione. Prenotazioni, ordini, pagamenti, backend e dashboard non sono stati introdotti. Il lavoro termina alla Fase 2.
