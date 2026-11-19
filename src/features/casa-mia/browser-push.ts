export const PUSH_DEVICE_KEY = "casa-mia:push-device:v1";
export async function browserPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    return null;
  const registration = await pushDeadline(
    navigator.serviceWorker.getRegistration("/casa-mia/"),
    "Verifica del servizio scaduta.",
  );
  return registration
    ? pushDeadline(
        registration.pushManager.getSubscription(),
        "Verifica degli avvisi scaduta.",
      )
    : null;
}
export function applicationKey(key: string) {
  const decoded = atob(key.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(decoded, (c) => c.charCodeAt(0));
}
export async function pushDeadline<T>(
  work: Promise<T>,
  message: string,
  milliseconds = 12000,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(Error(message)), milliseconds);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
export async function waitForPushWorker(
  registration: ServiceWorkerRegistration,
) {
  if (registration.active?.state === "activated") return registration;
  return new Promise<ServiceWorkerRegistration>((resolve, reject) => {
    const watched = new Set<ServiceWorker>();
    const cleanup = () => {
      clearTimeout(timer);
      registration.removeEventListener("updatefound", check);
      for (const worker of watched)
        worker.removeEventListener("statechange", check);
    };
    const check = () => {
      if (registration.active?.state === "activated") {
        cleanup();
        resolve(registration);
        return;
      }
      for (const worker of [
        registration.active,
        registration.installing,
        registration.waiting,
      ]) {
        if (worker && !watched.has(worker)) {
          watched.add(worker);
          worker.addEventListener("statechange", check);
        }
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(
        Error(
          "Il servizio dell’app non ha completato l’attivazione. Riapri l’app in Chrome e riprova.",
        ),
      );
    }, 12000);
    registration.addEventListener("updatefound", check);
    check();
  });
}
export async function pushRegistration() {
  const registration = await pushDeadline(
    navigator.serviceWorker.register("/casa-mia/sw.js", {
      scope: "/casa-mia/",
    }),
    "Il servizio dell’app non risponde. Chiudi e riapri DIMORA MIA, poi riprova.",
  );
  return waitForPushWorker(registration);
}
// Reuse the same pending native request after a UI timeout. Android may complete it later.
const pendingSubscriptions = new Map<string, Promise<PushSubscription>>();
export async function connectBrowserPush(
  publicKey: string,
  stage: (value: string) => void,
) {
  stage("Preparazione del servizio sul telefono…");
  const registration = await pushRegistration();
  stage("Verifica del collegamento esistente…");
  let subscription = await pushDeadline(
    registration.pushManager.getSubscription(),
    "Il telefono non risponde alla verifica degli avvisi. Riapri l’app e riprova.",
  );
  const key = applicationKey(publicKey);
  if (subscription) {
    const existing = subscription.options.applicationServerKey;
    if (
      !existing ||
      Array.from(new Uint8Array(existing)).join(",") !==
        Array.from(key).join(",")
    ) {
      await pushDeadline(
        subscription.unsubscribe(),
        "Il vecchio collegamento non risponde. Riprova tra poco.",
      );
      subscription = null;
    }
  }
  if (!subscription) {
    stage("Collegamento al servizio notifiche di Android…");
    let pending = pendingSubscriptions.get(publicKey);
    if (!pending) {
      pending = registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
      pendingSubscriptions.set(publicKey, pending);
      const clear = () => {
        if (pendingSubscriptions.get(publicKey) === pending)
          pendingSubscriptions.delete(publicKey);
      };
      void pending.then(clear, clear);
    }
    subscription = await pushDeadline(
      pending,
      "Android non ha completato il collegamento push. Il consenso è attivo, ma il telefono non è ancora collegato al server. Controlla la connessione, apri l’app in Chrome e riprova. Se il collegamento si completa in ritardo, il prossimo tentativo lo recupera.",
      20000,
    );
  }
  return subscription;
}
