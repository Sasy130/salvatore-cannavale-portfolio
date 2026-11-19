# CASA MIA — Prenotazioni e app proprietario

App: https://www.salvatorecannavale.it/casa-mia/gestione
Sito: https://www.salvatorecannavale.it/demos/dimora-mia/

## Stato di questa consegna

Terza versione installabile della gestione proprietario, con interfaccia dedicata desktop e telefono. In assenza delle credenziali mostra un pulsante esplicito per esplorare dati sintetici; quella demo non crea account, richieste reali o pagamenti e resta salvata su questo dispositivo fino al ripristino esplicito. Nessun database è stato creato o configurato automaticamente su account esterni. Il sito mantiene il proprio aspetto e la simulazione locale finché il servizio condiviso non viene abilitato.

Il backend condiviso è implementato per PostgreSQL, con transazioni e vincolo univoco su ogni notte. L'app e il sito usano le stesse tabelle dello schema dedicato `casa_mia`, senza passare da ChatGPT/Sites. Il server calcola tariffe, minimi, pulizia e totale. Le prenotazioni manuali, i blocchi e le richieste dirette competono per il medesimo inventario: la collisione annulla l'intera transazione. La riapertura dei blocchi e le cancellazioni liberano le notti. Gli inserimenti manuali sono confermati subito e non inviano email o addebitano pagamenti.

## Funzioni dell'app

- Oggi: soggiorni in corso, arrivi e partenze ancora da registrare, prossimi ospiti.
- Calendario mensile, dettaglio per data e lista filtrabile.
- Conferma automatica delle prenotazioni con pagamento in struttura; annullamento e indicazione dei rimborsi da gestire, senza fingere rimborsi automatici.
- Inserimento manuale di prenotazioni, contatti e note interne; eventuale totale concordato dal proprietario.
- Blocchi per manutenzione o uso personale; fino a 365 notti per inserimento manuale. Il sito conserva il limite di 30 notti per richiesta.
- Tariffe base/stagionali, minimi, pulizia, acconto e modalità di pagamento.
- Aggiornamento ogni 30 secondi mentre l'app è visibile, e al ritorno in primo piano. Non sono notifiche push e non viene promessa una sincronizzazione continua in background.
- PWA: aggiungibile alla schermata Home da Safari/Chrome, senza pubblicazione sugli store. Serve internet per il calendario condiviso. Il service worker salva solo la pagina offline e le icone: non archivia risposte API, HTML autenticato o dati degli ospiti.

## Gestione professionale v2

Cinque aree: Panoramica, Calendario, Prenotazioni, Incassi e saldi, Impostazioni. Calendario con selezione intervallo anche tra mesi, date passate non selezionabili e checkout esclusivo: “Blocca dal / Riapri il”. Inserimenti e modifiche passano da un riepilogo con conflitti prima della conferma. Revisioni e blocchi di riga proteggono dalle modifiche concorrenti; un conflitto annulla la modifica senza perdere il periodo precedente.

Ricerca per ospite/contatto/riferimento, filtri combinati per stato, canale e intervallo, CSV dei soli risultati con protezione dalle formule. Prenotazioni manuali fino a 365 notti e totale concordato; le regole minime del sito non impediscono accordi manuali. Capacità e sovrapposizioni restano controllate.

Incassi e rimborsi sono registrazioni di operazioni già eseguite: non muovono denaro e non emettono ricevute fiscali. Stato del soggiorno e saldo sono separati; incassi eccedenti e rimborsi oltre il registrato sono respinti. Annullamenti con importi registrati entrano nella revisione rimborsi. Storico operazioni e comandi idempotenti. Prenotazioni Stripe pagate non sono riscrivibili come semplici accordi manuali.

La demo dell’app e quella del sito condividono i dati **solo nello stesso browser e origine**: blocchi fino a 365 notti chiudono il calendario del sito, richieste dal sito compaiono nell’app. Persistenza locale, controllo tramite Web Locks dove disponibile e ripristino esplicito dalle impostazioni; non è sincronizzazione tra dispositivi. Usare solo dati inventati. In modalità reale il database è l’unica fonte condivisa.

## Configurazione necessaria prima dell'uso condiviso

Nel progetto Vercel esistente impostare come segreti, senza inserirli nel repository o inviarli in chat:

- `CASA_MIA_DATABASE_URL`: stringa di connessione PostgreSQL con TLS, preferibilmente endpoint con pooling per ambiente serverless.
- `CASA_MIA_ADMIN_PASSWORD`: password proprietario lunga e unica, almeno 12 caratteri.
- `CASA_MIA_ENABLE_BOOKING=true`: abilita il collegamento di sito e app, solo dopo la migrazione e il collaudo.

Applicare lo schema iniziale e le migrazioni aggiuntive v2, v3 e v4 da un ambiente sicuro con la stringa di connessione disponibile:

```sh
npm run db:casa-mia
```

Il comando esegue una transazione, crea solo lo schema dedicato e non inserisce prenotazioni dimostrative. La migrazione v2 aggiunge revisioni, registro incassi, storico e idempotenza delle operazioni, preservando lo schema iniziale. In futuro usare migrazioni aggiuntive versionate; non modificare uno schema già applicato. Dopo una modifica ai segreti effettuare il deploy Vercel.

Endpoint di stato: `/api/casa-mia/status`. Non restituisce segreti. Il backend deve avere credenziali, flag e migrazione corretti prima di risultare abilitato. Se si richiede l'abilitazione ma il database è indisponibile, il sito mostra un errore e non salva prenotazioni di ripiego nel browser.

## Pagamenti e comunicazioni

Opzionali, in ambiente di prova:

- `CASA_MIA_STRIPE_SECRET_KEY`: **solo chiave `sk_test_...`**.
- `CASA_MIA_STRIPE_WEBHOOK_SECRET`: endpoint `/api/casa-mia/stripe/webhook`, evento `checkout.session.completed`.
- `CASA_MIA_RESEND_API_KEY` e `CASA_MIA_MAIL_FROM`: mittente verificato per le email.

Checkout Stripe nasce sul server, il webhook verifica firma, timestamp, sessione, importo, valuta e modalità test. Il ritorno del browser non conferma un pagamento. Sono gestiti lock temporanei, stati scaduti ed eventi tardivi da revisionare. Il saldo dell'acconto e i rimborsi restano manuali. Nessun pagamento reale è attivato in questa consegna.

Le email restano comunicazioni di prova. La migrazione v4 introduce una coda persistente e idempotente, descritta sotto: occorrono ancora mittente verificato, scheduler e collaudo del provider prima dell’uso reale.

## Accesso e dati

Sessione proprietario con cookie HttpOnly, SameSite Strict, Secure su HTTPS, scadenza di 8 ore. Il database conserva l'hash del token, non il token del cookie. Limite ai tentativi di login, massimo cinque nuove richieste pubbliche per IP ogni ora e controllo Origin sulle mutazioni. Le richieste idempotenti non consumano una seconda prenotazione. Nessuna password predefinita, nessun segreto nel frontend. La demo pubblica dell'app usa esclusivamente dati sintetici separati. I record del vecchio pannello locale non vengono importati automaticamente: non rappresentano prenotazioni vere.

Prima di usare dati reali: backup e ripristino PostgreSQL, controllo degli accessi al database, conservazione/cancellazione dei dati, informative, condizioni, tariffe e fuso orario della struttura da concordare. Autenticazione a più fattori e più account non sono implementati in questa prima versione.

## Booking.com e Airbnb

**Nessuna sincronizzazione OTA implementata o dichiarata attiva.** Le etichette di canale nell'inserimento sono solo annotazioni manuali. Prima di accettare vendite simultanee serve sapere quali canali il proprietario utilizza e collegare un channel manager o un'integrazione autorizzata. iCal è periodico e non elimina da solo il rischio di doppia vendita tra canali; il blocco atomico di questa applicazione protegge solo le richieste che passano dal suo database.

## Verifica

`npm run test:casa-mia`: test del motore su PostgreSQL PGlite (motore PostgreSQL in memoria), transazioni, collisioni, sessioni hashate, Origin, inserimenti manuali, blocchi, idempotenza e webhook firmato/importo. Non sostituiscono un test di carico multi-istanza sul database ospitato. `npm run typecheck` e `npm run build` controllano l'integrazione Next.js. `npm run test:dimora` mantiene i controlli della demo precedente.

Il runner browser locale verifica desktop e telefono emulato (script `npm run test:casa-mia:ui`, server locale e browser Playwright richiesti; `CASA_MIA_TEST_BROWSER` permette di indicare Chromium di sistema). Screenshot e audit sono generati in `outputs/casa-mia-v3/`, esclusi dal repository. L’installazione su telefoni fisici non è verificata. Stripe ed email non sono stati collaudati contro account esterni, perché non configurati.

### Esito collaudo v2 — 19 novembre 2026

20 test del motore proprietario/PostgreSQL e 12 della demo ospiti superati; typecheck e build di produzione completati. Chromium desktop 1440×1000 e telefono emulato 390×844: blocco 45 notti, conflitto modifica respinto, disponibilità della demo sito chiusa, incasso 100,50 € e residuo aggiornato, CSV filtrato, persistenza, blocco touch, istruzioni installazione ed Escape verificati. Nessun errore JavaScript rilevato; nessuna violazione automatica WCAG A/AA negli audit di panoramica desktop/mobile e riepilogo blocco mobile. Gli audit non equivalgono a una certificazione completa di accessibilità.

## Edizione proprietario v3 — ingresso e uso sul telefono

Ingresso compatto con segno architettonico, azione principale visibile su telefono e nessuna introduzione obbligatoria. Dopo l’apertura esplicita, la demo riprende al successivo avvio nello stesso browser. “Esci dalla gestione” elimina la preferenza di riapertura, senza cancellare i dati della demo. Le sessioni reali restano esclusivamente cookie HttpOnly: nessun token reale nel localStorage.

Calendario: entrambi gli estremi sono selezionati e annunciati con `aria-pressed`; “Inizio” e “Fine” sono visibili anche sul telefono. Le notti riservate rimangono nell’intervallo [arrivo, partenza): evidenziare la partenza non chiude quella notte. La selezione resta coerente spostandosi tra mesi.

Il nuovo flusso non contiene “Da confermare” né l’interruttore di conferma manuale. Le richieste con pagamento in struttura sono confermate automaticamente sul server. Stripe conserva lo stato di attesa fino al webhook verificato; il soggiorno confermato non equivale a un pagamento ricevuto. La migrazione `003_stay_operations.sql` conferma le precedenti richieste `pending` con pagamento `arrival`, incrementa la revisione e registra lo storico, senza inviare email retroattive; i pagamenti in attesa non vengono confermati. Lo schema iniziale e la migrazione v2 sono preservati. Il servizio richiede la migrazione v3 prima di risultare pronto.

Ogni soggiorno confermato ha tre operazioni: casa pronta, check-in e check-out. Sono salvate sul server, autenticate, idempotenti, protette dalla revisione e registrate nello storico. Non anticipano arrivi futuri e richiedono il check-in prima del check-out; non liberano né spostano notti. Per correggere date di un soggiorno con check-in registrato occorre prima annullare le registrazioni operative. Spostare le date azzera la precedente preparazione della casa. La panoramica esclude dalle attività da registrare i check-in/check-out già segnati.

“Salva in calendario” esporta un file ICS con arrivo e partenza come giorni interi, UID stabile e protezione dei contenuti testuali. È una copia statica importabile dal calendario del telefono, non una sincronizzazione né un abbonamento iCal.

Installazione: la PWA espone il comando nativo quando Chrome rende disponibile `beforeinstallprompt`; altrove mostra le istruzioni iPhone/Safari e Android/Chrome. Rileva la modalità standalone e l’evento `appinstalled`, senza dichiarare un’installazione riuscita basandosi soltanto sul click. Manifest con scorciatoie Calendario/Prenotazioni (disponibilità dipendente dal sistema). Su iPhone l’archivio dell’app installata può essere separato da Safari. Restano necessari HTTPS e connessione per la gestione reale; nessuna API o pagina autenticata nella cache offline. Nessuna pubblicazione sugli store e nessuna installazione fisica eseguita sul telefono del cliente.

Test automatici del motore: 25 superati, inclusi conferma automatica con impostazioni precedenti, migrazione v3 senza confermare Stripe, operazioni concorrenti/revisioni e ICS. Collaudo browser desktop e telefono emulato comprende nuova entrata, estremi tra mesi, checklist, riapertura diretta, esportazioni, schermata installazione e prompt simulato; l’installazione sul dispositivo fisico resta da verificare. Database ospitato, account Stripe ed email reali restano da configurare prima dell’uso commerciale.

Esito browser v3: flussi completati senza errori JavaScript; nessuna violazione automatica WCAG A/AA negli otto audit di ingresso, panoramica, estremi calendario desktop/mobile, operazioni soggiorno desktop e riepilogo blocco mobile. Verificata anche la persistenza di casa pronta e check-in dopo il riavvio. Build Next.js e TypeScript completati. Questi controlli non sostituiscono il collaudo del telefono fisico né una verifica completa di accessibilità.

## Email, ricevute e checkout v4

La prenotazione pubblica con pagamento in struttura salva la conferma email **nella stessa transazione** delle date, poi tenta l’invio. Nessuna ricevuta di pagamento viene emessa per un soggiorno non pagato o un semplice incasso manuale. In modalità online la ricevuta viene creata soltanto dopo un webhook Stripe firmato, con sessione, prenotazione, importo server, valuta EUR, stato paid e modalità test corrispondenti. Un ritorno del browser non può emettere ricevute.

Ricevuta, aggiornamento del soggiorno e messaggio in coda sono atomici. Sessione Stripe univoca: webhook duplicati o concorrenti non duplicano la ricevuta né il messaggio. Eventi tardivi dopo scadenza/cancellazione finiscono in revisione senza occupare le notti di un altro ospite; l’email evidenzia che il soggiorno non è confermato. Il PDF A4 contiene riferimento, ospite, date, importo versato/acconto e saldo: **TEST, nessun incasso o accredito reale, documento non fiscale**. Testo HTML escapato e PDF statico senza JavaScript. I PDF sono allegati all’email e scaricabili dall’area proprietario autenticata, mai da un URL pubblico anonimo.

La scheda “Email e ricevute” mostra coda, tentativi, messaggi accettati dal provider e invii da verificare. “Accettata” non significa consegnata o letta; eventi di consegna/bounce del provider non sono ancora integrati. Il proprietario può anticipare il retry di un messaggio in coda, con le stesse protezioni di accesso e Origin; non può cambiare il destinatario o ripetere automaticamente un invio dubbio.

### Invio e recupero

`004_receipts_outbox.sql`, applicata da `npm run db:casa-mia`, aggiunge ricevute e coda. Tutte le API condivise richiedono ora schema v4. Chiave Resend e mittente verificato (`CASA_MIA_RESEND_API_KEY`, `CASA_MIA_MAIL_FROM`) si configurano come segreti in Vercel. Nessuna email demo viene inviata dal localStorage del portfolio.

Il worker usa claim transazionale con `FOR UPDATE SKIP LOCKED`, lease, timeout, massimo 8 tentativi e backoff. Idempotency-Key Resend ed envelope completo (mittente, testo e allegato) sono salvati prima del primo tentativo e restano stabili nei retry. Non cambiare account del provider con invii ancora pendenti. Dopo 23 ore dal primo tentativo ambiguo si passa alla revisione, prima della scadenza della finestra di idempotenza del provider: non si promette una consegna exactly-once oltre tale finestra. Errori permanenti richiedono verifica; conferme superate da un annullamento vengono scartate. Il database registra l’accettazione del provider, senza copiare risposte contenenti dati personali nei log.

Un tentativo avviene immediatamente dopo la prenotazione o il webhook. Per i retry automatici configurare **un job esterno ogni 5 minuti**, che chiami `POST /api/casa-mia/jobs/email` con `Authorization: Bearer <segreto>`. Generare un segreto casuale di almeno 32 caratteri e salvarlo come `CASA_MIA_MAIL_JOB_SECRET`, sia nel server sia nello scheduler; non inserirlo in URL, frontend, repository o chat. Ogni chiamata processa al massimo 3 email (timeout 8 secondi per richiesta), entro il budget serverless. Scheduler non creato né abilitato automaticamente; nessun cron Vercel incompatibile con il piano di hosting aggiunto. Senza scheduler gli invii falliti restano in coda fino al retry proprietario o a una nuova esecuzione del worker.

### Sicurezza del pagamento e accrediti

Checkout ospitato su `checkout.stripe.com`, solo HTTPS, importo calcolato dal server, carte gestite da Stripe e 3-D Secure automatico quando richiesto. La sessione è idempotente per prenotazione: un timeout ambiguo conserva le notti e il retry recupera la stessa sessione, senza creare un secondo checkout. Nessuna carta, CVC o IBAN dell’ospite viene gestito dall’app. Il backend continua a rifiutare chiavi live e webhook livemode=true durante questa fase.

Il proprietario ha confermato di **non avere ancora Stripe**. Deve creare e verificare un account intestato a lui/alla sua attività, inserire l’IBAN direttamente nel pannello Stripe e completare l’abilitazione di incassi e accrediti. L’app non sceglie un IBAN tramite un campo del checkout e non devia denaro verso conti intermedi. I trasferimenti bancari, le tempistiche, le eventuali riserve e le commissioni sono gestiti da Stripe; una carta pagata non equivale a un accredito bancario immediato. Nessun account, IBAN o accredito reale è stato configurato.

Prima dell’apertura reale: database ospitato e migrazione, accesso proprietario, account Stripe verificato e test completo checkout/webhook, mittente e scheduler email, dati legali/condizioni della struttura, decisione sul documento fiscale richiesto. L’attuale ricevuta non sostituisce una fattura o ricevuta fiscale. Il passaggio alle chiavi live richiederà un aggiornamento esplicito dell’integrazione e un collaudo dell’account destinatario: non basta incollare una chiave live nell’attuale demo.

### Verifica v4

36 test del motore superati (PostgreSQL PGlite e provider simulati), inclusi checkout con timeout, idempotenza, webhook duplicati/contraffatti/importo errato/live, ricevuta e email atomiche, PDF protetto, pagamento tardivo, reinvio ambiguo e conferma annullata. Restano superati i 12 test della demo ospiti. TypeScript e build Next.js completati. PDF campione A4 validato con pdfinfo/pdftotext; non è un documento relativo a una prenotazione reale. Nessun test effettuato contro account Stripe o Resend esterni, ancora assenti.

Collaudo interfaccia v4: percorsi desktop e telefono emulato completati, inclusa la nuova scheda Email e ricevute; nessun errore JavaScript e nessuna violazione automatica negli 10 audit WCAG A/AA eseguiti. Non sostituisce la prova di invio/consegna con un provider reale o il collaudo sul telefono Android fisico.
