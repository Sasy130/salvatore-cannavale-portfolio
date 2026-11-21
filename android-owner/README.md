# DIMORA MIA — Android privato

App Android nativa Java, package `it.dimoramia.owner`, minSdk 26, target/compile 35, versione 1.1.0. Nessuna WebView, browser incorporato, TWA o URL remoto usato come interfaccia. Le schermate sono widget Android e chiamano le API HTTPS del portfolio. La rete rimane necessaria per dati condivisi e push.

## Implementato

Accesso con password proprietario esistente; sessione cifrata AES-GCM in Android Keystore, senza salvare la password. Cinque aree: Oggi, Calendario, Soggiorni, Incassi, Regole. Calendario a mesi con selezione ingresso/uscita esclusiva; creazione e modifica soggiorni manuali e blocchi, anteprima prezzi/conflitti server, revisioni e idempotenza; annullamenti, contatti ospite e note private; preparazione/check-in/check-out; registrazione manuale di incassi/rimborsi; tariffe. Dati ospiti solo in memoria, backup/trasferimento disabilitati, HTTP in chiaro e redirect API vietati.

Notifiche tramite Firebase Messaging e permesso Android POST_NOTIFICATIONS. Token custoditi sul server in tabelle separate dal Web Push; coda transazionale, deduplicazione, retry limitati, disattivazione token non registrati, messaggi generici, click autenticato. Non sono polling con servizio permanente e non richiedono Chrome/Samsung Internet.

La configurazione Firebase Android viene letta dal server dopo l'accesso e inizializzata tramite FirebaseOptions: l'APK non richiede un google-services.json per compilarsi. In assenza di configurazione, l'app indica che gli avvisi non sono pronti e non mostra falsi successi.

## Configurazione notifiche ancora esterna

1. Creare progetto Firebase Spark, Analytics facoltativo/disattivabile. Registrare app Android con package **it.dimoramia.owner**.
2. Dal google-services.json ricavare solo i valori pubblici: `project_info.project_id` → projectId; `project_info.project_number` → senderId; client di questo package `client_info.mobilesdk_app_id` → applicationId e `api_key[0].current_key` → apiKey. Salvare questo oggetto JSON in **CASA_MIA_FIREBASE_ANDROID_CONFIG**, Production, su Vercel.
3. Creare credenziali server per Firebase Cloud Messaging HTTP v1 nel proprio progetto, con permesso di invio FCM. Salvare il JSON dell'account di servizio come variabile **sensibile CASA_MIA_FIREBASE_SERVICE_ACCOUNT**, Production. Mai nel repository, APK o chat. Cloud Messaging HTTP v1 deve essere abilitata. Project ID dei due valori deve coincidere. Ripubblicare dopo aver salvato le variabili.
4. Nell'APK accedere → Regole → Notifiche Android → Attiva → consentire il permesso Android → prova server. Verificare il messaggio sul telefono e poi una prenotazione di prova. Non dichiarare consegna fisica dal solo accepted di Firebase.

Migrazione additiva **006_native_android.sql** separa token/coda nativi da quelli Web Push; migratore porta il DB a v6, mentre il contratto delle API web esistenti rimane compatibile con v5. Il worker jobs/push può riprendere entrambe le code; lo scheduler esterno dei retry rimane da configurare. Pagamenti restano Stripe test; email da configurare come descritto nel progetto web.

## Compilare e aggiornare

Richiede JDK 17/21 completo, Android SDK platform 35/build-tools 35.0.0, Gradle wrapper 8.13 con SHA-256 della distribuzione verificato. `./gradlew :app:assembleDebug :app:testDebugUnitTest :app:lintDebug`.

Release: impostare privatamente `DIMORA_KEYSTORE` (percorso assoluto), `DIMORA_STORE_PASSWORD`, `DIMORA_KEY_PASSWORD`. Alias `dimora`. Eseguire `./gradlew :app:assembleRelease :app:lintRelease`. La chiave di firma NON è nel repository. La copia privata e il backup sono in `/workspace/private/dimora-android/`; conservare il backup in un proprio archivio sicuro prima che l'ambiente venga eliminato. Il tentativo di salvarla cifrata nei GitHub Actions Secrets non era autorizzato dal token tecnico, quindi non è stato effettuato: non fare affidamento su un backup GitHub. Il file signing.env nel backup contiene un percorso da adattare dopo lo spostamento.

Aggiornamenti senza Play Store: incrementare versionCode/versionName, firmare sempre con **la stessa chiave**, consegnare il nuovo APK e installarlo sopra il precedente. Il file pubblicato è `/casa-mia/downloads/dimora-mia.apk`; metadati/hash in version.json e dimora-mia.apk.sha256. Nessun aggiornamento silenzioso promesso.

## Verifiche reali e limiti

Build APK release firmata e verificata con apksigner; test JUnit sugli importi; test Robolectric del ciclo Activity, accesso e calendario nativi; lint Android; test PostgreSQL su auth/configurazione, token riservati, idempotenza, queue nativa, logout e soppressione dopo annullamento. I test Android headless non equivalgono a una prova fisica sul Samsung. Installazione e consegna FCM sui telefoni del proprietario ancora da collaudare. Il team Vercel rimane Hobby: adeguare il piano prima del lancio commerciale.


## Aggiornamento 1.1.0 (versionCode 3)

Logo DM definitivo su launcher adattivo, ingresso e intestazione. Icone di navigazione native; feedback press/ripple e transizioni 90–190 ms soltanto su azioni esplicite, rispettando le animazioni disattivate di Android. Ripristino dello scroll durante refresh, nessuna ricostruzione periodica di schermate identiche. Home senza scheda notifiche; avvisi restano in Regole. Agenda sette giorni (uscite prima degli ingressi a parità di data), filtri dei soggiorni, risultati prioritari per soggiorni attuali/futuri e limite di 100 righe con ricerca completa. Stati inattivi/da verificare non presentati come confermati. Pulsante Torna a oggi e promemoria CalendarContract su richiesta, con uscita esclusiva e nessuna sincronizzazione automatica promessa. Credenziali/database/Firebase non modificati.

Test aggiuntivi per filtri, agenda attraverso cambio ora, UI Home senza notifiche, motion ridotto e promemoria all-day UTC. Gli aggiornamenti APK sono sempre firmati con la chiave 1.0 originale.

La ricostruzione finale 1.1.0 usa versionCode 3: include il controllo del cambio di giorno in Europe/Rome anche senza modifiche ai record server.
