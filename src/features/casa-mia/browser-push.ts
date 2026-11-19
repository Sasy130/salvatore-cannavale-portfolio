export const PUSH_DEVICE_KEY = "casa-mia:push-device:v1";
export async function browserPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    return null;
  const registration =
    await navigator.serviceWorker.getRegistration("/casa-mia/");
  return registration ? registration.pushManager.getSubscription() : null;
}
export function applicationKey(key: string) {
  const decoded = atob(key.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(decoded, (c) => c.charCodeAt(0));
}
export async function pushRegistration() {
  await navigator.serviceWorker.register("/casa-mia/sw.js", {
    scope: "/casa-mia/",
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              Error(
                "Il servizio dell’app non è pronto. Chiudi e riapri DIMORA MIA, poi riprova.",
              ),
            ),
          10000,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
