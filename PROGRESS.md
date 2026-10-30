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
Seguire il flusso GitHub → anteprima Vercel → main → dominio di produzione, come da `DEPLOYMENT.md`. Esito finale della pubblicazione da registrare dopo la conferma sul dominio reale.
