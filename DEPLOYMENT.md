# ONE MAN — produzione

Il portfolio principale è pubblicato su https://www.salvatorecannavale.it/.
Il dominio è registrato e gestito su Netsons; il sito è ospitato su Vercel.

- Progetto: https://vercel.com/oneman-0b39/salvatore-cannavale-portfolio
- Repository: https://github.com/Sasy130/salvatore-cannavale-portfolio
- Branch di produzione: `main`. Un aggiornamento di questo branch avvia la pubblicazione Vercel.
- Home ONE MAN: `public/one-man/index.html`, `style.css`, `app.js`, `sculpture.js` e asset locali.
- `next.config.ts` riscrive esclusivamente `/` verso `/one-man/index.html`, mantenendo l’indirizzo pubblico della home.
- Le route Next.js `/operai`, `/api/operai/requests` e `/projects/business-management-system` restano disponibili.
- I ritorni alla home dalle pagine Next devono essere normali link HTML verso `/#work`, così il browser carica il documento completo.

## Aggiornare il sito

1. Partire dallo stato corrente del repository e conservare il riferimento al commit e al deployment precedenti.
2. Modificare la home in `public/one-man/`; mantenere i percorsi HTML degli asset sotto `/one-man/` e gli import JavaScript relativi.
3. Eseguire il controllo TypeScript e la build; verificare home, moduli JavaScript, immagini e route mantenute.
4. Pubblicare un branch di anteprima, attendere il completamento Vercel e verificarlo.
5. Aggiornare `main` solo dopo i controlli e senza sovrascrivere modifiche concorrenti. Verificare il deployment di produzione e il dominio reale.

Le modifiche possono essere pubblicate direttamente durante il lavoro su questo progetto, tramite il collegamento GitHub → Vercel già attivo. Il dominio non richiede una nuova configurazione DNS a ogni modifica.
Non sostituire la destinazione di produzione con una pubblicazione esclusiva su Sites.
Non conservare password, token o altre credenziali nel codice.

## Ripristino

La versione precedente all’introduzione di ONE MAN è il commit `1a441305c8cfc24d8cf08c4e06af95268da1cb50`.
Il deployment Vercel corrispondente è https://vercel.com/oneman-0b39/salvatore-cannavale-portfolio/6CqvFc8Z1f2gG3FHpTr3DhE1Z2Qy.
È possibile ripristinare il deployment precedente da Vercel oppure creare un nuovo commit che annulla la modifica; evitare di forzare la cronologia di `main`.

## Contatti e demo

Il modulo della home prepara una bozza email per `sasycannavale1999@gmail.com`; non invia né salva richieste sul server.
Velmora è presentato attraverso il caso studio e screenshot locali. La demo interattiva è disponibile su richiesta via email, perché il prototipo Sites originale ha accesso privato.
