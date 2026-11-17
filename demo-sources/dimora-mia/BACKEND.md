# CASA MIA

Concept hospitality interattivo, con booking dimostrativo persistente.

## Avvio

Node.js 24 (usa `node:sqlite`). `npm install`, `npm run dev` oppure `sites-preview start /workspace/sites/dimora-mia` nell'ambiente gestito. `npm test` per i test contrattuali. `npm run build` crea il Worker ESM con asset incorporati e migrazioni D1 in `dist/.openai/drizzle`.

La password locale predefinita, solo sviluppo, è `dimora-local-demo`. Il sito pubblicato richiede `ADMIN_PASSWORD` nei secret runtime; non ha password predefinita. Sessione amministratore HttpOnly, SameSite=Strict, Secure su HTTPS, scadenza 8 ore, limite tentativi e verifica Origin per le scritture.

## Implementato

- Vite, JavaScript modulare, GSAP/ScrollTrigger. La scelta rispetto a Next/Three evita un runtime React o WebGL senza un vantaggio per questa composizione fotografica.
- Timeline unica reversibile: porta con prospettiva 3D CSS e cardini distinti, avanzamento, soggiorno con spostamento laterale, maschera architettonica verso la camera, terrazza giorno/tramonto/notte e booking stabile nella stessa atmosfera finale.
- Non è una ricostruzione 3D della casa e non viene usato WebGL. Ombre e profondità sono compositing; nessun video scroll-synced. Il fallback senza WebGL è il percorso principale.
- Regia mobile dedicata, tipografia e portale riposizionati; reduced motion di sistema e manuale, niente scroll hijacking. Galleria con fotografie intere, dialog nativo, tastiera, Escape e frecce.
- SQLite locale; Cloudflare D1 ospitato. Preventivi calcolati solo dal server, tariffe giugno–settembre, minimo notti, pulizia, capienza, date bloccate, prenotazioni e inventario notturno. `nights.date` è chiave primaria; inserimento prenotazione+notti in batch atomico: una collisione annulla l'intera operazione.
- Pagamento in struttura con richiesta manuale o conferma secondo impostazioni. Le richieste manuali bloccano le date finché il proprietario le gestisce.
- Dashboard `/admin`: prenotazioni, conferma/annullamento, tariffe, minimi, modalità di pagamento, acconto percentuale, blocchi date e URL immagini.
- Stripe TEST completo/acconto: Checkout creato sul server, importo server-side, lock provvisorio, firma webhook HMAC con timestamp, verifica ID sessione/importo/valuta/livemode/stato prima della conferma. Un redirect non conferma pagamenti. Un webhook tardivo su prenotazione non attiva richiede revisione manuale. I rimborsi non sono automatici e il pannello li segnala.
- Integrazione Resend per email; il risultato dichiara esplicitamente quando l'invio non è configurato o non riesce.

## Configurazione esterna

Configurare con i secret di hosting: `ADMIN_PASSWORD`, `STRIPE_SECRET_KEY` (solo `sk_test_...`), `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `MAIL_FROM` (mittente verificato). Endpoint webhook: `/api/stripe/webhook`, evento `checkout.session.completed`.

Le modalità online sono inizialmente disattivate e non possono essere abilitate senza Stripe test + webhook. Nessun pagamento reale è accettato. Per il go-live servono revisione del booking, condizioni contrattuali, fiscalità/tassa di soggiorno, privacy definitiva, riconciliazione/rimborsi, email affidabili con retry e osservabilità, policy di cancellazione, sincronizzazione con eventuali OTA/channel manager e collaudo Stripe end-to-end. Queste integrazioni non sono simulate come funzionanti.

## Asset

Fotografie dimostrative Unsplash, licenza https://unsplash.com/license. Non appartengono alla struttura reale. Originali:
- Soggiorno: identificatore CDN `photo-1600210492486-724fe5c67fb0`.
- Camera: CDN `photo-1611892440504-42a792e24d32`.
- Terrazza: CDN `photo-1613977257363-707ba9348227`.
- Dettaglio: CDN `photo-1600607687920-4e2a09cf159d`.

Gli URL esatti di provenienza sono `https://images.unsplash.com/<identificatore>?auto=format&fit=crop&w=1800&q=85&fm=webp`. Asset locali WebP in `public/assets`, sostituibili via dashboard con URL HTTPS autorizzati. La maschera d'ingresso e le porte sono costruzioni grafiche temporanee. Per la versione definitiva servono fotografia frontale del portale, soggiorno e camera con raccordo architettonico concordato, stessa inquadratura della terrazza giorno/tramonto/notte, crediti fotografici definitivi.

Il giorno/notte attuale è una composizione illustrativa con livelli cielo, esposizione e bagliori luminosi: non è un relighting fisico né una coppia fotografica reale. Le fotografie attuali non hanno una continuità geometrica: il passaggio alla camera è un raccordo mediante maschera, non una falsa ricostruzione spaziale. Il rendering definitivo richiede asset coerenti della proprietà.

## Verifica

10 test automatici superati: tariffe/minimi/date, rifiuto dati invalidi, prezzi manomessi ignorati, collisioni concorrenti, rollback atomico, richieste idempotenti, soggiorni contigui, accesso admin, conferma e rilascio date, date bloccate, Origin e configurazione pagamenti, webhook contraffatto. Il build è verificato separatamente con `node scripts/check-artifact.mjs`: HTML, dashboard, tutti gli asset collegati e API database nel Worker compilato. Browser QA non eseguita: l'infrastruttura preview ha restituito un timeout del relay; il browser cloud ha poi restituito `the gaas-browser node_repl sandbox cannot be disabled`. Non sono stati usati server o browser alternativi. Pubblicazione privata verificata dal risultato nativo Sites.

## Limiti noti

La demo non soddisfa ancora un collaudo commerciale completo: nessuna verifica su smartphone fisico, nessun test con credenziali Stripe/email esterne finché non fornite, nessuna misura certificata di fluidità/Lighthouse. Non viene dichiarata una qualificazione Awwwards. La timeline utilizza trasformazioni e maschere CSS; riduce complessità e dipendenze ma non implementa shader GLSL, mappe di profondità o un ambiente 3D reale. Le immagini imminenti sono caricate dal browser; il soggiorno ha priorità e le altre immagini sono lazy. Il bundle include gli asset per rendere la demo autosufficiente; per asset originali più grandi conviene R2/CDN e varianti responsive AVIF.

## Seconda edizione — novembre 2026

Regia ampliata con tre cornici architettoniche, frammento fotografico sospeso, risposta prospettica al puntatore solo desktop, composizione tipografica su tre righe e rivelazione delle righe, cornici che accompagnano il passaggio alla camera, parola spaziale e manifesto tipografico. Le fotografie mantengono proporzioni corrette. Il movimento opzionale resta disattivabile.

Menù riprogettato come dialog nativo a tutto schermo: cinque percorsi, anteprime anche al focus, ritorno del focus alla chiusura, Escape e prenotazione sempre visibile nell'header. I collegamenti al soggiorno, alla camera e alla terrazza controllano la stessa timeline. Nessun audio automatico né dipendenze aggiuntive.

Portfolio ONE MAN: scheda, copertina di direzione artistica e case study collegati alla demo. Entrambi i siti conservano il proprio accesso esistente.
