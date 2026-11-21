# ONE MAN — produzione

Il portfolio principale è pubblicato su https://www.salvatorecannavale.it/.
Il dominio è registrato e gestito su Netsons; il sito è ospitato su Vercel.

- Progetto: https://vercel.com/oneman-0b39/salvatore-cannavale-portfolio
- Repository: https://github.com/Sasy130/salvatore-cannavale-portfolio
- Branch di produzione: `main`. Un aggiornamento di questo branch avvia la pubblicazione Vercel.
- Home ONE MAN: `public/one-man/index.html`, `style.css`, `app.js`, `sculpture.js` e asset locali.
- `next.config.ts` riscrive esclusivamente `/` verso `/one-man/index.html`, mantenendo l’indirizzo pubblico della home.
- Le route Next.js `/operai`, `/api/operai/requests` e `/projects/business-management-system` restano disponibili.
- I ritorni alla home dalle pagine Next devono essere normali link HTML verso `/#work`, così il browser carica il documento completo.

## Aggiornare il sito

1. Partire dallo stato corrente del repository e conservare il riferimento al commit e al deployment precedenti.
2. Modificare la home in `public/one-man/`; mantenere i percorsi HTML degli asset sotto `/one-man/` e gli import JavaScript relativi.
3. Eseguire il controllo TypeScript e la build; verificare home, moduli JavaScript, immagini e route mantenute.
4. Pubblicare un branch di anteprima, attendere il completamento Vercel e verificarlo.
5. Aggiornare `main` solo dopo i controlli e senza sovrascrivere modifiche concorrenti. Verificare il deployment di produzione e il dominio reale.

Le modifiche possono essere pubblicate direttamente durante il lavoro su questo progetto, tramite il collegamento GitHub → Vercel già attivo. Il dominio non richiede una nuova configurazione DNS a ogni modifica.
Non sostituire la destinazione di produzione con una pubblicazione esclusiva su Sites.
Non conservare password, token o altre credenziali nel codice.

## Ripristino

La versione precedente all’introduzione di ONE MAN è il commit `1a441305c8cfc24d8cf08c4e06af95268da1cb50`.
Il deployment Vercel corrispondente è https://vercel.com/oneman-0b39/salvatore-cannavale-portfolio/6CqvFc8Z1f2gG3FHpTr3DhE1Z2Qy.
È possibile ripristinare il deployment precedente da Vercel oppure creare un nuovo commit che annulla la modifica; evitare di forzare la cronologia di `main`.

## Contatti e demo

Il modulo della home prepara una bozza email per `sasycannavale1999@gmail.com`; non invia né salva richieste sul server.
Velmora è esplorabile direttamente da `/velmora/index.html`, una copia statica pubblica in `public/velmora/`. La scheda progetto apre tour 3D e configuratore in una nuova scheda; il pulsante separato “Il caso studio” apre i dettagli. Il Site originale resta gestito separatamente. La demo non richiede login né invia richieste: preferenze nel browser e riepilogo scaricabile.

VANTA è il secondo progetto del portfolio. La demo pubblica autonoma risiede in public/vanta ed è collegata da /vanta/index.html; il Site originale mantiene il suo accesso privato. Tariffe e condizioni illustrative, garage nel localStorage, driving pass locale; nessun invio, pagamento o disponibilità reale.

LUNÉA è il terzo progetto del portfolio. La card e il caso studio sono nella home `public/one-man/index.html`, con immagine `public/projects/lunea.jpg`. La demo autonoma deve essere copiata dal `dist` finale di `work/lunea-atelier` in `public/lunea/` e viene aperta da `/lunea/index.html`, senza login. Conservare gli asset e gli import relativi, controllare tutti i percorsi prima della pubblicazione e mantenere separato il Site originale. Collezione e prezzi dimostrativi, configurazioni e selezione salvate nel browser; nessun ordine o pagamento reale.

## Raccolta ampliata — 30 ottobre 2026

La home conserva VELMORA, VANTA e LUNÉA e aggiunge 16 progetti in una raccolta filtrabile. Schede e dialog in `public/one-man/index.html`, dati in `projects-data.js`, interazioni in `projects.js`, immagini locali WebP in `assets/projects/`. Crediti e limiti in `public/one-man/PROJECTS.md`.

Le 16 nuove demo usano gli indirizzi Sites esistenti, resi pubblici su autorizzazione esplicita del proprietario il 30 ottobre 2026. I visitatori possono aprire i progetti senza account. Le tre demo originali sul dominio restano indipendenti. L'accesso pubblico delle nuove demo è confermato tramite Sites; il campo `access` in `projects-data.js` riflette tale stato.

## Copie delle demo sul dominio

Su richiesta del proprietario, NØ/STATIC, MORSO, AEVUM, FORGIA e OMBRA sono stati rimossi dalla raccolta. Gli 11 progetti aggiunti rimanenti sono pubblicati come copie statiche sotto `public/demos/`, oltre alle tre demo originali VELMORA, VANTA e LUNÉA. I progetti sorgente restano separati. Le esportazioni Next.js hanno un `basePath` dedicato; i rewrite `afterFiles` in `next.config.ts` risolvono le pagine interne senza intercettare asset esistenti. MARÉ e BLACK LABEL sono anteprime statiche: richieste e prenotazioni non vengono inviate. ÉTERNA è in modalità demo. Le copie non sostituiscono un backend di produzione.

## Proposte di redesign

Rent Car Station e A&J Rent Car sono presentati separatamente dai concept originali. I sorgenti delle due demo e i passaggi di build sono in `demo-sources/README.md`; i rispettivi casi studio sono `/demos/rent-car-station/progetto/` e `/demos/aj-rent-car/progetto/`. Le proposte sono indipendenti, non ufficiali e non affiliate alle aziende.

Le proposte indipendenti non compaiono nella homepage: la pagina `/proposte` viene riscritta a `public/one-man/proposte.html` ed è raggiungibile dal menu. Le due demo usano collegamenti HTML diretti per evitare richieste RSC fra applicazioni statiche ospitate sotto il portfolio.


## FUOCO — Fasi 1 e 2

FUOCO vive nello stesso progetto Next.js alle route `/fuoco`, `/fuoco/menu`, `/fuoco/storia` e `/fuoco/contatti`. Mantenere il rewrite della home ONE MAN e le altre demo. Configurazione del locale, limiti demo, dati da richiedere e personalizzazione sono documentati in [FUOCO.md](FUOCO.md).

Prima di una pubblicazione eseguire `npm run lint:fuoco`, `npm run test:fuoco`, `npm run typecheck` e `npm run build`, poi verificare in anteprima le quattro pagine, filtri, schede, contatti configurati, SEO e route preservate. Installazione Vercel `npm ci`, framework Next.js, build `npm run build`, output automatico; nessun segreto o servizio backend aggiuntivo richiesto. Seguire il collegamento GitHub → Vercel già configurato e il flusso di anteprima/produzione descritto sopra.

Il concept resta demo e noindex finché i dati reali non sono confermati. Nessun deploy di FUOCO è stato eseguito durante la consegna locale delle due fasi. La pubblicazione dello snapshot dell’ambiente cloud è un’operazione separata.


## FUOCO nella raccolta ONE MAN

La home include FUOCO come concept Food con anteprima locale, card, dialog e selezione nella roulette. Entrambi gli ingressi aprono `/fuoco` sul dominio del portfolio; nessun link GPT/Sites. Totali aggiornati: tre progetti in evidenza e dieci nella raccolta (tredici nella roulette), con due Food; redesign separati in `/proposte`. Dati in `public/one-man/projects-data.js`, markup in `public/one-man/index.html`, anteprima in `public/one-man/assets/projects/fuoco.webp`.

La pubblicazione autorizzata usa il branch `main` del progetto Vercel esistente. Il collegamento finale è `https://www.salvatorecannavale.it/fuoco`. Stato effettivo di promozione e verifica remota riportati in PROGRESS.md; il blocco di rete del cloud non deve essere confuso con un errore del sito.

## Aggiornamento — 16 novembre 2026

VELAR, KÍNETIC e VÉRA sono copie statiche indipendenti alle route `/demos/velar/`, `/demos/kinetic/`, `/demos/vera/`. Le build usano un basePath dedicato; gli asset sono locali e i rewrite afterFiles risolvono le pagine interne. Sorgenti e ricostruzione in `demo-sources/`. L’accesso dei Sites originali è preservato. La raccolta conta tredici concept, sedici progetti originali totali nella roulette; redesign ancora separati.

VELMORA conserva il proprio URL e riceve il dist aggiornato del Site, senza modificare VANTA, LUNÉA o le route OPERAI/FUOCO.

## Nuova apertura — 16 novembre 2026

La homepage sostituisce scultura, loader e roulette con una presentazione tipografica a tre capitoli. `entrance.js` applica l’avanzamento allo scroll nativo tramite CSS e un frame su richiesta, senza wheel interception né WebGL. Nero/arancio, passaggio a pieno schermo e presentazione di Salvatore; griglia e casi studio preservati. Senza JavaScript e con movimento ridotto i capitoli sono impaginati in sequenza normale; “Vai ai progetti” resta disponibile durante l’animazione. Le demo dei singoli progetti non cambiano.

## Fluidità delle demo — 16 novembre 2026

La raccolta contiene dieci progetti dopo la rimozione di LUNÉA, NOIR e VANTA; vecchi URL preservati. MENU non è più scritto nel pulsante di navigazione, che conserva etichetta accessibile e area touch.

Le copie esportate VELAR/KÍNETIC/VÉRA sono ricompilate dai sorgenti locali ottimizzati, disponibili negli archivi `demo-sources/`. KÍNETIC usa un canvas con decodifica ridotta (960/480 px), scritture diagnostiche solo in modalità debug, pausa del rendering fuori schermo e a scheda nascosta. VÉRA usa lo scroll nativo e non carica Lenis. VELAR alleggerisce blur e filtri sulle chiavi per dispositivi touch. Rimossi i vecchi chunk generati prima di copiare i nuovi export. Nessun aggiornamento ai Sites originali.

## DIMORA MIA — 17 novembre 2026

La raccolta cinematografica include DIMORA MIA come tredicesimo progetto. Apri sito e anteprima interattiva usano `/demos/dimora-mia/`, una copia locale in `public/demos/dimora-mia/`: nessun iframe, redirect o endpoint Sites/ChatGPT. Font, fotografie e librerie sono locali. La route `/demos/dimora-mia/admin.html` è un pannello di simulazione di questo browser, non un pannello protetto.

La copia portfolio usa localStorage per simulazioni esplicitamente etichettate, senza disponibilità condivisa, pagamento o email. Il backend originale con database e Stripe è conservato, non attivato né sostituito da un finto server. Il Site originale rimane invariato. Ricostruzione e limiti in `demo-sources/dimora-mia/PORTFOLIO.md`.

Sorgente della home aggiornato in `portfolio-source/one-man-source.zip`; `lib/restored-projects.ts` contiene la nuova scheda. Le route esistenti e le altre dodici demo restano preservate.

## CASA MIA — aggiornamento del nome

Il concept hospitality è rinominato CASA MIA nella demo, nel menù, nei metadati, nella copertina e nella raccolta del portfolio. Il percorso `/demos/dimora-mia/` e la chiave di archivio locale sono conservati per mantenere validi i collegamenti e le simulazioni esistenti.

## CASA MIA — app proprietario e inventario condiviso

L'app installabile è alla route `/casa-mia/gestione`; API nello stesso dominio sotto `/api/casa-mia/`. Lo schema PostgreSQL è dedicato e richiede configurazione esterna esplicita. Nessuna variabile o risorsa è stata configurata automaticamente. Il flag di abilitazione è inizialmente assente: il sito rimane una demo locale, mentre l'app permette soltanto una dimostrazione esplicita con dati sintetici. Quando configurato, il sito usa lo stesso inventario transazionale dell'app e non ripiega su record locali in caso di errore del servizio. Hero e regia del sito restano invariati.

Manifest, icone e service worker sono limitati a `/casa-mia/`; i dati degli ospiti e le API non vengono messi in cache. Non è un'app degli store. I canali esterni non sono sincronizzati. Configurazione, test, limiti e requisiti per il lancio commerciale in `CASA-MIA.md`.

## CASA MIA — gestione v2

Interfaccia proprietario riorganizzata in cinque aree, blocchi e accordi manuali fino a 365 notti, controllo preventivo dei conflitti, modifiche con revisione, registro incassi/rimborsi, storico e CSV filtrato. Migrazione additiva `002_owner_operations.sql`, applicata da `npm run db:casa-mia`; il servizio richiede schema v2 prima di essere abilitato. Nessun database o pagamento esterno attivato automaticamente. La demo persistente dell’app ora condivide i blocchi con la demo del sito nello stesso browser, senza modificare la regia del sito. Dettagli e limiti in `CASA-MIA.md`.

## CASA MIA — edizione telefono v3

Nuovo ingresso compatto, riapertura della demo, estremi calendario visibili anche tra mesi, eliminazione dell’approvazione manuale per le prenotazioni con pagamento in struttura, checklist operativa e file ICS per il calendario del telefono. Pannello installazione con prompt nativo quando disponibile e istruzioni Safari/Chrome; scorciatoie nel manifest. Migrazione aggiuntiva `003_stay_operations.sql`, richiesta dall’endpoint di stato; conferma soltanto i vecchi record pending/arrival, con storico, e preserva Stripe in attesa. Configurazione esterna ancora disabilitata: nessun dato reale o pagamento attivato durante il deploy. Dettagli in `CASA-MIA.md`.

## CASA MIA — email e ricevute v4

Migrazione `004_receipts_outbox.sql`, ricevute PDF non fiscali da webhook Stripe test verificato, coda email persistente e worker autenticato `/api/casa-mia/jobs/email`; chiave `CASA_MIA_MAIL_JOB_SECRET` e scheduler esterno da configurare. Download dei PDF solo con sessione proprietario. Checkout idempotente, recuperabile dopo timeout e limitato all’host Stripe. Tutte le API condivise richiedono schema v4. Nessun account Stripe, IBAN, pagamento live, mittente email o scheduler attivato automaticamente. Dettagli operativi e limiti in `CASA-MIA.md`.

## CASA MIA — installazione visibile e avvisi in primo piano

Oggi senza mini calendario duplicato; pulsante Installa app nella barra mobile e scheda dedicata, link `/casa-mia/gestione?install=1` e istruzioni Android/Chrome con copia indirizzo. Avviso nell’interfaccia per nuovi soggiorni diretti confermati, con lettura e deduplicazione per sessione. Nessuna migrazione aggiuntiva, nessun servizio push o permesso OS attivato; API ancora schema v4 e configurazione reale disabilitata.

## CASA MIA — predisposizione Web Push v5

Nuove tabelle `push_devices`/`push_outbox`, sottoscrizioni proprietario autenticate, VAPID server, worker protetto `/api/casa-mia/jobs/push` e service worker per notifiche generiche/click interno all’app. Migrazione aggiuntiva 005, schema minimo API v5. Variabili e istruzioni in `CASA-MIA-ATTIVAZIONE.md`. Database, VAPID e scheduler ancora da configurare; la demo offre soltanto una prova locale esplicita. Non attivare il flag condiviso prima della migrazione e del collaudo con i servizi reali. Nessun segreto o database esterno creato durante lo sviluppo.

## CASA MIA — collegamento Neon per il collaudo condiviso

Creata risorsa Neon Free `casa-mia`, regione fra1, prefisso CASA_MIA, collegata soltanto a Production. Migrazioni 1–5 applicate via SQL HTTPS. Password proprietario Secret salvata dal proprietario, chiavi push/worker e flag condiviso configurati in Vercel. Nessun valore sensibile nel repository. Il deploy successivo deve verificare API enabled/schema 5 e protezione admin; anteprima ancora in demo. Pool PostgreSQL con SET LOCAL search_path per ogni transazione; migrazioni atomiche con opzione --http per Neon. Nessun upgrade del team Hobby o cron incompatibile aggiunto; commercializzazione, email, Stripe e scheduler restano separati.

## CASA MIA — verifica produzione e separazione demo

API condivise verificate sul dominio: schema 5, enabled true, disponibilità/preventivo 200, admin anonimo 401. Accesso Android confermato dal proprietario. Demo locale selezionabile esplicitamente con ?demo=1 e collegamenti coerenti fra sito/app; suite browser confinata alla demo. Push configurato ma prova fisica da confermare; email, Stripe e scheduler non attivati. Nessun piano a pagamento acquistato.

## DIMORA MIA — nome definitivo

Ripristinato DIMORA MIA nel sito, nella scheda portfolio, nell'app proprietario, nel manifest Android, nelle icone DM, nei messaggi push e nei modelli email/ricevuta. Cache statica PWA aggiornata a v3 per sostituire icone e pagina offline. URL /casa-mia/, identificativo manifest, archivio, sessioni e configurazione CASA_MIA_* preservati per mantenere l'app installata e i dati esistenti. L'aggiornamento dell'etichetta sul launcher dipende dai tempi di Chrome/Android.

## DIMORA MIA — gestione essenziale e centro notifiche

Oggi sostituisce Panoramica, azioni principali sempre disponibili, centro notifiche persistente con stato verificato sul dispositivo (permesso, sottoscrizione locale, telefono attivo e chiave corrente sul server). Ricontrollo al ritorno in app, alla connessione e dopo la chiusura del pannello. Nessuna richiesta automatica di permesso. Installazione mostrata nella scheda soltanto quando non standalone; demo raccolta in un dettaglio nell'accesso, storico invii/dispositivi espandibile. La vista scelta sopravvive al ricaricamento tramite ?view=.

Invii nuove prenotazioni eseguiti con Next after dopo la risposta; quattro worker limitati a tre messaggi coprono i dieci telefoni supportati. Coda transazionale e deduplicazione preservate; errori di consegna non fanno fallire una prenotazione salvata. Il worker protetto resta disponibile per retry, ma il servizio periodico esterno non è configurato. Il pulsante prova server rimane immediato. Stripe resta test, email non configurata; nessun piano commerciale acquistato. Non dichiarare ricezione fisica delle push finché il proprietario non la conferma.

Verifiche aggiunte: prenotazione con quattro telefoni e invio dopo risposta; script browser test-push-status.mjs con API simulate verifica revoca server, permesso negato, servizio irraggiungibile, stato attivo e layout installato. Nessuna prenotazione reale creata dai test.

## DIMORA MIA — attivazione push senza attese infinite

Diagnostica produzione: due prenotazioni dirette, zero dispositivi push attivi e nessun invio in coda al momento del controllo. Il consenso OS non equivale a una sottoscrizione salvata. Registrazione service worker (compresa register, prima non limitata), lettura/rimozione sottoscrizione, consenso, sottoscrizione Android e chiamate API del pannello ora hanno scadenze esplicite. L'interfaccia indica la fase corrente e torna utilizzabile in caso di timeout. Una sottoscrizione nativa completata dopo il timeout viene recuperata al tentativo seguente; non vengono dichiarati attivi avvisi senza conferma server. Test browser test-push-activation.mjs simula subscribe bloccata, uscita dal caricamento, recupero tardivo e prova server, senza dati reali. Ricezione fisica ancora da verificare con il proprietario.

## DIMORA MIA — worker realmente attivo prima della sottoscrizione

Prova Chromium sul dominio reale senza mock: register/ready possono restituire un worker in stato activating. La sottoscrizione ora attende esplicitamente activated, con listener puliti e scadenza. Tentativi contemporanei riutilizzano un'unica richiesta nativa pendente per chiave VAPID. Test mirati browser-push.test.mjs verificano attesa e single-flight; il test UI di attivazione conserva la prova di recupero dopo timeout. Segnalazione proprietario: Samsung S26 Ultra, app installata, attesa nel servizio Android; ricezione fisica ancora non confermata. Nessuna configurazione o autorizzazione Android viene presunta attiva dal solo consenso del sito.

## DIMORA MIA — diagnostica attivazione dal telefono

Endpoint POST admin/push/diagnostic protetto dalla sessione proprietario e dall'Origin, massimo venti eventi/minuto per sessione. Log tecnico DIMORA_MIA_PUSH_DIAG con soli enum allowlist: fase, permesso, famiglia browser, classe di errore e booleani standalone/online/userActivation. Nessun endpoint push, chiave, cookie, UA completo o testo arbitrario incluso. L'app invia il controllo all'apertura del pannello e durante l'attivazione senza attendere la diagnosi prima del consenso; errori visibili in alto. Lettura log tramite CLI Vercel verificata. Test autenticazione, redazione e rate limit passati; non equivale a ricezione push sul dispositivo. Nessuna migrazione o nuova risorsa esterna.

## DIMORA MIA — esito reale del controllo Samsung

Log del proprietario: browser=samsung, standalone=true, online=true, userActivation=true, permission=default; fallimento nella fase consent. Quindi la copia installata proviene da Samsung Internet e la richiesta non raggiunge la registrazione server; non attribuire il problema a un permesso Chrome o a un invio già effettuato. Nuova scheda contestuale in Notifiche (consenso non concesso) e Installazione con intent Android esplicito package=com.android.chrome e fallback HTTPS. Spiega che i permessi dei browser sono distinti e che in Chrome serve accedere con la password, verificare la prova server e solo dopo installare quella copia dalla Home. Samsung Internet non è dichiarato universalmente incompatibile. Test user agent Samsung/Chrome verifica comparsa condizionale e URI; apertura nativa e ricezione fisica restano da confermare sul Samsung.

## DIMORA MIA — APK Android privato 1.0.0

Nuovo progetto `android-owner/`: app nativa Java, package it.dimoramia.owner, Android 8+, nessuna WebView/TWA/Chrome. Release firmata RSA 3072/v2, circa 2 MB, download pubblico sullo stesso portfolio `/casa-mia/downloads/dimora-mia.apk`, istruzioni `/casa-mia/android.html`, hash e metadati accanto all'APK. Password proprietario esistente, cookie di sessione cifrato in Android Keystore, dati ospite solo in memoria, nessuna importazione di demo.

Migrazione additiva 006 applicata al Neon di produzione via SQL HTTPS: schema massimo 6; dati web e inventario preservati. API web mantengono compatibilità con il requisito v5. Token e coda FCM separati, registrazione autenticata/Origin e limiti dispositivi; nuovi soggiorni confermati scrivono la coda nella stessa transazione dell'inventario. Worker after/secret condiviso può riprendere web e nativo; retry periodici esterni ancora da configurare. Disconnessione revoca il dispositivo selezionato. I test verificano auth, riservatezza token/credenziali, deduplica, revoca e annullamento.

Firebase NON ancora configurato: il proprietario ha confermato che il progetto va creato e ha ricevuto la guida per Spark/Analytics disattivato. Nessuna credenziale di servizio o Firebase Android configuration è stata inventata né inserita automaticamente. L'APK sa ricevere la configurazione pubblica dal server dopo il login e potrà attivare FCM quando le due variabili descritte in android-owner/README.md saranno configurate. Non promettere notifiche native già ricevute, pagamenti live, email o uso commerciale su Hobby.

Build release, firma apksigner, JUnit e schermate Activity con Robolectric, lint Android e suite backend eseguiti. Non equivalgono a installazione/prova fisica sui telefoni. Chiave di firma privata fuori repo in /workspace/private/dimora-android, con backup privato da conservare dal proprietario prima di eliminare l'ambiente. GitHub Secrets non disponibili al token tecnico: nessuna falsa promessa di backup remoto. Dettagli e procedura aggiornamenti nel README Android. Pubblicazione autorizzata tramite preview → main, preservando l'attuale main d22b52d e tutti i progetti del portfolio.

## DIMORA MIA — APK 1.1.0, versionCode 3

Nuovo monogramma DM approvato, risorsa launcher adattiva/rotonda, avvio Android 12+ e marchio in accesso/intestazione. Navigazione con icone native e stati accessibili. Feedback ripple/pressione e ingressi brevi 90–190 ms; nessuna animazione di sfondo o sui refresh, animazioni disattivate rispettate e verificate. Home senza riquadro notifiche; configurazione avvisi ancora in Regole.

Agenda dei prossimi sette giorni con partenze prima degli arrivi nella stessa data, filtri locali dei soggiorni, priorità ai soggiorni attuali/futuri e ricerca su tutti i dati caricati con massimo 100 righe visibili. Classificazione stati allineata al backend: scadute/fallite/da verificare non diventano confermate o inventario attivo. Torna a oggi nel calendario; promemoria esplicito nell'app calendario del telefono tramite ACTION_INSERT, all-day UTC con fine esclusiva, senza scrittura automatica o sincronizzazione promessa. Scroll preservato durante i refresh e niente ricostruzione se i dati non cambiano; orario mostrato è quello dell'ultimo aggiornamento effettivo.

Release firmata con la stessa chiave/certificato della 1.0, aggiornamento sopra la copia esistente. APK, hash, metadati e pagina download aggiornati sullo stesso URL. Test JUnit/Robolectric su importi, stati/filtri, sette giorni e cambio ora, Home senza notifiche, calendario, riduzione movimento e Intent promemoria; lint e firma verificati. Le prove fisiche sul telefono restano del proprietario. Nessuna migrazione, credenziale o configurazione Firebase modificata: notifiche native ancora da configurare, non dichiararle attive con questo aggiornamento grafico.

Verifica aggiuntiva 1.1.0 (build 3): l’agenda viene ricostruita quando cambia il giorno a Roma anche se il JSON server è identico; il resto dei refresh resta senza animazioni o salto dello scroll.

## DIMORA MIA — APK 1.2.0, versionCode 4

Accesso biometrico opzionale nativo con CryptoObject e credenziale server casuale cifrata per uso tramite Android Keystore; password alternativa. Blocco in background, dati rimossi dalle viste, FLAG_SECURE e guardia di generazione sulle risposte asincrone. Revoca server di tutte le sessioni biometriche collegate, durata credenziale 90 giorni, invalidazione al cambio password/segreto. Nessuna impronta o password salvata. Migrazione additiva 007 applicata a Neon; CASA_MIA_NATIVE_AUTH_SECRET configurato sensibile in Production, valore fuori repository.

Nuovo stile verde profondo/avorio/champagne e indicatore Canvas con lifecycle/reduced-motion. APK stessa firma originale e package, aggiornabile senza disinstallare. Test Android 14, backend 64, lint e build release; riconoscimento fisico Samsung resta da provare. Firebase, email, Stripe live e retry periodici mantengono le limitazioni già documentate.

## DIMORA MIA — APK 1.3.0, versionCode 5

Rientro entro dieci minuti di background senza nuova biometria: finestra soltanto in memoria del processo, clock monotono, logout/revoca/riavvio processo e Blocca adesso invalidano l’accesso. Dati riletti al rientro e guardie sulle risposte precedenti preservate, compreso login password alternativo. Nessun servizio permanente per tenere sveglia l’app.

Notifiche FCM notification+data visualizzabili dal sistema anche con processo non attivo, contenuto generico e tag evento stabile. Apertura del soggiorno dopo autenticazione. Riconciliazione token al rientro su consenso già dato, disattivazione/sostituzione vecchio dispositivo, canale Android controllato con link diretto alle impostazioni, ultimi invii e revoca da Regole. Il server accetta google-services.json originale selezionando soltanto it.dimoramia.owner.

20 test Android e 66 backend, lint/release e build web passati. Stessa firma e package, aggiornamento sopra l’APK esistente. Progetto Firebase e app Android registrati dal proprietario; al momento della preparazione della release le due variabili Firebase Production non risultano salvate. Non dichiarare attive o ricevute le notifiche prima della configurazione e della prova fisica. Retry periodico esterno ancora da configurare; coda persistente e worker protetto restano disponibili. Nessuna migrazione DB, modifica ad altri progetti o piano a pagamento introdotti.

## DIMORA MIA — prenotazione diretta e raccordo cinematografico

Hero e navbar indicano Prenota dal sito; scorciatoia fissa durante l’esplorazione, nascosta nella sezione prenotazione e nei dialoghi. La scena finale notturna introduce il soggiorno; ingresso della scheda e reveal architettonici delle immagini collegati allo scroll tramite GSAP, reversibili e disattivati con movimento ridotto. Campi, calendario, stati e totale ridisegnati con caratteri più leggibili; simboli principali disegnati per evitare emoji di sistema. Fotografie ancora dichiarate dimostrative.

Percorso esplicito date → totale → prenotazione. Estremi calendario etichettati Arrivo/Partenza e partenza consentita su notte occupata soltanto come confine esclusivo. Risposte calendario fuori ordine e preventivi divenuti obsoleti ignorati. Focus spostato sui dati al checkout e restituito tornando alle date. Disponibilità, totale e registrazione continuano a usare le API condivise; nessuna modifica a database, app Android o credenziali. Ambiente test pagamenti ed email da configurare indicati correttamente; privacy distingue archivio condiviso e demo locale.

Verifica browser con API simulate su 1440, 390 e 360 pixel: intero percorso fino al riferimento, totale server, scorciatoia/dialoghi, inversione dello scroll, confine calendario, risposta preventiva obsoleta, movimento ridotto. Audit WCAG della prenotazione mobile senza violazioni. Nessuna prenotazione reale creata. Dodici test del progetto demo, controllo asset/collegamenti e build/typecheck Next passati. Home e altri progetti preservati; pubblicazione preview → main con verifica finale sul dominio.

## DIMORA MIA — sito essenziale e luce nello scroll

Rimossi pulsante Esplora e relativo dialogo/codice, monogramma stellato e asterischi decorativi in hero, manifesto, filosofia e servizi. CTA principali abbreviate in Prenota. Prenotazione compatta con titolo su una riga, una spiegazione breve e date subito visibili; rimossa la lista verticale dei tre passaggi e la fiducia duplicata, preservate le informazioni sull’ambiente test. Titolo scheda Date e ospiti e ancoraggio coerente con la navbar.

Arco della luce SVG con punto che segue la curva, fasi La luce/L’ora dorata/La quiete collegate alla timeline reversibile. Tolto filtro fotografico animato per ridurre i costi di rendering; composizione cielo/luci mantenuta. Scrub più reattivo, percorso mobile più breve e nessuna ricostruzione della regia per i soli cambi di altezza della barra del browser mobile. Motion ridotto rispettato; nessuna nuova dipendenza.

Suite browser aggiornata per galleria senza menù, compattezza mobile sotto 250px, curva della luce reversibile, date/prezzo/checkout, tre viewport e audit della prenotazione senza violazioni. Dodici test demo, asset/collegamenti, typecheck e build passati. Nessuna prenotazione reale creata o modifica alla gestione, al database, ad Android o agli altri progetti.
