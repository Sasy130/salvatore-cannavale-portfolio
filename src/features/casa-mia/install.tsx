"use client";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  Share2,
  Smartphone,
} from "lucide-react";
import { Modal, Primary } from "./ui";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
let pending: InstallEvent | null = null;
export function useInstallCapture() {
  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      pending = event as InstallEvent;
      dispatchEvent(new Event("casa-install-ready"));
    };
    addEventListener("beforeinstallprompt", capture);
    return () => removeEventListener("beforeinstallprompt", capture);
  }, []);
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
      title="CASA MIA, sul tuo telefono."
      eyebrow="IL TUO SPAZIO QUOTIDIANO"
      onClose={onClose}
      busy={busy}
    >
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
          <p>Stai già usando CASA MIA come app installata.</p>
        </div>
      ) : (
        <>
          {ready && (
            <Primary onClick={install} busy={busy}>
              <ArrowDownToLine size={18} />
              Installa su questo dispositivo
            </Primary>
          )}
          <div className="cm-instruction">
            <b>
              <Share2 size={15} /> iPhone / Safari
            </b>
            <p>
              Tocca <strong>Condividi</strong>, poi{" "}
              <strong>Aggiungi alla schermata Home</strong> e{" "}
              <strong>Aggiungi</strong>. Se la voce non appare, apri prima
              questa pagina in Safari.
            </p>
          </div>
          <div className="cm-instruction">
            <b>
              <Smartphone size={15} /> Android / Chrome
            </b>
            <p>
              Apri il menù <strong>⋮</strong> e scegli{" "}
              <strong>Installa app</strong> oppure{" "}
              <strong>Aggiungi a schermata Home</strong>.
            </p>
          </div>
        </>
      )}
      {message && (
        <p className="cm-help" role="status">
          {message}
        </p>
      )}
      <p className="cm-help">
        Per lavorare con dati condivisi serve internet. La demo si riapre sullo
        stesso dispositivo; su iPhone lo spazio dell’app installata può essere
        separato da Safari. L’accesso reale resta protetto e richiede il
        servizio configurato.
      </p>
    </Modal>
  );
}
