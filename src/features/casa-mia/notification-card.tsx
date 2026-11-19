"use client";
import { useEffect, useState } from "react";
import { Bell, ArrowRight, RefreshCw, Smartphone } from "lucide-react";
import { ownerAPI } from "./use-owner";
import { browserPushSubscription, PUSH_DEVICE_KEY } from "./browser-push";

type Health =
  | "checking"
  | "active"
  | "disabled"
  | "blocked"
  | "unsupported"
  | "unconfigured"
  | "error"
  | "demo";
const labels: Record<Health, string> = {
  checking: "Verifica in corso…",
  active: "Avvisi attivi su questo telefono",
  disabled: "Collega questo telefono",
  blocked: "Notifiche bloccate da Android",
  unsupported: "Apri con Chrome su Android",
  unconfigured: "Servizio da configurare",
  error: "Stato non verificato",
  demo: "Avvisi simulati nella demo",
};
export function NotificationCard({
  demo,
  revision,
  onOpen,
  installed,
  onInstall,
}: {
  demo: boolean;
  revision: number;
  onOpen: () => void;
  installed: boolean;
  onInstall: () => void;
}) {
  const [health, setHealth] = useState<Health>(demo ? "demo" : "checking");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true,
      running = false;
    async function check() {
      if (running || document.hidden) return;
      if (!demo && !navigator.onLine) {
        setHealth("error");
        return;
      }
      if (demo) {
        setHealth("demo");
        return;
      }
      if (!(
        "Notification" in window &&
        "PushManager" in window &&
        "serviceWorker" in navigator
      )) {
        setHealth("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setHealth("blocked");
        return;
      }
      running = true;
      try {
        const [config, subscription] = await Promise.all([
          ownerAPI<{
            configured: boolean;
            devices: { id: string; active: boolean; key_current: boolean }[];
          }>("admin/push"),
          browserPushSubscription(),
        ]);
        const id = localStorage.getItem(PUSH_DEVICE_KEY);
        const device = config.devices.find((d) => d.id === id);
        if (alive)
          setHealth(
            !config.configured
              ? "unconfigured"
              : Notification.permission === "granted" &&
                  subscription &&
                  device?.active &&
                  device.key_current
                ? "active"
                : "disabled",
          );
      } catch {
        if (alive) setHealth("error");
      } finally {
        running = false;
      }
    }
    setHealth(demo ? "demo" : "checking");
    void check();
    const timer = setInterval(check, 60000);
    window.addEventListener("focus", check);
    window.addEventListener("online", check);
    window.addEventListener("offline", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("focus", check);
      window.removeEventListener("online", check);
      window.removeEventListener("offline", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [demo, revision, attempt]);
  return (
    <section className="cm-panel cm-alert-center" aria-label="App e avvisi">
      <div className="cm-panel-heading">
        <div>
          <span className="cm-kicker">IL TUO TELEFONO</span>
          <h2>Centro notifiche</h2>
        </div>
        <Bell size={22} />
      </div>
      <div
        className={"cm-push-health " + (health === "active" ? "active" : "")}
        role="status"
      >
        <i />
        {labels[health]}
      </div>
      <p className="cm-body-copy">
        {health === "active"
          ? "Ricevi gli avvisi delle nuove prenotazioni anche con l’app chiusa. Invia una prova per verificare la ricezione."
          : demo
            ? "La demo non riceve prenotazioni reali. Puoi provare l’aspetto degli avvisi."
            : health === "blocked"
              ? "Consenti le notifiche nelle impostazioni di Chrome e di Android, poi verifica di nuovo."
              : "Attiva gli avvisi per sapere quando arriva una prenotazione, anche senza tenere aperta l’app."}
      </p>
      <button className="cm-button cm-button-primary" onClick={onOpen}>
        <Bell size={17} />
        Gestisci notifiche
        <ArrowRight size={16} />
      </button>
      {(health === "error" || health === "blocked") && (
        <button
          className="cm-text-button"
          onClick={() => setAttempt((n) => n + 1)}
        >
          <RefreshCw size={15} />
          Verifica di nuovo
        </button>
      )}
      {!installed && (
        <div className="cm-install-inline">
          <Smartphone size={18} />
          <span>Accesso rapido dalla schermata Home</span>
          <button className="cm-text-button" onClick={onInstall}>
            Installa sul mio telefono
          </button>
        </div>
      )}
      <small className="cm-push-footnote">
        {demo
          ? "Solo dati di esempio su questo dispositivo."
          : "La ricezione dipende dalla connessione e dalle impostazioni del telefono. Nessun dato dell’ospite sullo schermo bloccato."}
      </small>
    </section>
  );
}
