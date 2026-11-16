# VELAR — Fase 3

## Implementazione

Il progetto Next.js App Router esistente è stato esteso, mantenendo intro GSAP, Key Vault, sei vetture, reveal interrompibile e ViewTransition. Nessun template o nuovo framework sostituisce la Fase 2.

Sono presenti Home, Collection, sei Car Detail, Services, About, Contact e Booking. Completano il progetto Privacy e Cookies dimostrativi, crediti, 404 personalizzata, favicon, immagine social, robots e sitemap.

La Collection autonoma riusa il componente Fleet estratto dalla Home. Il modulo è uno solo: BookingForm viene usato sia nel dialog sia nella pagina Booking. Non sono duplicati gli archivi delle auto o le animazioni.

## Richiesta dimostrativa

Campi: vettura, date e orari di ritiro/riconsegna, due località distinte, nome e cognome, email, telefono e note. Validazione HTML, controllo campi composti da soli spazi, telefono, data/ora di ritiro futura e riconsegna successiva. Il noleggio nello stesso giorno è ammesso quando gli orari sono coerenti.

Il modulo espone preparazione locale, riepilogo, modifica e download di un file di testo. Non esiste un endpoint di invio: nessun POST, pagamento, disponibilità verificata o prenotazione confermata. I dati personali non sono salvati nella sessionStorage. La privacy si apre in una nuova scheda per conservare il modulo; il ritorno alla Collection dal riepilogo chiude il dialog.

## Vetture e fotografie

Le pagine hanno hero, galleria esterni/interni, lightbox con tastiera, caratteristiche principali, dati del modello di riferimento, tariffe giornaliere demo, condizioni esplicite su deposito, chilometri, coperture e requisiti da definire. La CTA Request Booking rimane raggiungibile nella barra inferiore.

Copertura fotografica effettiva:

| Vettura | Esterni | Interni |
|---|---:|---:|
| Revuelto | 2 | 1 |
| 296 GTB | 2 | 0 |
| Cullinan | 1 | 2 viste parziali dell’abitacolo |
| 750S | 1 | 0 |
| 911 GT3 RS | 1 | 0 |
| G 63 | 2 | 0 |

La foto aggiuntiva della 296 GTB mostra il pacchetto Assetto Fiorano ed è indicata come allestimento illustrativo. Le foto Cullinan riguardano la prima serie; i dati G 63 si riferiscono alla versione 2018. Nessun GTS, Spider, normale GT3 o modello diverso sostituisce gli asset mancanti. La galleria dichiara esplicitamente gli interni non disponibili. Non è simulato un 360°.

Tutte le fotografie sono locali, con autore/fonte/licenza in `public/cars/credits.json` e `/credits/`: CC0, CC BY 2.0 o CC BY-SA 4.0. I font DM Sans e Manrope sono locali con licenze OFL. Non vengono caricate risorse Google Fonts durante la visita. Sono state generate varianti WebP 480/960/1600 con loader statico responsive; il reveal mantiene immagini già decodificate per continuità.

## Servizi e pagine informative

Services presenta Luxury Car Rental, Chauffeur Service, Airport Transfer, Wedding Experience, Private Events e Corporate Rental. Ogni concept ha immagine, testo, caratteristiche e richiesta informazioni che precompila il brief della pagina Booking. Tutti sono indicati come dimostrativi, senza confermare autisti, licenze, sedi o disponibilità.

About e Contact non inventano recensioni, storia aziendale, indirizzi o recapiti. Privacy e Cookies descrivono il funzionamento effettivo: nessun tracker o cookie applicativo, due sole preferenze di sessione (`velar-intro`, `velar-selected`), dati del modulo elaborati in memoria. Informative e condizioni commerciali necessitano dati aziendali reali prima dell’apertura.

## Build e hosting

`next.config.ts` usa l’export statico di Next.js, senza cambiare React o le animazioni. Il precedente Cache Components/PPR non è compatibile con export; è stato rimosso il solo caching server della scheda, il cui contenuto viene ora prerenderizzato per i sei slug. Il prefetch specifico PPR è stato sostituito con il prefetch compatibile con l’export. Le pagine non dipendono da un server Node locale o da API di ottimizzazione immagini.

- `npm run build`: output in `out/`, 21 pagine/risorse prerenderizzate nel riepilogo Next.
- `npm start`: server statico locale, porta 3000 oppure `PORT`.
- `vercel.json`: configurazione pronta per importare lo stesso progetto su Vercel; nessuna credenziale Vercel è configurata nell’ambiente.
- `.openai/hosting.json`: progetto Sites registrato, directory statica `out`.
- `src/data/site.json`: origine HTTPS restituita dal provider, usata per SEO; non è prova di pubblicazione.
- Nessun segreto o endpoint booking richiesto. `.env.example` documenta l’assenza di configurazioni sensibili.

L’eventuale URL definitivo e lo stato di pubblicazione vengono riportati nella consegna soltanto dopo una risposta di deployment riuscito e una verifica HTTPS senza credenziali.

## File principali nuovi o modificati nella Fase 3

- `src/components/Booking.tsx`, `BookingForm.tsx`, `BookingPageExperience.tsx`
- `src/components/Fleet.tsx`, `CollectionExperience.tsx`, `HomeExperience.tsx`
- `src/components/DetailExperience.tsx`, `CarGallery.tsx`, `PageIntro.tsx`
- `src/components/SiteShell.tsx`, `ExperienceContext.tsx`, `CarReveal.tsx`
- `src/data/galleries.ts`, `services.ts`, `site.json`
- `src/app/{collection,services,about,contact,booking,privacy,cookies}/page.tsx`
- `src/app/collection/[slug]/page.tsx`, `src/app/credits/page.tsx`
- `src/app/layout.tsx`, `globals.css`, `phase3.css`, `not-found.tsx`
- `src/app/opengraph-image.jpg`, `opengraph-image.alt.txt`, `sitemap.ts`, `robots.ts`
- `src/lib/static-image-loader.ts`
- `public/cars/`, `public/fonts/`: asset, varianti e licenze
- `scripts/test-phase3.mjs`, `responsive-images.mjs`, `serve-static.mjs`, `publish-sites-source.py`
- `next.config.ts`, `vercel.json`, `.openai/hosting.json`, `.env.example`, `package.json`, `.gitignore`, `README.md`

## Verifiche

Risultati della suite finale in `artifacts/phase3/results.json`: pagine dirette, immagini, SEO/404, sei chiavi e reveal corretti, gallerie/lightbox, servizio precompilato, validazione oraria nello stesso giorno, due località, riepilogo/download/modifica senza POST, CTA vettura, menu/galleria/modulo/orientamento a 360/390/430/768 px e interazioni touch in emulazione iPhone.

La suite cinematografica della Fase 2 viene eseguita anche sull’export statico. I controlli mirati di stato e fallback sono in `artifacts/phase2/state-fallback.json`. La scena del reveal viene ripristinata esplicitamente dal contesto anche quando il router statico rimonta la Home. I test sono Chromium/Playwright, non dispositivi fisici Android/iPhone né Safari nativo. Nessun risultato Lighthouse, FPS o Core Web Vitals è dichiarato senza misurazione dedicata.

## Limiti residui

Chiavi sostituite con ricostruzioni fotorealistiche AI dichiarate, senza certificazione OEM; interni mancanti di quattro vetture e set fotografico uniforme ancora da acquisire. Tariffe, servizi VIP, booking e condizioni sono dimostrativi. Nessun invio reale, contatto aziendale o pagamento. Gli importi di deposito e le quantità di chilometri non sono inventati. Rimangono da definire dati societari, informative definitive e collaudo su hardware fisico e browser diversi da Chromium.

## Deployment verificato

Pubblicazione Sites riuscita, versione 1, accesso pubblico: **https://velar-exotic-rental.one-man13.chatgpt.site**. Sorgente pubblicata: commit `1732116778ac5e3b6f895701116a05273a26b6ba`. HTTPS 200 verificato senza credenziali. La suite finale sul dominio pubblico ha superato 26 controlli, comprese le emulazioni smartphone, senza errori JavaScript né richieste fallite. Il sito continua a funzionare senza il server locale.

Prove locali: `artifacts/phase3/local-results.json`. Prove pubbliche: `artifacts/phase3/results.json`. Esito del provider: `artifacts/phase3/deployment.json`. La suite cinematografica sull’export locale ha superato tutte le sette viewport; il controllo mirato di stato/fallback è passato.

Per l’HTTP del runner Playwright in questo ambiente cloud viene usato il proxy configurato. Questo riguarda solo il test automatico, non il sito distribuito. Nessun segreto è incluso nell’export o nel repository.
