# DIMORA MIA sul portfolio

URL: https://www.salvatorecannavale.it/demos/dimora-mia/

La copia portfolio è autonoma: HTML, CSS, JS, WebP, GSAP e font sono serviti dallo stesso dominio. Non incorpora iframe o endpoint ChatGPT/Sites.

Il booking della copia è una **simulazione locale**: usa solo localStorage del visitatore, senza calendario condiviso, database remoto, email o Stripe. Il pannello demo è volutamente privo di autenticazione reale e non contiene credenziali. Non usare dati personali. I prezzi non sono preventivi contrattuali. I limiti sono indicati nell’interfaccia.

Il motore originale, con prezzi server-side, inventario atomico, autenticazione e verifica Stripe, resta conservato in `server/` e `drizzle/` per un futuro hosting con database; non è presentato come attivo in questa copia statica. Il Site originale non viene modificato.

Ricostruzione: `npm ci`, poi `npm run build:portfolio`. L’output viene scritto soltanto in `../../public/demos/dimora-mia/`. Le fotografie sono dimostrative Unsplash, non della proprietà reale; crediti nel README e nell’interfaccia.

Il documento BACKEND.md descrive il progetto originale; le relative funzionalità server non sono attive nella copia portfolio.
