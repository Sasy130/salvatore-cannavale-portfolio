# KINETIC — copia statica sul portfolio

Sorgente Sites: `kinetic-art-of-movement-demo`, commit `4613e3e01358f50ae8c715bffbefef93dbd9dff8`. Esportazione del 16 novembre 2026.

`source.tar.gz` contiene il sorgente adattato a `/demos/kinetic` (basePath e percorsi degli asset), senza dipendenze, credenziali o dati runtime. Gli asset originali e i crediti sono conservati nella demo pubblica.

Per ricostruire: estrarre l’archivio in una directory vuota, creare `public/` copiandovi gli asset da `../../public/demos/kinetic/` (escludendo `_next` e i file HTML/TXT generati), eseguire `npm ci --cache /tmp/npm-cache` e `npm run build`. Copiare il contenuto di `out/` in `public/demos/kinetic/` del portfolio.

Le demo non inviano richieste né pagamenti. Il Site originale mantiene il suo accesso.

Ottimizzazioni della copia del 16 novembre 2026: KÍNETIC riduce la decodifica a 960/480 px, sospende il rendering quando non visibile e limita gli aggiornamenti diagnostici; VÉRA usa lo scroll nativo senza Lenis; VELAR elimina blur e filtri sulle chiavi per dispositivi touch. I sorgenti adattati sono inclusi nell’archivio.
