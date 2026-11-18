# CASA MIA — Prenotazioni e app proprietario

App: https://www.salvatorecannavale.it/casa-mia/gestione
Sito: https://www.salvatorecannavale.it/demos/dimora-mia/

## Stato di questa consegna

Prima versione installabile della gestione proprietario. In assenza delle credenziali mostra un pulsante esplicito per esplorare dati sintetici; quella demo non crea account, richieste reali o pagamenti e si azzera ricaricando. Nessun database è stato creato o configurato automaticamente su account esterni. Il sito mantiene il proprio aspetto e la simulazione locale finché il servizio condiviso non viene abilitato.

Il backend condiviso è implementato per PostgreSQL, con transazioni e vincolo univoco su ogni notte. L'app e il sito usano le stesse tabelle dello schema dedicato `casa_mia`, senza passare da ChatGPT/Sites. Il server calcola tariffe, minimi, pulizia e totale. Le prenotazioni manuali, i blocchi e le richieste dirette competono per il medesimo inventario: la collisione annulla l'intera transazione. I blocchi e le cancellazioni liberano le notti. Gli inserimenti manuali sono confermati subito e non inviano email o addebitano pagamenti.

## Funzioni dell'app

- Oggi: richieste da confermare, arrivi e partenze, prossimi ospiti.
- Calendario mensile, dettaglio per data e lista filtrabile.
- Conferma o annullamento; indicazione dei rimborsi da gestire, senza fingere rimborsi automatici.
- Inserimento manuale di prenotazioni, contatti e note interne; eventuale totale concordato dal proprietario.
- Blocchi per manutenzione o uso personale; massimo 30 notti per singolo inserimento, come i soggiorni correnti.
- Tariffe base/stagionali, minimi, pulizia, acconto e modalità di pagamento.
- Aggiornamento ogni 30 secondi mentre l'app è visibile, e al ritorno in primo piano. Non sono notifiche push e non viene promessa una sincronizzazione continua in background.
- PWA: aggiungibile alla schermata Home da Safari/Chrome, senza pubblicazione sugli store. Serve internet per il calendario condiviso. Il service worker salva solo la pagina offline e le icone: non archivia risposte API, HTML autenticato o dati degli ospiti.

## Configurazione necessaria prima dell'uso condiviso

Nel progetto Vercel esistente impostare come segreti, senza inserirli nel repository o inviarli in chat:

- `CASA_MIA_DATABASE_URL`: stringa di connessione PostgreSQL con TLS, preferibilmente endpoint con pooling per ambiente serverless.
- `CASA_MIA_ADMIN_PASSWORD`: password proprietario lunga e unica, almeno 12 caratteri.
- `CASA_MIA_ENABLE_BOOKING=true`: abilita il collegamento di sito e app, solo dopo la migrazione e il collaudo.

Applicare lo schema iniziale da un ambiente sicuro con la stringa di connessione disponibile:

```sh
npm run db:casa-mia
```

Il comando esegue una transazione, crea solo lo schema dedicato e non inserisce prenotazioni dimostrative. In futuro usare migrazioni aggiuntive versionate; non modificare uno schema già applicato. Dopo una modifica ai segreti effettuare il deploy Vercel.

Endpoint di stato: `/api/casa-mia/status`. Non restituisce segreti. Il backend deve avere credenziali, flag e migrazione corretti prima di risultare abilitato. Se si richiede l'abilitazione ma il database è indisponibile, il sito mostra un errore e non salva prenotazioni di ripiego nel browser.

## Pagamenti e comunicazioni

Opzionali, in ambiente di prova:

- `CASA_MIA_STRIPE_SECRET_KEY`: **solo chiave `sk_test_...`**.
- `CASA_MIA_STRIPE_WEBHOOK_SECRET`: endpoint `/api/casa-mia/stripe/webhook`, evento `checkout.session.completed`.
- `CASA_MIA_RESEND_API_KEY` e `CASA_MIA_MAIL_FROM`: mittente verificato per le email.

Checkout Stripe nasce sul server, il webhook verifica firma, timestamp, sessione, importo, valuta e modalità test. Il ritorno del browser non conferma un pagamento. Sono gestiti lock temporanei, stati scaduti ed eventi tardivi da revisionare. Il saldo dell'acconto e i rimborsi restano manuali. Nessun pagamento reale è attivato in questa consegna.

Le email sono al momento comunicazioni di prova. Prima del lancio serve un outbox con retry/idempotenza e riconciliazione affidabile: l'invio diretto attuale riporta l'esito ma non garantisce il recupero automatico di errori del provider.

## Accesso e dati

Sessione proprietario con cookie HttpOnly, SameSite Strict, Secure su HTTPS, scadenza di 8 ore. Il database conserva l'hash del token, non il token del cookie. Limite ai tentativi di login, massimo cinque nuove richieste pubbliche per IP ogni ora e controllo Origin sulle mutazioni. Le richieste idempotenti non consumano una seconda prenotazione. Nessuna password predefinita, nessun segreto nel frontend. La demo pubblica dell'app usa esclusivamente dati sintetici separati. I record del vecchio pannello locale non vengono importati automaticamente: non rappresentano prenotazioni vere.

Prima di usare dati reali: backup e ripristino PostgreSQL, controllo degli accessi al database, conservazione/cancellazione dei dati, informative, condizioni, tariffe e fuso orario della struttura da concordare. Autenticazione a più fattori e più account non sono implementati in questa prima versione.

## Booking.com e Airbnb

**Nessuna sincronizzazione OTA implementata o dichiarata attiva.** Le etichette di canale nell'inserimento sono solo annotazioni manuali. Prima di accettare vendite simultanee serve sapere quali canali il proprietario utilizza e collegare un channel manager o un'integrazione autorizzata. iCal è periodico e non elimina da solo il rischio di doppia vendita tra canali; il blocco atomico di questa applicazione protegge solo le richieste che passano dal suo database.

## Verifica

`npm run test:casa-mia`: test del motore su PostgreSQL PGlite (motore PostgreSQL in memoria), transazioni, collisioni, sessioni hashate, Origin, inserimenti manuali, blocchi, idempotenza e webhook firmato/importo. Non sostituiscono un test di carico multi-istanza sul database ospitato. `npm run typecheck` e `npm run build` controllano l'integrazione Next.js. `npm run test:dimora` mantiene i controlli della demo precedente.

Il collaudo browser e l'installazione su telefoni fisici non risultano verificati in questo ambiente. Stripe ed email non sono stati collaudati contro account esterni, perché non configurati.
