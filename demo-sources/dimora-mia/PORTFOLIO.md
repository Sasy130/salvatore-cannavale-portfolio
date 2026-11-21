# DIMORA MIA sul portfolio

URL: https://www.salvatorecannavale.it/demos/dimora-mia/

La copia portfolio è autonoma: HTML, CSS, JS, WebP, GSAP e font sono serviti dallo stesso dominio. Non incorpora iframe o endpoint ChatGPT/Sites.

Il sito controlla `/api/casa-mia/status`. In produzione, con servizio abilitato, disponibilità, prezzi e prenotazioni usano il database condiviso con la gestione e l’APK. I pagamenti restano in ambiente test e le configurazioni email/push vanno verificate separatamente. Non ripiega su salvataggi locali se il servizio condiviso è dichiarato indisponibile.

La demo esplicita `?demo=1` simula soltanto nel browser tramite localStorage, senza prenotazioni reali, email o pagamenti; i test UI non scrivono prenotazioni in produzione. Il pannello demo è privo di autenticazione reale e non contiene credenziali. Non usare dati personali nei test.

Ricostruzione: `npm ci`, poi `npm run build:portfolio`. L’output viene scritto soltanto in `../../public/demos/dimora-mia/`. Le fotografie sono dimostrative Unsplash, non della proprietà reale; crediti nel README e nell’interfaccia.

## Area proprietario e backend condiviso

L’app proprietario è su `/casa-mia/gestione`. Il sito verifica lo stato di `/api/casa-mia/status`: se il backend non è abilitato resta la simulazione locale; quando abilitato usa soltanto il database condiviso. Un servizio abilitato ma non raggiungibile non ripiega su prenotazioni locali. Hero e percorso visivo sono preservati. Configurazione in `CASA-MIA.md` alla root del repository.

## Prenotazione diretta e regia visiva

Invito esplicito in hero e navbar, scorciatoia durante l’esplorazione nascosta durante prenotazione/dialoghi, raccordo finale dalla terrazza al soggiorno, ingresso della scheda con movimento controllato dallo scroll e reveal architettonici delle fotografie. Percorso date → totale → prenotazione con caratteri/campi più leggibili. Endpoint arrivo/partenza etichettati, checkout consentito su giorno di nuovo arrivo perché la notte di uscita è esclusa. Preventivi obsoleti e risposte calendario fuori ordine ignorati. Movimenti ridotti, tastiera e focus nel checkout verificati.

Verifica browser: `node scripts/casa-mia/test-guest-design.mjs`, con dev server sulla porta 4175. Tre viewport, API simulate, nessuna prenotazione vera creata.
