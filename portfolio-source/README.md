# ONE MAN — Portfolio cinematografico

Pubblicazione: https://www.salvatorecannavale.it/ — repository Sasy130/salvatore-cannavale-portfolio.

La homepage in public/one-man/index.html conserva il rewrite esistente. Le altre demo non sono state sostituite. Il sorgente Next.js modificabile è in one-man-source.zip. Dopo estrazione: npm ci, npm run dev.

## Contenuti e build

I 13 progetti originali sono configurati in lib/restored-projects.ts; email e biografia in lib/portfolio-data.ts. La precedente galleria rimane su /one-man/mostra.html. Per costruire l’export del dominio:

NEXT_PUBLIC_ASSET_BASE=/one-man NEXT_PUBLIC_SITE_URL=https://www.salvatorecannavale.it npm run build:static

Copiare out/ in public/one-man/ preservando gli altri file. Non copiare .next o credenziali.

## Esperienza

Scroll nativo con composizione CSS 3D animata da GSAP, 13 copertine originali, indice completo, vista essenziale, controllo touch elastico, menu editoriale a pieno schermo, scheda progetto con copertina e un iframe interattivo alla volta. Riduzione del movimento, focus nativo del dialogo e chiusura Esc.

## Verifica

TypeScript, lint e build superati. Quattro scenari Playwright superati anche sull’export con prefisso /one-man: progetti/menu/dettaglio, touch mobile, movimento ridotto/audit axe, intro/replay/cinque viewport. Il test touch è stato ripetuto due volte. Nessuna violazione axe negli scenari controllati. I test dell’iframe usano una risposta simulata per verificarne il collegamento; i 12 siti originali sono stati verificati separatamente via HTTP. Safari e telefoni fisici ancora da collaudare. Le schermate mobile sono state ispezionate.

CASA MIA aggiunta alla raccolta: apertura e iframe puntano a `/demos/dimora-mia/`, sullo stesso dominio. La copia è una simulazione locale, con font e asset locali; sorgenti e limiti in `demo-sources/dimora-mia/PORTFOLIO.md`.
