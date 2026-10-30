# A&J Rent Car — Napoli, al tuo ritmo

Proposta indipendente di redesign. **Concept dimostrativo non ufficiale**, non affiliato all'attività.

## Avvio

Richiede Node.js 20.9+.

```sh
npm ci
npm run dev
```

```sh
npm run typecheck
npm run build
```

La build Next.js produce l'export statico in `out/`. Nessuna API o database è necessario per la demo. `npm run build` utilizza Webpack per compatibilità con ambienti isolati.

## Pagine e funzionalità

- Homepage con servizi, testimonianza verificata, esperienze, contatti e simulatore.
- `/flotta/`: filtri combinabili per tipo e categoria, stato vuoto, periodo di interesse.
- `/flotta/gran-turismo/`, `/flotta/sport-coupe/`, `/flotta/due-ruote/`: dettaglio illustrativo, galleria selezionabile, informazioni espandibili e richiesta demo.
- Menu mobile, animazioni Motion rispettose di `prefers-reduced-motion`, navigazione da tastiera e skip link.
- Date e orari con controllo cronologico; nessuna disponibilità, prezzo, pagamento o prenotazione inventata.
- Il riepilogo è solo in memoria nel browser, senza invio né persistenza. WhatsApp, telefono e indicazioni aprono i canali ufficiali.
- Metadata per pagina, HTML semantico e noindex/robots per evitare di confondere il concept con il sito ufficiale.

## Dati verificati

Fonte: https://www.ajrentnapoli.it, consultata il 26 ottobre 2026, e screenshot forniti dall'utente.

- A&J Rent Car, Napoli; Vico Montesanto 45.
- Cellulare 344 5947964; telefono 081 1781 2542; P. IVA 10647171213.
- Instagram `aj_rentcar`.
- Noleggio auto e scooter, tour guidati a Napoli e in Costiera Amalfitana, consegna e ritiro a domicilio.
- Testimonianza Marcello P.: testo presente sul sito ufficiale, riprodotto senza simulare un punteggio aggregato.

Il logotipo è una reinterpretazione tipografica per il concept, non il logo ufficiale. Tutte le categorie veicolo sono demo; non sono dichiarati modelli, dotazioni, tariffe, stock o condizioni contrattuali reali.

## Adattamento ad altre attività

`lib/data.ts` centralizza identità e categorie veicolo. `app/globals.css` contiene i token cromatici. Componenti separati per layout, schede, ricerca, simulatore, filtri e galleria. Sostituire fotografie in `public/images/` e contenuti con materiale autorizzato prima del lancio ufficiale.

Per la produzione: integrare un gestionale reale attraverso un backend, validare disponibilità e tariffe lato server, concordare requisiti e condizioni, configurare privacy e gestione dati per eventuali form reali e verificare l'autorizzazione del titolare.

## Immagini e font

Fotografie stock locali e facilmente sostituibili. Sono illustrative e non mostrano necessariamente mezzi della flotta reale. Crediti e licenze in `ASSETS.md`. Nessuno screenshot del sito originale è inserito nella demo.
