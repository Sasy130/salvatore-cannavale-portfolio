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
export async function pushRegistration() {
  return pushDeadline(
    (async () => {
      const registration = await navigator.serviceWorker.register(
        "/casa-mia/sw.js",
        { scope: "/casa-mia/" },
      );
      return registration.active
        ? registration
        : await navigator.serviceWorker.ready;
    })(),
    "Il servizio dell’app non risponde. Chiudi e riapri DIMORA MIA, poi riprova.",
  );
}
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
    subscription = await pushDeadline(
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      }),
      "Android non ha completato il collegamento push. Il consenso è attivo, ma il telefono non è ancora collegato al server. Controlla la connessione, apri l’app in Chrome e riprova. Se il collegamento si completa in ritardo, il prossimo tentativo lo recupera.",
      20000,
    );
  }
  return subscription;
}
