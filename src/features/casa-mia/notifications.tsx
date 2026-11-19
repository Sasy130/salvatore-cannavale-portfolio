"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Smartphone } from "lucide-react";
import { Modal, Primary, Empty } from "./ui";
import { ownerAPI } from "./use-owner";
import {
  applicationKey,
  browserPushSubscription,
  pushRegistration,
  PUSH_DEVICE_KEY,
} from "./browser-push";
type Device = {
  id: string;
  label: string;
  active: boolean;
  key_current: boolean;
  last_seen: string;
};
type Config = {
  configured: boolean;
  publicKey: string | null;
  devices: Device[];
  deliveries: {
    id: string;
    device_id: string;
    kind: string;
    status: string;
    created: string;
  }[];
};
const deliveryNames: Record<string, string> = {
  queued: "In coda",
  sending: "Invio in corso",
  accepted: "Accettata dal servizio push",
  review: "Da verificare",
  expired: "Scaduta",
  superseded: "Non più necessaria",
};
export function NotificationsPanel({
  demo,
  onClose,
}: {
  demo: boolean;
  onClose: () => void;
}) {
  const [config, setConfig] = useState<Config | null>(null),
    [permission, setPermission] = useState<string>("default"),
    [supported, setSupported] = useState(false),
    [deviceId, setDeviceId] = useState(""),
    [hasSubscription, setHasSubscription] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(!demo);
  async function refresh() {
    if (demo) return;
    setConfig(await ownerAPI<Config>("admin/push"));
    setHasSubscription(!!(await browserPushSubscription()));
  }
  useEffect(() => {
    const support =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setSupported(support);
    if (support) setPermission(Notification.permission);
    try {
      setDeviceId(localStorage.getItem(PUSH_DEVICE_KEY) || "");
    } catch {}
    let alive = true;
    if (!demo)
      Promise.all([ownerAPI<Config>("admin/push"), browserPushSubscription()])
        .then(([c, s]) => {
          if (alive) {
            setConfig(c);
            setHasSubscription(!!s);
          }
        })
        .catch(() => {
          if (alive)
            setError(
              "Impossibile verificare le notifiche. Controlla la connessione e il tuo accesso.",
            );
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    return () => {
      alive = false;
    };
  }, [demo]);
  const current = config?.devices.find((d) => d.id === deviceId),
    connected =
      !demo &&
      config?.configured &&
      permission === "granted" &&
      hasSubscription &&
      current?.active &&
      current.key_current;
  async function consent() {
    if (Notification.permission === "denied")
      throw Error(
        "Le notifiche sono bloccate. Abilitale nelle impostazioni del sito in Chrome, poi riapri l’app.",
      );
    const value =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
    setPermission(value);
    if (value !== "granted")
      throw Error(
        "Consenso non concesso. Nessun avviso al telefono è stato attivato.",
      );
  }
  async function run(work: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await work();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function enable() {
    if (demo || !config?.configured || !config.publicKey)
      throw Error(
        "Occorre prima attivare il collegamento condiviso e il servizio push.",
      );
    await consent();
    const registration = await pushRegistration();
    let subscription = await registration.pushManager.getSubscription();
    const key = applicationKey(config.publicKey);
    if (subscription) {
      const existing = subscription.options.applicationServerKey;
      if (
        !existing ||
        Array.from(new Uint8Array(existing)).join(",") !==
          Array.from(key).join(",")
      ) {
        await subscription.unsubscribe();
        subscription = null;
      }
    }
    if (!subscription)
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
    const result = await ownerAPI<{ id: string }>("admin/push/subscribe", {
      subscription: subscription.toJSON(),
      label: /Android/i.test(navigator.userAgent)
        ? "Il mio Android"
        : "Questo dispositivo",
    });
    setDeviceId(result.id);
    try {
      localStorage.setItem(PUSH_DEVICE_KEY, result.id);
    } catch {}
    await refresh();
    setMessage(
      "Telefono collegato. Ora puoi inviare una notifica di prova dal server.",
    );
  }
  async function disable(id: string) {
    await ownerAPI("admin/push/disable", { id });
    if (id === deviceId) {
      const sub = await browserPushSubscription();
      if (sub) await sub.unsubscribe();
      try {
        localStorage.removeItem(PUSH_DEVICE_KEY);
      } catch {}
      setDeviceId("");
      setHasSubscription(false);
    }
    await refresh();
    setMessage("Avvisi disattivati per questo dispositivo.");
  }
  return (
    <Modal
      title="Gli avvisi, sul tuo telefono."
      eyebrow="NOTIFICHE DIMORA MIA"
      onClose={onClose}
      busy={busy}
    >
      <div className="cm-notification-summary">
        <Bell size={25} />
        <div>
          <b>
            {demo
              ? "Demo · prova sul telefono"
              : connected
                ? "Questo telefono è collegato"
                : loading
                  ? "Verifica del servizio…"
                  : config?.configured
                    ? "Collega questo telefono"
                    : "Servizio da configurare"}
          </b>
          <p>
            {demo
              ? "Puoi provare una notifica locale. Gli avvisi delle prenotazioni reali richiedono il collegamento condiviso."
              : "Consenti gli avvisi per ricevere una notifica anche quando DIMORA MIA è chiusa. La consegna dipende dalla connessione e dalle impostazioni Android."}
          </p>
        </div>
      </div>
      <dl className="cm-key-values">
        <div>
          <dt>Sito e app</dt>
          <dd>
            {demo ? "Simulazione di questo browser" : "Calendario condiviso"}
          </dd>
        </div>
        <div>
          <dt>Consenso del telefono</dt>
          <dd>
            {!supported
              ? "Non supportato"
              : permission === "granted"
                ? "Consentito"
                : permission === "denied"
                  ? "Bloccato"
                  : "Da richiedere"}
          </dd>
        </div>
        <div>
          <dt>Avvisi delle prenotazioni</dt>
          <dd>
            {connected
              ? "Telefono collegato"
              : demo
                ? "Non collegati nella demo"
                : loading
                  ? "Verifica…"
                  : !config?.configured
                    ? "Da configurare"
                    : "Da collegare"}
          </dd>
        </div>
      </dl>
      {!supported ? (
        <p className="cm-help">
          Apri l’app con Google Chrome sul tuo Android per usare gli avvisi.
        </p>
      ) : demo ? (
        <>
          <Primary
            busy={busy}
            onClick={() =>
              run(async () => {
                await consent();
                const registration = await pushRegistration();
                await registration.showNotification("DIMORA MIA · prova locale", {
                  body: "Questa è una notifica di prova del telefono, non una prenotazione.",
                  icon: "/casa-mia/icon-192.png",
                  tag: "casa-mia-local-test",
                  data: { url: "/casa-mia/gestione", kind: "test" },
                });
                setMessage(
                  "Notifica locale richiesta al telefono. Controlla il pannello notifiche di Android. Le prenotazioni reali non sono ancora collegate.",
                );
              })
            }
          >
            <Bell size={17} />
            Prova notifica locale
          </Primary>
          <p className="cm-help">
            Premendo il pulsante potresti vedere la richiesta di consenso di
            Android. Questa prova parte dall’app aperta e non verifica la
            ricezione dal server con app chiusa.
          </p>
        </>
      ) : (
        <>
          <Primary
            busy={busy}
            disabled={
              loading ||
              !config?.configured ||
              !!connected ||
              permission === "denied"
            }
            onClick={() => run(enable)}
          >
            <Bell size={17} />
            {connected
              ? "Avvisi collegati"
              : "Attiva avvisi su questo telefono"}
          </Primary>
          {connected && (
            <button
              className="cm-button cm-button-secondary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const result = await ownerAPI<{ accepted: number }>(
                    "admin/push/test",
                    { id: deviceId },
                  );
                  setMessage(
                    result.accepted
                      ? "Prova accettata dal servizio push. Controlla il telefono."
                      : "Prova salvata in coda. Controlla lo stato degli invii.",
                  );
                  await refresh();
                })
              }
            >
              Invia prova dal server
            </button>
          )}
        </>
      )}
      {permission === "denied" && (
        <p className="cm-warning">
          Permesso bloccato: nelle impostazioni del sito in Chrome abilita
          Notifiche, poi riapri DIMORA MIA.
        </p>
      )}
      {!demo && (
        <>
          <h3 className="cm-delivery-title">Dispositivi collegati</h3>
          {config?.devices
            .filter((d) => d.active)
            .map((d) => (
              <div className="cm-document" key={d.id}>
                <div>
                  <b>
                    <Smartphone size={14} />
                    {d.label}
                    {d.id === deviceId ? " · questo telefono" : ""}
                  </b>
                  <small>
                    {d.key_current
                      ? "Collegamento aggiornato"
                      : "Da ricollegare dopo l’aggiornamento del servizio"}
                  </small>
                </div>
                <button
                  className="cm-button cm-button-secondary"
                  disabled={busy}
                  onClick={() => run(() => disable(d.id))}
                >
                  Disattiva
                </button>
              </div>
            ))}
          {config && !config.devices.some((d) => d.active) && (
            <Empty title="Nessun telefono collegato" />
          )}
          {!!config?.deliveries.length && (
            <>
              <h3 className="cm-delivery-title">Ultimi invii</h3>
              {config.deliveries.slice(0, 5).map((d) => (
                <div className="cm-document" key={d.id}>
                  <div>
                    <b>
                      {d.kind === "test"
                        ? "Prova dal server"
                        : "Nuova prenotazione"}
                    </b>
                    <small>
                      {deliveryNames[d.status] || d.status} ·{" "}
                      {new Date(d.created).toLocaleString("it-IT")}
                    </small>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
      {message && (
        <p className="cm-form-success" role="status">
          <CheckCircle2 size={17} />
          {message}
        </p>
      )}
      {error && (
        <p className="cm-form-error" role="alert">
          {error}
        </p>
      )}
      <p className="cm-help">
        Sul display bloccato compare solo un avviso generico. Per leggere i dati
        degli ospiti serve accedere all’app. Disattivando il dispositivo o
        uscendo dalla gestione vengono revocati i suoi avvisi dal server.
      </p>
    </Modal>
  );
}
