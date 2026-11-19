# CASA MIA — collegamento condiviso e notifiche Android

## Stato

Il proprietario ha installato e provato la demo su Android. Il sito e l’app condividono già il motore PostgreSQL nel codice, ma il database online non è stato creato. Nessun account Stripe, incasso live o servizio email è attivo. Il nuovo codice push richiede schema v5, chiavi e consenso del telefono. La prova locale della demo non equivale a una notifica ricevuta dal server con app chiusa.

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
