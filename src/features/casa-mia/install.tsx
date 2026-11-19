"use client";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  Share2,
  Smartphone,
} from "lucide-react";
import { ChromeHandoff } from "./chrome-handoff";
import { Modal, Primary } from "./ui";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
let pending: InstallEvent | null = null;
export function useInstallCapture() {
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const display = matchMedia("(display-mode: standalone)");
    const check = () =>
      setInstalled(
        display.matches ||
          !!(navigator as Navigator & { standalone?: boolean }).standalone,
      );
    const done = () => {
      pending = null;
      setInstalled(true);
    };
    check();
    display.addEventListener("change", check);
    addEventListener("appinstalled", done);
    const capture = (event: Event) => {
      event.preventDefault();
      pending = event as InstallEvent;
      dispatchEvent(new Event("casa-install-ready"));
    };
    addEventListener("beforeinstallprompt", capture);
    return () => {
      removeEventListener("beforeinstallprompt", capture);
      display.removeEventListener("change", check);
      removeEventListener("appinstalled", done);
    };
  }, []);
  return { installed };
}
export function InstallPanel({ onClose }: { onClose: () => void }) {
  const [ready, setReady] = useState(!!pending),
    [installed, setInstalled] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    const standalone = () =>
      setInstalled(
        matchMedia("(display-mode: standalone)").matches ||
          !!(navigator as Navigator & { standalone?: boolean }).standalone,
      );
    standalone();
    const capture = () => setReady(!!pending);
    const done = () => {
      pending = null;
      setReady(false);
      setInstalled(true);
    };
    addEventListener("casa-install-ready", capture);
    addEventListener("appinstalled", done);
    return () => {
      removeEventListener("casa-install-ready", capture);
      removeEventListener("appinstalled", done);
    };
  }, []);
  async function install() {
    if (!pending) return;
    setBusy(true);
    try {
      await pending.prompt();
      const choice = await pending.userChoice;
      pending = null;
      setReady(false);
      setMessage(
        choice.outcome === "accepted"
          ? "Richiesta di installazione accettata. Attendi la conferma del telefono."
          : "Puoi installarla più tardi dal menù del browser.",
      );
    } catch {
      setMessage("Usa il menù del browser per aggiungere l’app alla Home.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="DIMORA MIA, sul tuo telefono."
      eyebrow="IL TUO SPAZIO QUOTIDIANO"
      onClose={onClose}
      busy={busy}
    >
      <ChromeHandoff />
      <div className="cm-install-icon">
        <Smartphone size={30} />
      </div>
      <p className="cm-modal-intro">
        Un’icona nella schermata Home. Il calendario, gli ospiti e i saldi
        sempre a portata di mano.
      </p>
      {installed ? (
        <div className="cm-info-box">
          <CheckCircle2 size={20} />
          <p>Stai già usando DIMORA MIA come app installata.</p>
        </div>
      ) : (
        <>
          {ready && (
            <Primary onClick={install} busy={busy}>
              <ArrowDownToLine size={18} />
              Installa su questo dispositivo
            </Primary>
          )}
          <div className="cm-instruction cm-android-instructions">
            <b>
              <Smartphone size={18} /> Sul tuo Android
            </b>
            <ol>
              <li>
                Apri questa pagina in <strong>Google Chrome</strong>.
              </li>
              <li>
                Tocca il menù <strong>⋮</strong> in alto a destra.
              </li>
              <li>
                Scegli <strong>Installa app</strong> oppure{" "}
                <strong>Aggiungi a schermata Home</strong>, poi conferma.
              </li>
            </ol>
            <p>
              Se stai leggendo da ChatGPT, WhatsApp o un altro browser interno,
              usa “Apri in Chrome” dal suo menù. Non serve scaricare un APK.
            </p>
          </div>
          <div className="cm-copy-install">
            <label>
              Link da aprire in Chrome
              <input
                readOnly
                value={
                  typeof location !== "undefined"
                    ? location.origin + "/casa-mia/gestione?install=1"
                    : ""
                }
                onFocus={(e) => e.currentTarget.select()}
              />
            </label>
            <button
              className="cm-button cm-button-secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    location.origin + "/casa-mia/gestione?install=1",
                  );
                  setMessage("Link copiato. Aprilo in Chrome sul telefono.");
                } catch {
                  setMessage(
                    "Tieni premuto sul link e copialo, poi aprilo in Chrome.",
                  );
                }
              }}
            >
              Copia link dell’app
            </button>
          </div>
          <details className="cm-instruction">
            <summary>
              <Share2 size={15} /> Istruzioni per iPhone
            </summary>
            <p>
              In Safari:{" "}
              <strong>
                Condividi → Aggiungi alla schermata Home → Aggiungi
              </strong>
              .
            </p>
          </details>
        </>
      )}
      {message && (
        <p className="cm-help" role="status">
          {message}
        </p>
      )}
      <p className="cm-help">
        Dopo l’installazione puoi gestire gli avvisi nella schermata Notifiche.
        Il consenso del telefono e il collegamento al server sono separati
        dall’installazione.
      </p>
      <p className="cm-help">
        Per lavorare con dati condivisi serve internet. La demo si riapre sullo
        stesso dispositivo; su iPhone lo spazio dell’app installata può essere
        separato da Safari. L’accesso reale resta protetto e richiede il
        servizio configurato.
      </p>
    </Modal>
  );
}
