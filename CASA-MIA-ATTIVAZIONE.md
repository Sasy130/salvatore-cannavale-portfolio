# CASA MIA — collegamento condiviso e notifiche Android

## Stato

Il proprietario ha installato e provato la demo su Android. Il database online CASA MIA è stato creato su Neon Free e collegato al progetto Vercel, con regione Francoforte. Le migrazioni 1–5 sono state applicate e riverificate via HTTPS, senza importare dati dimostrativi. Nessun account Stripe, incasso live o servizio email è attivo. Il proprietario ha salvato personalmente la password dell’app come Secret di produzione; il valore non è stato richiesto in chat. Lo schema v5 e le chiavi push server sono configurati; il consenso e la sottoscrizione del telefono restano da eseguire dall’app dopo la pubblicazione. La prova locale della demo non equivale a una notifica ricevuta dal server con app chiusa.

## 1. Database del progetto

Aprire il progetto Vercel esistente `oneman-0b39/salvatore-cannavale-portfolio`, senza creare un secondo sito. Dalla sezione Storage/Marketplace collegare un database PostgreSQL, per esempio Neon. Verificare piano, costi e regione prima di confermare; preferire una regione UE per la struttura italiana. La piattaforma può richiedere accesso o creazione dell’account del provider.

Salvare la connessione con pooling e TLS come segreto `CASA_MIA_DATABASE_URL` nel progetto Vercel. Non incollarla in chat o nel codice. Impostare anche una password proprietario unica, almeno 12 caratteri, in `CASA_MIA_ADMIN_PASSWORD`.

Applicare le migrazioni da questo repository, con le variabili in un file privato esterno alla cartella del progetto:

```sh
node --env-file=/percorso/privato/casa-mia.env scripts/casa-mia/migrate.mjs
node --env-file=/percorso/privato/casa-mia.env scripts/casa-mia/check.mjs
```

Le migrazioni creano esclusivamente lo schema `casa_mia`, non dati dimostrativi. Non usare URL di database senza TLS per un servizio ospitato. Configurare backup/ripristino e accessi del provider prima di inserire dati di ospiti reali.

## 2. Chiavi push

Generare le chiavi in un file nuovo e privato, fuori dal repository:

```sh
npm run keys:casa-mia:push -- /percorso/privato/casa-mia-push.env
```

Il comando non mostra le chiavi in console, non sovrascrive file e imposta permessi 0600. Completare il contatto email reale nel valore `CASA_MIA_PUSH_SUBJECT=mailto:...`. Salvare in Vercel:

- `CASA_MIA_PUSH_PUBLIC_KEY`
- `CASA_MIA_PUSH_PRIVATE_KEY`
- `CASA_MIA_PUSH_SUBJECT`
- `CASA_MIA_PUSH_JOB_SECRET`

La chiave privata non va condivisa con il frontend, il cliente finale o la chat. Non ruotare le chiavi senza pianificare il ricollegamento dei telefoni.

## 3. Abilitazione del collegamento per il collaudo

Dopo migrazione, password e chiavi, impostare `CASA_MIA_ENABLE_BOOKING=true` e pubblicare nuovamente lo stesso progetto. `/api/casa-mia/status` deve indicare `enabled:true`, schema 5, modalità pagamento test. Tutte le API restano chiuse se manca la migrazione.

Accedere all’app con la password proprietario. Prenotare un periodo di prova dal sito su un altro browser/dispositivo: deve comparire nell’app e diventare indisponibile sul sito. Provare anche un blocco manuale e l’assenza di sovrapposizioni. L’abilitazione del collegamento non rimuove le etichette demo né attiva pagamenti reali: dati legali, condizioni, foto e configurazione commerciale restano da completare prima dell’apertura agli ospiti.

## 4. Telefono Android

Chiudere e riaprire l’app installata per caricare l’aggiornamento. In **Oggi → Gestisci notifiche**, premere **Attiva avvisi su questo telefono**, concedere il permesso e poi **Invia prova dal server**. Verificare materialmente l’arrivo sul telefono, anche con app chiusa. “Accettata dal servizio push” non dimostra che Android l’abbia visualizzata.

Il messaggio sullo schermo bloccato non contiene nomi, email, date o importi degli ospiti. Il tocco apre l’app e l’accesso protetto ai dettagli. La consegna dipende da connessione, impostazioni del telefono, Chrome e risparmio energetico. Disattivare un dispositivo o uscire dalla gestione revoca i futuri invii; una notifica già in viaggio può comunque arrivare.

## 5. Retry automatici

Configurare uno scheduler esterno ogni 5 minuti verso `POST /api/casa-mia/jobs/push`, con header `Authorization: Bearer <CASA_MIA_PUSH_JOB_SECRET>`. Il segreto non deve essere nel link. Il worker processa al massimo tre invii per richiesta, con timeout, lease, massimo quattro tentativi e scadenza entro un’ora. I nuovi eventi vengono tentati anche immediatamente dopo la prenotazione/pagamento verificato.

Configurare separatamente il worker email descritto in `CASA-MIA.md`. Nessuno scheduler a pagamento è stato creato. Il retry push può ripetere una consegna dall’esito ambiguo: il tag stabile evita suoni ripetuti e sostituisce la notifica già presente, senza promettere una consegna exactly-once.

## Diagnostica dell’ambiente attuale

Il browser condiviso per Vercel è bloccato dall’errore `the gaas-browser node_repl sandbox cannot be disabled`, nell’ambiente `ccarenv_b64_Y2NhcmVudl9lYWI5MTkwZjRkNTg4MTkxODI2NzQ5ODFjMjdiY2VkZg`. L’ambiente di codice funziona; non sono disponibili credenziali Vercel/Neon o un collegamento PostgreSQL. Per questo nessun database o segreto di produzione è stato configurato automaticamente. Il lavoro sul codice, i test locali e la pubblicazione del progetto possono proseguire tramite GitHub → Vercel.

## Alternativa al browser condiviso: accesso CLI ufficiale

La procedura `vercel login` supporta OAuth Device Flow: il proprietario autorizza dal proprio browser la richiesta appena avviata e il terminale riceve la sessione senza password/token in chat. Usare una cartella `--global-config` privata, esterna al repository. Non salvare nel codice o nei documenti pubblici codici temporanei, token o file di autenticazione.

Dopo l’autorizzazione: verificare account e team `oneman-0b39`, collegare esattamente il progetto esistente e controllare piano e risorse già presenti prima di modificarli. La CLI ufficiale può provisionare Neon con `vercel integration add neon`; selezionare esplicitamente un piano gratuito per il collaudo, regione UE e prefisso CLI `CASA_MIA` (la CLI aggiunge il separatore), dopo aver verificato le opzioni effettive dell’integrazione. Nessun passaggio automatico a un piano a pagamento.

Non occorre acquistare un secondo hosting tradizionale per proseguire le prove. Per l’uso commerciale verificare il piano Vercel: Hobby è personale/non commerciale; il listino Pro parte da 20 USD/mese, con eventuali consumi e tasse aggiuntivi. Il piano effettivo del progetto non è ancora stato verificato. Il dominio dedicato può essere collegato in seguito, con la configurazione del sito del cliente e del mittente email.

Riferimenti verificati il 19 novembre 2026: [login CLI](https://vercel.com/docs/cli/login), [integrazioni CLI](https://vercel.com/docs/cli/integration), [piani Vercel](https://vercel.com/pricing), [piano Hobby](https://vercel.com/docs/plans/hobby), [piani Neon](https://neon.com/pricing).

## Provisioning eseguito — 19 novembre 2026

Autorizzazione OAuth Vercel riuscita per l’account del portfolio e condizioni Neon accettate dal proprietario. Creata risorsa `casa-mia`, piano `free_v3`, regione `fra1`, integrazione nativa con prefisso `CASA_MIA`, collegata soltanto all’ambiente Production del progetto esistente. Anteprime e sviluppo non condividono automaticamente questi segreti né il database. Il team ONEMAN risulta Hobby: nessun upgrade o nuovo abbonamento acquistato. Per il lancio commerciale il piano dovrà essere adeguato.

Connessione TCP rifiutata dall’ambiente cloud; applicazione delle migrazioni riuscita attraverso l’endpoint SQL HTTPS Neon. Nuova opzione `--http` nel comando di migrazione, con blocco PostgreSQL atomico e lock: le tabelle già applicate non vengono ricreate. I rerun sul database ospitato hanno confermato versioni 1–5 e zero prenotazioni. Il runtime Vercel continua a usare il pool PostgreSQL; `search_path` ora viene impostato con `SET LOCAL` dentro ogni transazione, senza affidarsi allo stato di sessione incompatibile con pooling a transazioni.

Configurati flag condiviso, chiavi VAPID e segreto del worker push in Vercel; valori privati mai nel codice o nell’output. Contatto tecnico VAPID: il recapito pubblico già usato dal portfolio. Password proprietario inserita personalmente dal proprietario nell’interfaccia Vercel. Lo scheduler push non è ancora attivo: invio immediato dopo gli eventi e recupero programmato restano due aspetti distinti. Email e Stripe richiedono ancora i rispettivi account e collaudi.
