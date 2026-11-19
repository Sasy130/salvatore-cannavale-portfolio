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
