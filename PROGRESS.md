# ONE MAN — Raccolta progetti

Aggiornamento del 30 ottobre 2026 su `www.salvatorecannavale.it`, repository `Sasy130/salvatore-cannavale-portfolio`.

## Modifica

- Preservati integralmente VELMORA, VANTA e LUNÉA, con demo sul dominio e casi studio.
- Aggiunte 16 schede nella sezione Progetti: ÉTERNA, MARÉ, BLACK LABEL, APEX KARTING, Rent Car Station, A&J Rent Car, NOIR, NERÈA, Sulla Via, FUORIGIOCO, ORBITA, OMBRA, FORGIA, Aevum, NØ/STATIC e MORSO. Totale: 19 progetti.
- Griglia responsive, filtri per settore, dettagli in dialog accessibile, anteprime WebP locali e collegamenti alle demo originali. Dati in `public/one-man/projects-data.js`; JavaScript e CSS della raccolta separati dal comportamento dei casi studio originali.
- Concept e redesign indipendenti sono esplicitati, senza attribuire incarichi o risultati commerciali reali.
- Il proprietario ha autorizzato esplicitamente l'accesso pubblico delle 16 nuove demo Sites. Tutte le 16 modifiche di accesso sono state confermate dal servizio; tutte le relative URL rispondono HTTP 200 senza autenticazione e mostrano il titolo del progetto.
- Le nuove demo rimangono sui loro indirizzi Sites. Le tre demo originarie sul dominio restano indipendenti; nessun sito nuovo viene presentato come copia locale del dominio.

## Verifiche

- `npm run typecheck`: riuscito.
- `npm run build`: riuscita con Next.js 16.3.5, preservando il rewrite della home e le route OPERAI/caso studio.
- Browser Chromium: tre schede originali e 16 nuove; filtri; dettagli; Escape e ritorno del focus; decodifica di tutte le anteprime; nessun overflow a 375, 390, 768 e 1440 px; nessun errore JavaScript rilevato.
- Axe sulla nuova raccolta: zero violazioni WCAG 2 A/AA e 2.1 AA rilevate. Il controllo automatico non è una certificazione di accessibilità.
- Verificate HTTP 200 per le tre demo locali e le route `/operai` e `/projects/business-management-system`; API OPERAI preservata (GET 405).
- Catture delle verifiche conservate localmente, non incluse nella pubblicazione.

## Pubblicazione

Base verificata: `3c90090e94a0872884515266d61c65a916f68cac`.
Pubblicazione completata attraverso GitHub → anteprima Vercel → main → dominio reale, come da `DEPLOYMENT.md`. Dettagli e verifica finale riportati sotto.

## Anteprima verificata

Commit preparato: `679f530f106b2ce8aabacf2364c94aa127fffad7`, branch `codex/portfolio-19-projects`. Build/deployment Vercel Preview: successo, deployment `7432188815`. La URL di anteprima richiede login Vercel: il contenuto non è stato dichiarato verificato anonimamente. I controlli visivi e funzionali sono stati eseguiti localmente; la verifica finale viene svolta sul dominio reale dopo la pubblicazione autorizzata.

## Pubblicazione di produzione

- Commit `679f530f106b2ce8aabacf2364c94aa127fffad7` promosso su `main` con verifica del riferimento precedente, senza forzare la cronologia.
- Deployment Vercel Production `7432224547`: successo. URL tecnico: https://salvatore-cannavale-portfolio-ck8mt4l6b-oneman-0b39.vercel.app.
- Dominio reale: https://www.salvatorecannavale.it/#work. HTML di produzione verificato: tre progetti originali presenti e 16 nuove schede.
- Moduli/anteprime pubblicati verificati con hash Git: nessuna differenza rispetto ai file locali testati.
- La verifica automatica sul dominio reale conferma filtri, apertura dettagli, Escape e ritorno focus, immagini, quattro larghezze e zero violazioni axe sulla raccolta. Le route delle tre demo originali e delle pagine legacy rispondono 200.
- La GET dell'API OPERAI risponde 405 sia in locale sia sul dominio reale. Non è stata eseguita alcuna POST e il codice di tale API non è stato modificato.
- Il risultato di produzione è aggiunto a questo registro locale dopo la pubblicazione; nessun file applicativo è stato cambiato dopo il deploy.

## Aggiornamento richiesto: raccolta e dominio

- Rimossi dalla raccolta NØ/STATIC, MORSO, AEVUM, FORGIA e OMBRA; mantenuti i tre progetti originali e 11 aggiunti.
- Copie statiche locali di NERÈA, Sulla Via, FUORIGIOCO e ORBITA sotto `/demos/`, collegate dalla raccolta. Gli altri sette progetti restano temporaneamente su Sites: non sono stati presentati come trasferiti.
- Le demo Sites originali rimangono separate e non sono state eliminate.
- Restano da trasferire ÉTERNA, MARÉ, BLACK LABEL, APEX KARTING, Rent Car Station, A&J Rent Car e NOIR: richiedono adattamenti di build, percorsi o servizi; completare il trasferimento e verificare ogni pagina prima di sostituire i link.

## Ulteriori demo locali

- A&J Rent Car, Rent Car Station e NOIR ricompilati con percorsi sotto `/demos/`, mantenendo navigazione interna e asset separati; aggiunti rewrite per le pagine delle esportazioni statiche.
- Restano da trasferire ÉTERNA, MARÉ, BLACK LABEL e APEX KARTING. Fino al completamento restano collegamenti Sites.

## Trasferimento completo delle demo sul portfolio

- Aggiunte le copie statiche di ÉTERNA, MARÉ, BLACK LABEL e APEX KARTING; con le copie già pubblicate, tutte le 11 demo aggiunte si aprono sul dominio del portfolio. Rimossi i collegamenti Sites dalla raccolta.
- Le applicazioni Next.js sono state ricompilate con un prefisso dedicato; i rewrite servono le pagine interne senza interferire con le route preesistenti. Per BLACK LABEL il catalogo dimostrativo è stato generato usando un database locale temporaneo con dati di esempio. MARÉ e BLACK LABEL non inviano richieste o prenotazioni dalla copia statica; ÉTERNA usa la modalità demo.
- In locale verificate le 11 homepage su viewport mobile, immagini caricate, assenza di link Sites nelle pagine controllate e navigazione di una pagina interna per le applicazioni Next.js. Build e TypeScript verificati; controllo finale della pubblicazione da eseguire dopo il deploy.
- Corretti i percorsi di navigazione interni di ÉTERNA e delle demo di noleggio. La galleria BLACK LABEL è stata verificata in Chromium: sei immagini decodificate senza errori di caricamento.

## Sezione redesign per aziende esistenti

- Separati Rent Car Station e A&J Rent Car dai nove concept aggiunti ideati da zero; entrambe le proposte hanno una sezione dedicata, collegamenti diretti alla demo e alla presentazione, e sono identificate come redesign indipendenti non commissionati né affiliati. VELMORA, VANTA e LUNÉA restano in evidenza; totale invariato di 14 progetti.
- Aggiunta a entrambe le homepage una panoramica responsive delle scelte di navigazione; A&J ha ora un caso studio dedicato `/demos/aj-rent-car/progetto/` e il menu mobile supporta Escape e gli attributi di accessibilità. Le demo non inviano richieste o prenotazioni.
- Salvati in `demo-sources/` i sorgenti ricostruibili e le istruzioni per aggiornare le due copie statiche; i file generati sono in `public/demos/`.
- Build separate delle due demo, TypeScript e build del portfolio completate. Chromium a 390 e 1440 px: nove concept nella raccolta, due redesign separati, filtro Automotive, dialog, Escape, link ai casi studio, assenza di overflow e di errori JavaScript rilevati. Axe sulla sezione redesign: nessuna violazione automatica WCAG A/AA rilevata; non costituisce una certificazione.

## Raccolta progetti e pagina Proposte

- Spostate le proposte per Rent Car Station e A&J Rent Car nella pagina `/proposte`, raggiungibile dai menu desktop e mobile, senza schede nella homepage; mantenute le rispettive demo e i casi studio indipendenti.
- Riordinata la raccolta dei nove concept con griglia desktop a tre colonne e filtri orizzontali su smartphone; i tre progetti in evidenza sono invariati.
- Sostituita nelle due demo la navigazione Next tra pagine statiche con link diretti sul dominio e corretti i percorsi delle ricerche: evita richieste di prefetch incompatibili con l'hosting del portfolio. Nessuna richiesta di prenotazione reale viene inviata.
