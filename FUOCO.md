# FUOCO — consegna Fase 2

FUOCO è un concept completo di sito per pizzeria, sviluppato nello stesso progetto Next.js del portfolio. Le pagine sono `/fuoco`, `/fuoco/menu`, `/fuoco/storia` e `/fuoco/contatti`. La home ONE MAN e le altre demo conservano i loro indirizzi.

La configurazione iniziale è dimostrativa: contatti e posizione non sono inventati, i prezzi sono esempi espliciti, gli allergeni sono provvisori. Non ci sono backend, pagamenti, ordini automatici, prenotazioni o invii di messaggi dal server.

## Personalizzare il locale

Il file principale è `src/features/fuoco/restaurant.ts`.

| Modifica | Campo o file |
| --- | --- |
| Nome e tagline | `restaurant.name`, `restaurant.tagline`; aggiornano marchio testuale, intro, contatti, footer e metadata delle pagine |
| Logo | `restaurant.logoImage`: percorso di un file locale in `public`, ad esempio `/images/fuoco/logo.svg`; `null` mantiene il segno grafico della fiamma. Vale per navigazione, footer, intro e favicon |
| Telefono | `restaurant.phone`: numero internazionale con prefisso paese; `null` o numero non valido non generano un link `tel:` |
| WhatsApp | `restaurant.whatsappNumber`: numero internazionale con prefisso paese; `null` o numero non valido nascondono l’azione e mostrano disponibilità futura soltanto nella demo |
| Indirizzo | `restaurant.address`: indirizzo completo reale. Solo se presente viene generato il link Google Maps per le indicazioni |
| Orari | `restaurant.openingHours`: array di oggetti `{ day, hours }` con giorni e orari confermati; `null` quando mancanti |
| Social | `restaurant.socials.instagram` e `.facebook`: URL HTTPS dei profili reali; `null` quando assenti |
| Fotografia del locale | `restaurant.locationImage`: percorso locale di una fotografia autorizzata del locale effettivo. In assenza viene usato un motivo grafico senza posizione fittizia |
| URL canonico | `restaurant.siteUrl`: URL HTTPS finale della homepage FUOCO, incluso il prefisso `/fuoco` nell’attuale hosting |
| Modalità demo | `restaurant.demo`: mantiene espliciti concept, ricette, prezzi e dati mancanti. Passare a `false` solo dopo avere sostituito i contenuti dimostrativi |
| Fotografie di repertorio | `restaurant.stockPhotography`: mantenere `true` finché il sito usa gli asset stock; il footer li identifica come tali |

Le funzioni in questo file normalizzano e validano i numeri, codificano messaggi e indirizzi e verificano gli URL social. Non è necessaria alcuna API key. Non mettere credenziali nel file: questi dati di contatto sono pubblici.

WhatsApp apre una richiesta che il visitatore può controllare prima di inviare:

- Generica: “Ciao! Vorrei avere informazioni sul menu della pizzeria.”
- Pizza selezionata: “Ciao! Vorrei informazioni sulla pizza [NOME].”
- Per fritti e bevande viene usata la richiesta generica. Un messaggio non conferma un ordine o una prenotazione.

## Pizze, prezzi e contenuti

`src/features/fuoco/menu-data.ts` contiene le quattro categorie e le undici proposte. Ogni voce ha `id`, `name`, `category`, `description`, `ingredients`, `allergens`, `price`, e opzionalmente `image` e `alt`. Le sei pizze richieste sono già presenti. I prezzi numerici sono esempi in euro, indicati come demo; `price: null` mostra “Da definire”. Non cambiare la sola modalità demo per trasformare esempi in prezzi commerciali: confermare prima gli importi.

Usare `image` soltanto quando la fotografia rappresenta la proposta corretta. Omettendo `image`, la scheda e il dettaglio mantengono una composizione tipografica: nessuna pizza diversa viene mostrata al suo posto. Un `id` stabile consente collegamenti come `/fuoco/menu#margherita`.

I testi editoriali e l’anteprima delle tre pizze in homepage sono in `src/features/fuoco/content.ts`; aggiornarli insieme alla selezione del menu quando si cambia quella vetrina. Il racconto in cinque sezioni è in `src/app/(fuoco)/fuoco/storia/page.tsx`; i paragrafi sono provvisori, senza storia aziendale, premi, certificazioni o tempi di lavorazione inventati.

Gli allergeni non sono dichiarazioni definitive: far verificare ricette effettive, prodotti, fornitori e contaminazioni al ristoratore, poi aggiornare le informazioni. Il pannello ricorda di chiedere conferma al personale prima del consumo.

## Fotografie e design

Asset in `public/images/fuoco/`, con nomi facilmente sostituibili. Le nuove fotografie devono avere licenza o autorizzazione adeguata; aggiornare alt text e [registro dei crediti](public/images/fuoco/CREDITS.md). La mozzarella attuale è 400×267 px e resta la priorità per la sostituzione. Le pizze senza foto utilizzano la tipografia.

Token, homepage e componenti condivisi: `src/app/(fuoco)/fuoco/globals.css`. Menu e pannello: `src/features/fuoco/menu.css`. Storia e contatti: `restaurant-pages.css`. Cormorant Garamond e DM Sans sono locali. L’intro resta esclusiva della homepage, si può saltare, si esegue una volta per sessione e rispetta il movimento ridotto. La navigazione tra pagine ricrea e pulisce i reveal GSAP.

## SEO

Ogni pagina ha titolo, descrizione, canonical, Open Graph e Twitter card. La demo usa `noindex`; `/robots.txt` lascia il portfolio accessibile e limita il solo prefisso FUOCO. `/fuoco/sitemap.xml` è vuota nella demo; impostando `demo: false` e `allowIndexing: true` contiene le quattro pagine canoniche.

Lo schema `Restaurant` viene emesso soltanto con `demo: false`, `verifiedBusiness: true`, indirizzo e telefono valido configurati. Tale flag richiede una verifica reale del titolare. Nessuna recensione, valutazione, certificazione o offerta commerciale viene generata.

## Sviluppo e verifiche

Node.js 20.9+ e npm, lockfile incluso. In questo cloud usare una cache scrivibile:

```sh
npm ci --cache /tmp/codex-npm-cache --no-audit --no-fund
npm run dev
```

Usare l’origine `localhost` per il browser di sviluppo e poi il percorso `/fuoco`: Next.js limita le origini degli endpoint HMR. Non ampliare le origini consentite senza una necessità verificata.

```sh
npm run lint:fuoco
npm run test:fuoco
npm run typecheck
npm run build
npm start
```

Fermare il proprio server di sviluppo prima della build. `test:fuoco` esegue controlli di configurazione, contatti e SEO senza aprire servizi esterni; il caricamento TypeScript usa il compilatore già presente nel progetto. Il lint globale `npm run lint` resta disponibile: i suoi errori preesistenti nelle altre demo sono distinti dai controlli FUOCO. Esiti browser e limiti documentati in [PROGRESS.md](PROGRESS.md).

## Deploy Vercel

Seguire anche [DEPLOYMENT.md](DEPLOYMENT.md). L’attuale progetto è `oneman-0b39/salvatore-cannavale-portfolio`, collegato al repository e a `main`. Il framework è Next.js, installazione `npm ci`, build `npm run build`, output automatico; nessuna variabile applicativa o credenziale aggiuntiva è necessaria per FUOCO.

Conservare il rewrite della home ONE MAN e il prefisso `/fuoco`. Preparare un branch di anteprima, controllare le quattro pagine, filtri, schede, immagini, contatti configurati e route legacy. Dopo l’autorizzazione alla pubblicazione, seguire il flusso GitHub → Vercel di DEPLOYMENT.md e verificare il dominio reale. La consegna locale di questa Fase 2 non esegue un deploy.

## Dati da richiedere al cliente

- Nome commerciale, logo autorizzato e URL definitivo.
- Indirizzo completo, telefono, WhatsApp, social, giorni e orari anche festivi.
- Menu effettivo: nomi, ingredienti, porzioni, formati, prezzi e informazioni sugli allergeni verificate.
- Racconto aziendale approvato e descrizioni reali di impasto, forno e fornitori.
- Fotografie originali autorizzate di piatti, persone e locale, con diritti d’uso documentati.
- Dati aziendali e contenuti legali pertinenti al sito effettivo.

La Fase 2 termina con questa esperienza. Prenotazioni, ordini, pagamenti e dashboard non sono implementati.
