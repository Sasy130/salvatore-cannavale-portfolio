# Rent Car Station — Napoli, si parte.

Proposta indipendente di redesign. **Concept dimostrativo non ufficiale**, non commissionato, approvato o affiliato a Rent Car Station.

## Avvio

Richiede Node.js 20.9+.

```sh
npm ci
npm run dev
```

Verifiche e build:

```sh
npm run typecheck
npm run build
```

Next.js 16, TypeScript, Tailwind CSS 4, Motion e Lucide. Export statico in `out/`, con slash finale e asset locali. La build usa Webpack per compatibilità con ambienti isolati.

## Percorsi

- `/`: homepage e ricerca dimostrativa per tipo, data e ora.
- `/flotta/`: due categorie in evidenza, filtri combinati e periodo di interesse.
- `/flotta/citycar/`, `/flotta/scooter/`: dettagli con riferimenti alle fonti, foto stock e requisiti da concordare.
- `/servizi/bagagli/`, `/servizi/tour/`: percorsi dedicati ai servizi verificati.
- `/richiesta/`: simulatore adattivo per auto, scooter, bagagli e tour, con riepilogo e modifica.
- `/progetto/`: case study con osservazioni qualitative e scelte di redesign, senza screenshot originali né risultati commerciali inventati.

## Confine della demo

Il simulatore non invia né salva dati. Non raccoglie nomi, email o pagamenti e non consulta un gestionale. La selezione resta solo in memoria nel browser. Il riepilogo non è una prenotazione, un preventivo né una verifica di disponibilità. I collegamenti a telefono, email, WhatsApp e mappe usano i canali ufficiali; nessun messaggio viene inviato automaticamente.

Metadati specifici per pagina e HTML semantico; `noindex` e `robots.txt` impediscono l'indicizzazione intenzionale del concept come sito ufficiale. Skip link, focus visibile, label dei campi, filtri con `aria-pressed`, menu con stato esplicito e supporto alla riduzione del movimento.

## Dati e fonti

Verificati il 26 ottobre 2026 su https://rentcarstation.it/ e relative pagine auto, scooter, deposito, tour e contatti.

- Rent Car Station Srl, Corso Arnaldo Lucci 173, 80142 Napoli.
- Telefono +39 334 7121252; email info@rentcarstation.it; P. IVA 03139590214.
- Auto, scooter, deposito bagagli; proposte per Napoli, Pompei e Costiera Amalfitana.
- Esempi di modelli pubblicati: Fiat 500 o similare; Vespa 125.

Il concept evita di riprodurre tariffe, condizioni o promesse non uniformi nelle fonti. Modelli effettivi, dotazioni, disponibilità, requisiti, coperture e modalità dei tour richiedono conferma del titolare. Le foto possono mostrare varianti diverse. Nessuna recensione o valutazione aggregata viene simulata.

## Adattamento

`lib/content.ts` centralizza identità, veicoli, servizi e FAQ. `app/globals.css` contiene token cromatici, font e responsive. Componenti separati per layout, ricerca, catalogo e richieste. Sostituire identità, asset e testi con materiale autorizzato per la successiva attività.

Per un lancio ufficiale servono approvazione del titolare, dati verificati e aggiornati, integrazione lato server con il gestionale, validazione delle richieste reali e documenti privacy adeguati ai flussi effettivi.

Crediti e licenze: `ASSETS.md`. Verifiche: `VALIDATION.md`.
