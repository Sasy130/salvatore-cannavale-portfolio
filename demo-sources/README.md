# Sorgenti delle proposte di redesign

Le cartelle contengono i sorgenti delle copie statiche pubblicate per A&J Rent Car e Rent Car Station. Sono concept indipendenti e non ufficiali, con percorsi base dedicati nel portfolio.

Per ricostruire una copia, dalla cartella del portfolio (sostituire `<slug>` con `aj-rent-car` o `rent-car-station`):

```sh
mkdir -p demo-sources/<slug>/public
cp -a public/demos/<slug>/images public/demos/<slug>/fonts demo-sources/<slug>/public/
cp public/demos/<slug>/icon.svg public/demos/<slug>/robots.txt demo-sources/<slug>/public/
cd demo-sources/<slug>
npm ci
npm run build
```

Copiare il contenuto di `out/` in `public/demos/<slug>/` dopo aver verificato i percorsi, quindi testare le pagine dal server del portfolio. I sorgenti sono esclusi dal controllo TypeScript dell'app principale e si verificano con la build indipendente di ciascun progetto. Per provenienza e licenze vedere `ASSETS.md` in ogni cartella.
