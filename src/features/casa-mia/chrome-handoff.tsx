"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
const URL =
  "https://www.salvatorecannavale.it/casa-mia/gestione?notifications=1";
const INTENT =
  "intent://www.salvatorecannavale.it/casa-mia/gestione?notifications=1#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" +
  encodeURIComponent(URL) +
  ";end";
export function ChromeHandoff() {
  const [samsung, setSamsung] = useState(false);
  useEffect(() => {
    setSamsung(
      /Android/i.test(navigator.userAgent) &&
        /SamsungBrowser/i.test(navigator.userAgent),
    );
  }, []);
  if (!samsung) return null;
  return (
    <aside className="cm-chrome-handoff" aria-label="Collegamento con Chrome">
      <strong>Questa app usa Samsung Internet</strong>
      <p>
        Se il consenso resta in attesa, apri la gestione in Google Chrome e
        attiva lì gli avvisi. I permessi dei due browser sono separati.
      </p>
      <a className="cm-button cm-button-primary" href={INTENT}>
        Apri in Google Chrome <ArrowUpRight size={17} />
      </a>
      <small>
        In Chrome accedi con la tua password. Dopo la prova delle notifiche,
        installa l’app dal menù ⋮ di Chrome per usare la stessa copia dalla
        Home.
      </small>
    </aside>
  );
}
