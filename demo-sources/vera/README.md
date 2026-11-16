# VERA — copia statica sul portfolio

Sorgente Sites: `vera-luxury-residenze`, commit `e8c8429a00f7ea53c72cc97cd610b7a5b18a89df`. Esportazione del 16 novembre 2026.

`source.tar.gz` contiene il sorgente adattato a `/demos/vera` (basePath e percorsi degli asset), senza dipendenze, credenziali o dati runtime. Gli asset originali e i crediti sono conservati nella demo pubblica.

Per ricostruire: estrarre l’archivio in una directory vuota, creare `public/` copiandovi gli asset da `../../public/demos/vera/` (escludendo `_next` e i file HTML/TXT generati), eseguire `npm ci --cache /tmp/npm-cache` e `npm run build`. Copiare il contenuto di `out/` in `public/demos/vera/` del portfolio.

Le demo non inviano richieste né pagamenti. Il Site originale mantiene il suo accesso.
