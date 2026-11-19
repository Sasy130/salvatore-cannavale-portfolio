"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  OwnerData,
  Service,
  ReservationInput,
  Preview,
  PaymentInput,
  Settings,
  Booking,
} from "./types";
import {
  loadDemo,
  demoData,
  DEMO_KEY,
  previewDemo,
  saveDemo,
  paymentDemo,
  actionDemo,
  operationDemo,
  syncDemo,
  SITE_DEMO_KEY,
} from "./demo";
export async function ownerAPI<T>(path: string, input?: unknown): Promise<T> {
  const r = await fetch("/api/casa-mia/" + path, {
    credentials: "same-origin",
    cache: "no-store",
    method: input === undefined ? "GET" : "POST",
    headers: input === undefined ? {} : { "Content-Type": "application/json" },
    body: input === undefined ? undefined : JSON.stringify(input),
  });
  let b;
  try {
    b = await r.json();
  } catch {
    throw Error("Il servizio non risponde. Riprova tra poco.");
  }
  if (!r.ok)
    throw Object.assign(new Error(b.error || "Operazione non riuscita."), {
      status: r.status,
    });
  return b;
}
export function useOwner() {
  const [mounted, setMounted] = useState(false),
    [mode, setMode] = useState<"welcome" | "demo" | "live">("welcome"),
    [data, setData] = useState<OwnerData | null>(null),
    [service, setService] = useState<Service | null>(null),
    [online, setOnline] = useState(true),
    [busy, setBusy] = useState(false),
    [stale, setStale] = useState(false),
    [syncedAt, setSyncedAt] = useState(""),
    [notice, setNotice] = useState("");
  const dataRef = useRef<OwnerData | null>(null),
    modeRef = useRef(mode),
    generation = useRef(0),
    mutating = useRef(false);
  const apply = useCallback((next: OwnerData) => {
    dataRef.current = next;
    setData(next);
    setSyncedAt(new Date().toISOString());
    setStale(false);
    if (modeRef.current === "demo") {
      try {
        syncDemo(next);
      } catch {
        setNotice(
          "Lo spazio del browser non è disponibile: la demo non verrà conservata al riavvio.",
        );
      }
    }
  }, []);
  const leave = useCallback(() => {
    generation.current++;
    modeRef.current = "welcome";
    setMode("welcome");
    try {
      localStorage.removeItem("casa-mia:resume-demo");
    } catch {}
    dataRef.current = null;
    setData(null);
    setStale(false);
  }, []);
  const refresh = useCallback(
    async (silent = false) => {
      if (modeRef.current === "demo") {
        apply(loadDemo());
        if (!silent) setNotice("Demo e sito aggiornati su questo dispositivo.");
        return true;
      }
      if (modeRef.current !== "live") return false;
      const current = generation.current;
      try {
        const next = await ownerAPI<OwnerData>("admin/console");
        if (current === generation.current) {
          apply(next);
          if (!silent) setNotice("Calendario aggiornato.");
          return true;
        }
      } catch (e) {
        if (current !== generation.current) return;
        if ((e as Error & { status: number }).status === 401) {
          leave();
          setNotice("La sessione è scaduta. Accedi di nuovo.");
        } else {
          setStale(true);
          if (!silent) setNotice((e as Error).message);
        }
        return false;
      }
    },
    [apply, leave],
  );
  useEffect(() => {
    setMounted(true);
    const current = generation.current;
    ownerAPI<Service>("status")
      .then(async (s) => {
        setService(s);
        if (current !== generation.current) return;
        if (!s.enabled && !s.unavailable) {
          try {
            if (localStorage.getItem("casa-mia:resume-demo") === "yes") {
              modeRef.current = "demo";
              setMode("demo");
              apply(loadDemo());
            }
          } catch {}
        }
        if (s.enabled) {
          try {
            const next = await ownerAPI<OwnerData>("admin/console");
            if (current === generation.current) {
              modeRef.current = "live";
              setMode("live");
              apply(next);
            }
          } catch {}
        }
      })
      .catch(() =>
        setNotice(
          "Impossibile verificare il servizio. Controlla la connessione.",
        ),
      );
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/casa-mia/sw.js", { scope: "/casa-mia/" })
        .catch(() => {});
    const connectivity = () => setOnline(navigator.onLine);
    connectivity();
    addEventListener("online", connectivity);
    addEventListener("offline", connectivity);
    return () => {
      generation.current++;
      removeEventListener("online", connectivity);
      removeEventListener("offline", connectivity);
    };
  }, [apply]);
  useEffect(() => {
    if (mode === "demo") {
      const update = (event: StorageEvent) => {
        if (event.key === SITE_DEMO_KEY) apply(loadDemo());
      };
      addEventListener("storage", update);
      return () => removeEventListener("storage", update);
    }
    if (mode !== "live") return;
    const update = () => {
      if (document.visibilityState === "visible" && !mutating.current)
        void refresh(true);
    };
    const timer = setInterval(update, 30000);
    addEventListener("focus", update);
    addEventListener("online", update);
    return () => {
      clearInterval(timer);
      removeEventListener("focus", update);
      removeEventListener("online", update);
    };
  }, [mode, refresh]);
  async function login(password: string) {
    setBusy(true);
    try {
      await ownerAPI("admin/login", { password });
      const next = await ownerAPI<OwnerData>("admin/console");
      generation.current++;
      modeRef.current = "live";
      setMode("live");
      apply(next);
      setNotice("Accesso effettuato.");
    } finally {
      setBusy(false);
    }
  }
  function startDemo() {
    generation.current++;
    modeRef.current = "demo";
    setMode("demo");
    try {
      localStorage.setItem("casa-mia:resume-demo", "yes");
    } catch {}
    apply(loadDemo());
    setNotice("Demo locale aperta. Usa solo dati inventati.");
  }
  async function logout() {
    if (modeRef.current === "live") await ownerAPI("admin/logout", {});
    leave();
    setNotice("Sessione chiusa.");
  }
  async function mutate(
    action: () => Promise<unknown>,
    simulation: (d: OwnerData) => OwnerData,
    message: string,
  ) {
    if (mutating.current)
      throw Error("Attendi il completamento dell’operazione.");
    if (!online || stale)
      throw Error("Aggiorna il calendario quando sei online prima di salvare.");
    mutating.current = true;
    setBusy(true);
    try {
      if (modeRef.current === "demo") {
        if (navigator.locks)
          await navigator.locks.request(SITE_DEMO_KEY, async () =>
            apply(simulation(loadDemo())),
          );
        else apply(simulation(loadDemo()));
      } else {
        await action();
        const updated = await refresh(true);
        if (!updated) {
          setNotice(
            "Operazione salvata sul server. Aggiorna il calendario per vedere il risultato.",
          );
          return;
        }
        if (modeRef.current !== "live")
          throw Error(
            "La sessione è scaduta. Verifica il risultato dopo il nuovo accesso.",
          );
      }
      setNotice(
        modeRef.current === "demo"
          ? "Simulazione salvata su questo dispositivo."
          : message,
      );
    } catch (e) {
      if ((e as Error & { status?: number }).status === 401) {
        leave();
        setNotice("La sessione è scaduta. Accedi di nuovo.");
      }
      throw e;
    } finally {
      mutating.current = false;
      setBusy(false);
    }
  }
  const preview = async (input: ReservationInput) =>
    modeRef.current === "demo"
      ? previewDemo(dataRef.current!, input)
      : ownerAPI<Preview>("admin/preview", input);
  const save = (input: ReservationInput) =>
    mutate(
      () => ownerAPI("admin/reservations", input),
      (d) => saveDemo(d, input),
      "Calendario aggiornato: le date sono state salvate.",
    );
  const payment = (input: PaymentInput) =>
    mutate(
      () => ownerAPI("admin/payments", input),
      (d) => paymentDemo(d, input),
      "Movimento registrato. Nessun addebito o bonifico è stato eseguito dall’app.",
    );
  const action = (b: Booking, kind: "confirm" | "cancel", key: string) => {
    const input = {
      id: b.id,
      revision: b.revision,
      action: kind,
      idempotency: key,
    };
    return mutate(
      () => ownerAPI("admin/actions", input),
      (d) => actionDemo(d, input),
      kind === "confirm"
        ? "Prenotazione confermata."
        : "Date liberate. Verifica separatamente gli eventuali rimborsi.",
    );
  };
  const operation = (
    b: Booking,
    field: string,
    value: boolean,
    key: string,
  ) => {
    const input = {
      id: b.id,
      revision: b.revision,
      field,
      value,
      idempotency: key,
    };
    return mutate(
      () => ownerAPI("admin/operations", input),
      (d) => operationDemo(d, input),
      "Operazione del soggiorno aggiornata.",
    );
  };
  const settings = (next: Settings) =>
    mutate(
      () => ownerAPI("admin/settings", next),
      (d) => ({ ...d, settings: next }),
      "Tariffe e regole aggiornate.",
    );
  const reset = () => {
    if (modeRef.current === "demo") {
      apply(demoData());
      setNotice("Demo ripristinata con dati di esempio.");
    }
  };
  return {
    mounted,
    mode,
    data,
    service,
    online,
    busy,
    stale,
    syncedAt,
    notice,
    setNotice,
    login,
    startDemo,
    logout,
    refresh,
    preview,
    save,
    payment,
    action,
    settings,
    operation,
    reset,
  };
}
