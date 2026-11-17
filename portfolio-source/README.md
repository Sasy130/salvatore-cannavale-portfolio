# ONE MAN — Manifesto interattivo

Homepage aggiornata per https://www.salvatorecannavale.it/.

Il sito principale continua a riscrivere / su /one-man/index.html. Il nuovo export è isolato in public/one-man: script sotto /one-man/_next/static e fotografie sotto /one-man/anteprime. Le altre demo e /proposte rimangono nel repository.

one-man-source.zip contiene il progetto Next.js modificabile. Estrarlo in una cartella separata, eseguire npm ci e costruire con:

NEXT_PUBLIC_ASSET_BASE=/one-man NEXT_PUBLIC_SITE_URL=https://www.salvatorecannavale.it npm run build:static

Copiare out/ in public/one-man del repository di pubblicazione, conservando le altre pagine preesistenti. Non copiare .next né credenziali.

Verificati TypeScript, lint, build statica, integrità SHA dei file e percorsi delle risorse nell’HTML. Collaudo browser e telefoni fisici ancora da eseguire. Le tre fotografie sono immagini di prova, non lavori personali. L’email proviene dal portfolio pubblico precedente.
