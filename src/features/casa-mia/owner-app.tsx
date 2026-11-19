"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  History,
  House,
  Info,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Smartphone,
  TriangleAlert,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { useOwner } from "./use-owner";
import {
  propertyToday,
  addDays,
  isActive,
  isCancelled,
  moneyState,
  occupancy,
  searchBookings,
  bookingsCSV,
  parseMoney,
  dateRange,
} from "./model.mjs";
import {
  Brand,
  Empty,
  InstallHelp,
  Modal,
  Primary,
  Status,
  day,
  money,
  source,
} from "./ui";
import { ReservationEditor, type EditorDraft } from "./reservation-editor";
import { BookingDetail, EVENT_NAMES } from "./booking-detail";
import { PaymentEditor } from "./payment-editor";
import type { Booking, OwnerData, Settings, Tab } from "./types";
const NAV: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Panoramica", icon: LayoutDashboard },
  { id: "calendar", label: "Calendario", icon: CalendarDays },
  { id: "reservations", label: "Prenotazioni", icon: Users },
  { id: "finance", label: "Incassi e saldi", icon: Wallet },
  { id: "settings", label: "Impostazioni", icon: Settings2 },
];
const TITLES: Record<Tab, { title: string; description: string }> = {
  overview: {
    title: "Ogni soggiorno, sotto controllo.",
    description: "Richieste, prossimi ospiti e priorità della tua casa.",
  },
  calendar: {
    title: "Il calendario della tua casa.",
    description: "Disponibilità, prenotazioni e blocchi, nello stesso posto.",
  },
  reservations: {
    title: "Tutti i tuoi soggiorni.",
    description: "Cerca un ospite, controlla le date e apri il dettaglio.",
  },
  finance: {
    title: "Importi chiari. Nessuna sorpresa.",
    description:
      "Valore dei soggiorni, incassi annotati e saldi ancora da registrare.",
  },
  settings: {
    title: "Le regole dell’accoglienza.",
    description: "Tariffe, condizioni e collegamenti della tua struttura.",
  },
};
const METHODS: Record<string, string> = {
  cash: "Contanti",
  bank: "Bonifico",
  pos: "POS esterno",
  other: "Altro metodo",
};
function monthEnd(month: string) {
  const d = new Date(month + "T12:00:00Z");
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
    .toISOString()
    .slice(0, 10);
}
function moveMonth(month: string, delta: number) {
  const d = new Date(month + "T12:00:00Z");
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 1))
    .toISOString()
    .slice(0, 10);
}
function monthLabel(month: string) {
  return new Date(month + "T12:00:00Z").toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
function BookingRows({
  bookings,
  data,
  onOpen,
  empty = "Nessun soggiorno in questa vista.",
}: {
  bookings: Booking[];
  data: OwnerData;
  onOpen: (b: Booking) => void;
  empty?: string;
}) {
  return bookings.length ? (
    <div className="cm-booking-list" role="list">
      {bookings.map((b) => {
        const m = moneyState(b, data.payments);
        return (
          <div role="listitem" key={b.id}>
            <button className="cm-booking-row" onClick={() => onOpen(b)}>
              <span
                className={
                  "cm-guest-avatar " + (b.payment === "block" ? "block" : "")
                }
              >
                {b.payment === "block" ? (
                  <LockKeyhole size={18} />
                ) : (
                  b.name.slice(0, 1).toUpperCase()
                )}
              </span>
              <span className="cm-row-guest">
                <strong>{b.name}</strong>
                <small>
                  {b.payment === "block"
                    ? "Periodo non disponibile"
                    : source(b.source)}
                </small>
              </span>
              <span className="cm-row-period">
                <b>
                  {day(b.checkin)} <ArrowRight size={12} /> {day(b.checkout)}
                </b>
                <small>
                  {dateRange(b.checkin, b.checkout, 365).length} notti
                  {b.payment !== "block" ? " · " + b.guests + " ospiti" : ""}
                </small>
              </span>
              <span className="cm-row-status">
                <Status booking={b} payments={data.payments} />
              </span>
              <span className="cm-row-value">
                <strong>
                  {b.payment === "block"
                    ? "—"
                    : money(m.refundReview || m.balance)}
                </strong>
                <small>
                  {m.refundReview
                    ? "da valutare"
                    : b.payment === "block"
                      ? "blocco"
                      : m.balance
                        ? "residuo"
                        : "saldo chiuso"}
                </small>
              </span>
              <ChevronRight size={16} className="cm-row-arrow" />
            </button>
          </div>
        );
      })}
    </div>
  ) : (
    <Empty title={empty}>
      Le prenotazioni appariranno qui quando corrispondono ai filtri scelti.
    </Empty>
  );
}
function SettingsPanel({
  data,
  busy,
  onSave,
  onReset,
  demo,
  onInstall,
}: {
  data: OwnerData;
  busy: boolean;
  onSave: (s: Settings) => Promise<void>;
  onReset: () => void;
  demo: boolean;
  onInstall: () => void;
}) {
  const [error, setError] = useState(""),
    [success, setSuccess] = useState(false),
    [reset, setReset] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget,
      s = { ...data.settings };
    try {
      for (const k of ["baseRate", "summerRate", "cleaning"] as const) {
        const v = parseMoney(
          (f.elements.namedItem(k) as HTMLInputElement).value,
        );
        if (v === null) throw Error("Completa tutte le tariffe.");
        s[k] = v;
      }
      for (const k of ["minStay", "summerMinStay", "depositPercent"] as const)
        s[k] = Number((f.elements.namedItem(k) as HTMLInputElement).value);
      for (const k of [
        "payOnArrival",
        "manualConfirmation",
        "fullOnline",
        "depositOnline",
      ] as const)
        s[k] = (f.elements.namedItem(k) as HTMLInputElement).checked;
      if (!s.payOnArrival && !s.fullOnline && !s.depositOnline)
        throw Error("Mantieni almeno una modalità di pagamento.");
      setError("");
      setSuccess(false);
      await onSave(s);
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <div className="cm-settings-layout">
        <form className="cm-panel" onSubmit={submit}>
          <div className="cm-panel-heading">
            <div>
              <span className="cm-kicker">DISPONIBILITÀ E PREZZI</span>
              <h2>Tariffe della casa</h2>
            </div>
            <Settings2 size={20} />
          </div>
          <div className="cm-fields-two">
            <label>
              Prezzo base per notte (€)
              <input
                name="baseRate"
                inputMode="decimal"
                required
                defaultValue={String(data.settings.baseRate / 100).replace(
                  ".",
                  ",",
                )}
              />
            </label>
            <label>
              Giugno–settembre per notte (€)
              <input
                name="summerRate"
                inputMode="decimal"
                required
                defaultValue={String(data.settings.summerRate / 100).replace(
                  ".",
                  ",",
                )}
              />
            </label>
            <label>
              Pulizia finale (€)
              <input
                name="cleaning"
                inputMode="decimal"
                required
                defaultValue={String(data.settings.cleaning / 100).replace(
                  ".",
                  ",",
                )}
              />
            </label>
            <label>
              Acconto (%)
              <input
                name="depositPercent"
                type="number"
                min="1"
                max="99"
                required
                defaultValue={data.settings.depositPercent}
              />
            </label>
            <label>
              Minimo notti · base
              <input
                name="minStay"
                type="number"
                min="1"
                max="30"
                required
                defaultValue={data.settings.minStay}
              />
            </label>
            <label>
              Minimo notti · estate
              <input
                name="summerMinStay"
                type="number"
                min="1"
                max="30"
                required
                defaultValue={data.settings.summerMinStay}
              />
            </label>
          </div>
          <div className="cm-form-section">
            <h3>Conferme e pagamenti</h3>
            <label className="cm-switch-row">
              <span>
                <b>Pagamento in struttura</b>
                <small>
                  Le richieste occupano le date secondo le regole di conferma.
                </small>
              </span>
              <input
                name="payOnArrival"
                type="checkbox"
                defaultChecked={data.settings.payOnArrival}
              />
            </label>
            <label className="cm-switch-row">
              <span>
                <b>Conferma manuale</b>
                <small>
                  Decidi tu se accettare le richieste ricevute dal sito.
                </small>
              </span>
              <input
                name="manualConfirmation"
                type="checkbox"
                defaultChecked={data.settings.manualConfirmation}
              />
            </label>
            {(
              [
                ["fullOnline", "Saldo completo online"],
                ["depositOnline", "Acconto online"],
              ] as const
            ).map(([id, label]) => (
              <label className="cm-switch-row" key={id}>
                <span>
                  <b>{label}</b>
                  <small>
                    {data.stripeReady
                      ? "Stripe test configurato. Nessun pagamento reale."
                      : "Richiede configurazione di Stripe test e webhook."}
                  </small>
                </span>
                <input
                  name={id}
                  type="checkbox"
                  disabled={!data.stripeReady || demo}
                  defaultChecked={data.settings[id]}
                />
              </label>
            ))}
          </div>
          <p className="cm-help">
            Le modifiche valgono per i nuovi preventivi. Non cambiano
            automaticamente il totale dei soggiorni già registrati.
          </p>
          {error && (
            <p className="cm-form-error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="cm-form-success" role="status">
              <CheckCircle2 size={17} />
              Regole salvate.
            </p>
          )}
          <Primary type="submit" busy={busy}>
            Salva le impostazioni <Check size={17} />
          </Primary>
        </form>
        <div className="cm-settings-side">
          <section className="cm-panel">
            <span className="cm-kicker">LA TUA STRUTTURA</span>
            <h2>CASA MIA</h2>
            <p className="cm-body-copy">
              Una casa, un inventario. Le notti bloccate non possono essere
              prenotate attraverso lo stesso calendario condiviso.
            </p>
            <dl className="cm-key-values">
              <div>
                <dt>Capienza configurata</dt>
                <dd>4 ospiti</dd>
              </div>
              <div>
                <dt>Fuso di riferimento</dt>
                <dd>Europe/Rome</dd>
              </div>
              <div>
                <dt>Modalità</dt>
                <dd>
                  {demo
                    ? "Demo di questo dispositivo"
                    : "Backend condiviso · test"}
                </dd>
              </div>
            </dl>
            <p className="cm-help">
              Dati della struttura da confermare prima dell’uso commerciale.
            </p>
          </section>
          <section className="cm-panel">
            <span className="cm-kicker">CONNESSIONI</span>
            <h2>Canali e servizi</h2>
            <div className="cm-connection">
              <span>Calendario del sito</span>
              <b>{demo ? "Demo locale collegata" : "Database condiviso"}</b>
            </div>
            <div className="cm-connection">
              <span>Booking.com / Airbnb</span>
              <b className="cm-text-amber">Non collegati</b>
            </div>
            <div className="cm-connection">
              <span>Stripe</span>
              <b>{data.stripeReady ? "Test configurato" : "Da configurare"}</b>
            </div>
            <div className="cm-connection">
              <span>Email</span>
              <b>{data.emailReady ? "Configurate" : "Da configurare"}</b>
            </div>
            <p className="cm-help">
              Le etichette Airbnb e Booking.com identificano inserimenti
              manuali. Non sono una sincronizzazione con i portali.
            </p>
          </section>
          <section className="cm-panel">
            <Smartphone size={23} />
            <h2>Portala sul telefono.</h2>
            <p className="cm-body-copy">
              Apri il calendario dalla schermata Home, come un’app.
            </p>
            <button
              className="cm-button cm-button-secondary"
              onClick={onInstall}
            >
              Come installarla <ArrowUpRight size={17} />
            </button>
            {demo && (
              <button
                className="cm-text-button cm-destructive"
                onClick={() => setReset(true)}
              >
                Ripristina dati di esempio
              </button>
            )}
          </section>
        </div>
      </div>
      {!!data.settings.blockedDates.length && (
        <section className="cm-panel">
          <h2>Date chiuse nelle regole</h2>
          <p className="cm-help">
            Blocchi ereditati dalle impostazioni. I nuovi periodi si gestiscono
            dal calendario.
          </p>
          {data.settings.blockedDates.map((d) => (
            <div className="cm-connection" key={d}>
              <span>{day(d, true)}</span>
              <button
                className="cm-text-button"
                disabled={busy}
                onClick={() =>
                  onSave({
                    ...data.settings,
                    blockedDates: data.settings.blockedDates.filter(
                      (x) => x !== d,
                    ),
                  }).catch((e) => setError((e as Error).message))
                }
              >
                Riapri questa data
              </button>
            </div>
          ))}
        </section>
      )}
      {reset && (
        <Modal
          title="Ripristinare la demo?"
          eyebrow="SOLO QUESTO DISPOSITIVO"
          onClose={() => setReset(false)}
        >
          <p className="cm-modal-intro">
            Verranno sostituiti i dati dimostrativi dell’app e del sito in
            questo browser. Nessuna prenotazione reale viene toccata.
          </p>
          <div className="cm-modal-actions">
            <button
              className="cm-button cm-button-quiet"
              onClick={() => setReset(false)}
            >
              Mantieni i dati
            </button>
            <Primary
              onClick={() => {
                onReset();
                setReset(false);
              }}
            >
              Ripristina demo
            </Primary>
          </div>
        </Modal>
      )}
    </>
  );
}
export function OwnerApp() {
  const owner = useOwner();
  const [tab, setTab] = useState<Tab>("overview"),
    [editor, setEditor] = useState<EditorDraft | null>(null),
    [detailId, setDetailId] = useState(""),
    [payment, setPayment] = useState<{
      id: string;
      kind: "receipt" | "refund";
    } | null>(null),
    [install, setInstall] = useState(false),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("active"),
    [channel, setChannel] = useState("all"),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [financeTab, setFinanceTab] = useState("dues"),
    [range, setRange] = useState<{ start: string; end: string } | null>(null),
    [loginError, setLoginError] = useState("");
  const today = propertyToday(),
    [month, setMonth] = useState(today.slice(0, 7) + "-01");
  useEffect(() => {
    if (owner.mode === "welcome") {
      setEditor(null);
      setDetailId("");
      setPayment(null);
      setTab("overview");
    }
  }, [owner.mode]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab, owner.mode]);
  const data = owner.data,
    bookings = data?.bookings || [],
    payments = data?.payments || [],
    demo = owner.mode === "demo",
    disabled = owner.busy || !owner.online || owner.stale;
  const detail = bookings.find((b) => b.id === detailId),
    payBooking = bookings.find((b) => b.id === payment?.id);
  const currentBookings = useMemo(
    () =>
      searchBookings(bookings, {
        search,
        status,
        source: channel,
        from,
        to,
      }) as Booking[],
    [bookings, search, status, channel, from, to],
  );
  function navigate(next: Tab) {
    setTab(next);
    setRange(null);
    owner.setNotice("");
  }
  function openEditor(kind: "booking" | "block", booking?: Booking) {
    setDetailId("");
    setEditor({
      kind,
      booking,
      start: range?.start,
      end: range?.end || undefined,
    });
  }
  function openDetail(b: Booking) {
    setDetailId(b.id);
  }
  function exportRows(rows: Booking[]) {
    const blob = new Blob([bookingsCSV(rows, payments)], {
        type: "text/csv;charset=utf-8",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = (demo ? "CASA-MIA-DEMO-prenotazioni-" : "CASA-MIA-prenotazioni-") + today + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    owner.setNotice(
      "Riepilogo CSV esportato. È un documento gestionale, non fiscale.",
    );
  }
  if (!owner.mounted)
    return (
      <div className="cm-startup">
        <Brand />
        <span className="cm-startup-line" />
        <p>Prepariamo la tua gestione…</p>
      </div>
    );
  if (!data)
    return (
      <div className="cm-auth-shell">
        <header className="cm-auth-header">
          <Brand />
          <button
            className="cm-button cm-button-quiet"
            onClick={() => setInstall(true)}
          >
            <Smartphone size={17} />
            Installa l’app
          </button>
        </header>
        <main className="cm-auth-main">
          <div className="cm-auth-copy">
            <span className="cm-kicker">
              UNA CASA. UNA GESTIONE PIÙ SEMPLICE.
            </span>
            <h1>
              Accogli meglio.
              <br />
              <em>Gestisci con chiarezza.</em>
            </h1>
            <p>
              Un calendario ordinato, prenotazioni da ogni contatto e importi
              sempre leggibili. Il tuo spazio di lavoro, anche dal telefono.
            </p>
            <div className="cm-auth-benefits">
              <span>
                <CheckCircle2 size={18} />
                Disponibilità e blocchi in un solo calendario
              </span>
              <span>
                <CheckCircle2 size={18} />
                Soggiorni ricevuti anche fuori dal sito
              </span>
              <span>
                <CheckCircle2 size={18} />
                Incassi annotati e saldi da registrare
              </span>
            </div>
            <div className="cm-auth-sequence">
              <span>
                <i>01</i>Controlla le date
              </span>
              <ArrowRight size={16} />
              <span>
                <i>02</i>Registra il soggiorno
              </span>
              <ArrowRight size={16} />
              <span>
                <i>03</i>Accogli gli ospiti
              </span>
            </div>
          </div>
          <section className="cm-login-card">
            <span className="cm-kicker">AREA PROPRIETARIO</span>
            <h2>Benvenuto nella tua casa.</h2>
            {owner.service?.enabled ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  setLoginError("");
                  try {
                    await owner.login(
                      String(new FormData(form).get("password")),
                    );
                    form.reset();
                  } catch (e) {
                    setLoginError((e as Error).message);
                  }
                }}
              >
                <label>
                  Password proprietario
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    minLength={12}
                    required
                  />
                </label>
                {loginError && (
                  <p className="cm-form-error" role="alert">
                    {loginError}
                  </p>
                )}
                <Primary type="submit" busy={owner.busy}>
                  Accedi alla gestione <ArrowRight size={17} />
                </Primary>
              </form>
            ) : (
              <div className="cm-login-state">
                <span className="cm-indicator" />
                <p>
                  {owner.service?.unavailable
                    ? "Il servizio condiviso non è raggiungibile. Riprova tra poco."
                    : owner.service
                      ? "Il collegamento al database reale è ancora da configurare. Intanto puoi provare l’app."
                      : "Verifica del servizio in corso…"}
                </p>
              </div>
            )}
            <div className="cm-login-divider">
              <span>ESPLORA PRIMA DI ACCEDERE</span>
            </div>
            <button
              className="cm-button cm-button-secondary"
              disabled={owner.busy}
              onClick={owner.startDemo}
            >
              Apri la demo interattiva <ArrowUpRight size={18} />
            </button>
            <p className="cm-help">
              Dati fittizi, salvati solo su questo dispositivo. La demo è
              collegata alla simulazione del sito nello stesso browser. Nessuna
              prenotazione o pagamento reale.
            </p>
          </section>
        </main>
        <footer className="cm-auth-footer">
          <a href="/demos/dimora-mia/">
            Visita il sito CASA MIA <ArrowUpRight size={14} />
          </a>
          <a href="/">
            Portfolio ONE MAN <ArrowUpRight size={14} />
          </a>
          <span>UN’ESPERIENZA DI OSPITALITÀ, ANCHE DIETRO LE QUINTE.</span>
        </footer>
        {owner.notice && (
          <div className="cm-toast" role="status">
            {owner.notice}
            <button
              onClick={() => owner.setNotice("")}
              aria-label="Chiudi avviso"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {install && <InstallHelp onClose={() => setInstall(false)} />}
      </div>
    );
  const pending = bookings.filter((b) => b.status === "pending"),
    stays = bookings.filter((b) => isActive(b) && b.payment !== "block"),
    arrivals = stays
      .filter((b) => b.status === "confirmed" && b.checkin >= today)
      .sort((a, b) => a.checkin.localeCompare(b.checkin)),
    arrivalsToday = stays.filter(
      (b) => b.status === "confirmed" && b.checkin === today,
    ),
    departuresToday = stays.filter(
      (b) => b.status === "confirmed" && b.checkout === today,
    ),
    balance = stays.reduce(
      (sum, b) => sum + moneyState(b, payments).balance,
      0,
    ),
    refunds = bookings.filter((b) => moneyState(b, payments).refundReview > 0),
    paid = bookings.reduce((sum, b) => sum + moneyState(b, payments).paid, 0),
    currentMonth = today.slice(0, 7) + "-01",
    occ = occupancy(bookings, currentMonth, monthEnd(currentMonth)),
    activity = data.activity.slice(0, 5),
    monthDays = dateRange(month, monthEnd(month), 31),
    offset = (new Date(month + "T12:00:00Z").getUTCDay() + 6) % 7;
  const selectedBookings = range?.start
    ? bookings.filter(
        (b) =>
          isActive(b) &&
          b.checkin < (range.end || addDays(range.start, 1)) &&
          b.checkout > range.start,
      )
    : [];
  return (
    <div className="cm-shell">
      <aside className="cm-sidebar">
        <Brand />
        <div className="cm-property-card">
          <span className="cm-property-icon">
            <House size={20} />
          </span>
          <div>
            <strong>CASA MIA</strong>
            <small>La tua struttura</small>
          </div>
          <span className="cm-property-dot" />
        </div>
        <p className="cm-nav-label">GESTIONE DELLA CASA</p>
        <nav aria-label="Navigazione principale">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={tab === item.id ? "active" : ""}
              aria-current={tab === item.id ? "page" : undefined}
            >
              <item.icon size={19} />
              {item.label}
              {item.id === "reservations" && pending.length > 0 && (
                <span className="cm-nav-count">{pending.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="cm-sidebar-bottom">
          <a
            href="/demos/dimora-mia/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowUpRight size={17} />
            Apri il sito
          </a>
          <button onClick={() => setInstall(true)}>
            <Smartphone size={17} />
            Installa sul telefono
          </button>
          <button
            disabled={owner.busy}
            onClick={() =>
              owner.logout().catch((e) => owner.setNotice(e.message))
            }
          >
            <LogOut size={17} />
            Esci dalla gestione
          </button>
          <span>CASA MIA / PROPERTY MANAGER</span>
        </div>
      </aside>
      <div className="cm-workspace">
        <header className="cm-topbar">
          <div className="cm-breadcrumb">
            <span>Gestione</span>
            <ChevronRight size={13} />
            <b>{NAV.find((n) => n.id === tab)?.label}</b>
          </div>
          <div className="cm-mobile-brand">
            CASA MIA<span>GESTIONE</span>
          </div>
          <div className="cm-topbar-tools">
            <span
              className={
                "cm-sync " + (owner.stale || !owner.online ? "warning" : "")
              }
            >
              <i />
              {demo
                ? "Demo locale"
                : owner.stale
                  ? "Non aggiornato"
                  : owner.online
                    ? "Collegato"
                    : "Offline"}
            </span>
            <button
              className="cm-icon-button"
              disabled={owner.busy || !owner.online}
              onClick={() =>
                owner.refresh().catch((e) => owner.setNotice(e.message))
              }
              aria-label="Aggiorna il calendario"
            >
              <RefreshCw size={17} />
            </button>
            <button
              className="cm-icon-button cm-mobile-logout"
              disabled={owner.busy}
              onClick={() =>
                owner.logout().catch((e) => owner.setNotice(e.message))
              }
              aria-label="Esci dalla gestione"
            >
              <LogOut size={17} />
            </button>
            <span className="cm-owner-avatar" aria-label="Area proprietario">
              CM
            </span>
          </div>
        </header>
        <main className="cm-main">
          <div className={"cm-mode-banner " + (demo ? "demo" : "")}>
            <Info size={17} />
            <p>
              {demo ? (
                <>
                  <strong>
                    Demo collegata al sito, solo su questo dispositivo.
                  </strong>{" "}
                  Usa dati fittizi: salvataggi e blocchi non sono prenotazioni
                  reali.
                </>
              ) : (
                <>
                  <strong>Calendario condiviso · ambiente di prova.</strong>{" "}
                  Pagamenti Stripe test. I canali esterni non sono
                  sincronizzati.
                </>
              )}
            </p>
            <button onClick={() => navigate("settings")}>
              Dettagli <ArrowUpRight size={14} />
            </button>
          </div>
          {(!owner.online || owner.stale) && (
            <div className="cm-stale-banner" role="alert">
              <TriangleAlert size={18} />
              <span>
                {!owner.online
                  ? "Sei offline."
                  : "Il calendario non è aggiornato."}{" "}
                Riconnettiti e premi Aggiorna prima di modificare le date.
              </span>
            </div>
          )}
          <section className="cm-page-heading">
            <div>
              <span className="cm-kicker">
                {demo ? "LA TUA REGIA / DEMO" : "LA TUA REGIA"}
              </span>
              <h1>{TITLES[tab].title}</h1>
              <p>{TITLES[tab].description}</p>
            </div>
            <div className="cm-heading-actions">
              <button
                className="cm-button cm-button-secondary"
                disabled={disabled}
                onClick={() => openEditor("block")}
              >
                <LockKeyhole size={16} />
                Blocca date
              </button>
              <Primary
                disabled={disabled}
                onClick={() => openEditor("booking")}
              >
                <Plus size={18} />
                Prenotazione
              </Primary>
            </div>
          </section>
          {tab === "overview" && (
            <>
              <div className="cm-metrics">
                <button
                  onClick={() => {
                    setStatus("pending");
                    navigate("reservations");
                  }}
                >
                  <span>
                    <CheckCircle2 size={17} />
                    DA CONFERMARE
                  </span>
                  <strong>{pending.length}</strong>
                  <small>
                    richieste da controllare <ArrowRight size={14} />
                  </small>
                </button>
                <button
                  onClick={() => {
                    setStatus("active");
                    setFrom(today);
                    setTo(addDays(today, 7));
                    navigate("reservations");
                  }}
                >
                  <span>
                    <Users size={17} />
                    ARRIVI NEI PROSSIMI 7 GIORNI
                  </span>
                  <strong>
                    {
                      arrivals.filter((b) => b.checkin < addDays(today, 7))
                        .length
                    }
                  </strong>
                  <small>
                    solo soggiorni attivi <ArrowRight size={14} />
                  </small>
                </button>
                <button
                  onClick={() => {
                    setFinanceTab("dues");
                    navigate("finance");
                  }}
                >
                  <span>
                    <Wallet size={17} />
                    RESIDUO DA REGISTRARE
                  </span>
                  <strong>{money(balance)}</strong>
                  <small>
                    tutti i soggiorni attivi <ArrowRight size={14} />
                  </small>
                </button>
                <button
                  onClick={() => {
                    setMonth(currentMonth);
                    navigate("calendar");
                  }}
                >
                  <span>
                    <CalendarDays size={17} />
                    NOTTI RISERVATE IN {monthLabel(currentMonth).toUpperCase()}
                  </span>
                  <strong>{occ.percentage}%</strong>
                  <small>
                    {occ.occupied} riservate, incluse richieste · {occ.blocked}{" "}
                    chiuse <ArrowRight size={14} />
                  </small>
                </button>
              </div>
              <div className="cm-overview-grid">
                <section className="cm-panel cm-priorities">
                  <div className="cm-panel-heading">
                    <div>
                      <span className="cm-kicker">LE PRIORITÀ</span>
                      <h2>Da fare oggi</h2>
                    </div>
                    <span className="cm-count-pill">
                      {pending.length +
                        arrivalsToday.length +
                        departuresToday.length}
                    </span>
                  </div>
                  <div className="cm-task-row">
                    <span className="cm-task-icon amber">
                      <CheckCircle2 size={19} />
                    </span>
                    <div>
                      <strong>
                        {pending.length
                          ? "Hai " +
                            pending.length +
                            " " +
                            (pending.length === 1
                              ? "richiesta da confermare"
                              : "richieste da confermare")
                          : "Nessuna richiesta in attesa"}
                      </strong>
                      <small>
                        Le richieste occupano le date fino alla gestione.
                      </small>
                    </div>
                    <button
                      aria-label="Vedi richieste da confermare"
                      onClick={() => {
                        setStatus("pending");
                        navigate("reservations");
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="cm-task-row">
                    <span className="cm-task-icon">
                      <ArrowDownLeft size={20} />
                    </span>
                    <div>
                      <strong>
                        {arrivalsToday.length}{" "}
                        {arrivalsToday.length === 1
                          ? "arrivo oggi"
                          : "arrivi oggi"}
                      </strong>
                      <small>
                        {arrivalsToday.map((b) => b.name).join(", ") ||
                          "La giornata è libera da nuovi arrivi."}
                      </small>
                    </div>
                    {arrivalsToday[0] && (
                      <button
                        aria-label="Apri l’arrivo di oggi"
                        onClick={() => openDetail(arrivalsToday[0])}
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                  <div className="cm-task-row">
                    <span className="cm-task-icon blue">
                      <ArrowUpRight size={20} />
                    </span>
                    <div>
                      <strong>
                        {departuresToday.length}{" "}
                        {departuresToday.length === 1
                          ? "partenza oggi"
                          : "partenze oggi"}
                      </strong>
                      <small>
                        {departuresToday.map((b) => b.name).join(", ") ||
                          "Nessuna partenza prevista oggi."}
                      </small>
                    </div>
                    {departuresToday[0] && (
                      <button
                        aria-label="Apri la partenza di oggi"
                        onClick={() => openDetail(departuresToday[0])}
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                  {refunds.length > 0 && (
                    <div className="cm-task-row">
                      <span className="cm-task-icon red">
                        <Wallet size={19} />
                      </span>
                      <div>
                        <strong>
                          {refunds.length} annullamenti con importi registrati
                        </strong>
                        <small>
                          Verifica separatamente gli eventuali rimborsi.
                        </small>
                      </div>
                      <button
                        aria-label="Vedi importi da valutare"
                        onClick={() => {
                          setFinanceTab("refunds");
                          navigate("finance");
                        }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </section>
                <section className="cm-panel cm-small-calendar">
                  <div className="cm-panel-heading">
                    <div>
                      <span className="cm-kicker">A COLPO D’OCCHIO</span>
                      <h2>{monthLabel(currentMonth)}</h2>
                    </div>
                    <button
                      className="cm-text-button"
                      onClick={() => navigate("calendar")}
                    >
                      Apri calendario <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="cm-weekdays">
                    {["L", "M", "M", "G", "V", "S", "D"].map((v, i) => (
                      <span key={i}>{v}</span>
                    ))}
                  </div>
                  <div className="cm-mini-grid">
                    {Array.from(
                      {
                        length:
                          (new Date(currentMonth + "T12:00Z").getUTCDay() + 6) %
                          7,
                      },
                      (_, i) => (
                        <span key={"x" + i} />
                      ),
                    )}
                    {dateRange(currentMonth, monthEnd(currentMonth), 31).map(
                      (d) => {
                        const b = bookings.find(
                          (b) =>
                            isActive(b) && b.checkin <= d && b.checkout > d,
                        );
                        return (
                          <button
                            key={d}
                            className={
                              (b?.status || "") + (d === today ? " today" : "")
                            }
                            onClick={() => {
                              setMonth(currentMonth);
                              setRange({ start: d, end: addDays(d, 1) });
                              navigate("calendar");
                              setRange({ start: d, end: addDays(d, 1) });
                            }}
                            aria-label={
                              day(d) + ": " + (b?.name || "disponibile")
                            }
                          >
                            {Number(d.slice(-2))}
                          </button>
                        );
                      },
                    )}
                  </div>
                  <div className="cm-calendar-legend">
                    <span className="confirmed">Prenotata</span>
                    <span className="pending">Da confermare</span>
                    <span className="blocked">Bloccata</span>
                  </div>
                </section>
                <section className="cm-panel cm-upcoming">
                  <div className="cm-panel-heading">
                    <div>
                      <span className="cm-kicker">PREPARATI AD ACCOGLIERE</span>
                      <h2>I prossimi arrivi</h2>
                    </div>
                    <button
                      className="cm-text-button"
                      onClick={() => {
                        setStatus("active");
                        setFrom("");
                        setTo("");
                        navigate("reservations");
                      }}
                    >
                      Vedi tutti <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <BookingRows
                    bookings={arrivals.slice(0, 4)}
                    data={data}
                    onOpen={openDetail}
                  />
                </section>
                <section className="cm-panel cm-recent">
                  <div className="cm-panel-heading">
                    <div>
                      <span className="cm-kicker">TRACCIABILITÀ</span>
                      <h2>Ultime attività</h2>
                    </div>
                    <History size={19} />
                  </div>
                  <div className="cm-activity-list">
                    {activity.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setDetailId(e.booking_id)}
                      >
                        <span className="cm-activity-dot" />
                        <span>
                          <b>{EVENT_NAMES[e.event] || e.event}</b>
                          <small>
                            {bookings.find((b) => b.id === e.booking_id)
                              ?.name || "Soggiorno"}{" "}
                            ·{" "}
                            {new Date(e.created).toLocaleString("it-IT", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </span>
                        <ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                  {!activity.length && (
                    <Empty title="Lo storico inizia da qui">
                      Le nuove operazioni compariranno in questa lista.
                    </Empty>
                  )}
                </section>
              </div>
            </>
          )}
          {tab === "calendar" && (
            <section className="cm-panel cm-calendar-panel">
              <div className="cm-calendar-toolbar">
                <div className="cm-month-controls">
                  <button
                    className="cm-icon-button"
                    aria-label="Mese precedente"
                    onClick={() => {
                      setMonth(moveMonth(month, -1));
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2>{monthLabel(month)}</h2>
                  <button
                    className="cm-icon-button"
                    aria-label="Mese successivo"
                    onClick={() => {
                      setMonth(moveMonth(month, 1));
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    className="cm-button cm-button-quiet"
                    onClick={() => {
                      setMonth(currentMonth);
                      setRange(null);
                    }}
                  >
                    Oggi
                  </button>
                </div>
                <div className="cm-calendar-legend">
                  <span className="confirmed">Prenotata</span>
                  <span className="pending">Da confermare</span>
                  <span className="blocked">Bloccata</span>
                </div>
              </div>
              <p className="cm-calendar-guide">
                <Info size={15} />
                {range && !range.end
                  ? "Scegli la data finale: quel giorno tornerà disponibile."
                  : "Tocca una data libera per iniziare un periodo. Tocca una prenotazione per aprirla."}
              </p>
              <div className="cm-weekdays">
                {[
                  "Lunedì",
                  "Martedì",
                  "Mercoledì",
                  "Giovedì",
                  "Venerdì",
                  "Sabato",
                  "Domenica",
                ].map((d) => (
                  <span key={d}>
                    <span className="cm-week-full">{d}</span>
                    <span className="cm-week-short">{d.slice(0, 3)}</span>
                  </span>
                ))}
              </div>
              <div className="cm-calendar-grid">
                {Array.from({ length: offset }, (_, i) => (
                  <span className="cm-calendar-blank" key={"blank" + i} />
                ))}
                {monthDays.map((d) => {
                  const b = bookings.find(
                      (x) => isActive(x) && x.checkin <= d && x.checkout > d,
                    ),
                    rule = data.settings.blockedDates.includes(d),
                    selected =
                      range &&
                      d >= range.start &&
                      d < (range.end || addDays(range.start, 1)),
                    starts = b?.checkin === d;
                  return (
                    <button
                      key={d}
                      disabled={!b && d < today}
                      className={[
                        b?.status || "",
                        rule ? "blocked" : "",
                        selected ? "selected" : "",
                        d === today ? "today" : "",
                      ].join(" ")}
                      onClick={() => {
                        if (range && !range.end) {
                          if (d <= range.start) setRange({ start: d, end: "" });
                          else if (dateRange(range.start, d, 3660).length > 365)
                            owner.setNotice(
                              "Puoi selezionare al massimo 365 notti per inserimento.",
                            );
                          else setRange({ ...range, end: d });
                        } else if (b) openDetail(b);
                        else if (rule) {
                          owner.setNotice(
                            "Questa data è chiusa nelle regole. Puoi riaprirla dalle impostazioni.",
                          );
                        } else setRange({ start: d, end: "" });
                      }}
                      aria-pressed={!!selected}
                      aria-label={`${day(d, true)}, ${b ? b.name : rule ? "bloccata" : "disponibile"}`}
                    >
                      <span className="cm-day-top">
                        <b>{Number(d.slice(-2))}</b>
                        {d === today && <i>Oggi</i>}
                      </span>
                      {b ? (
                        <span className="cm-day-booking">
                          {b.payment === "block" ? (
                            <LockKeyhole size={12} />
                          ) : starts ? (
                            <ArrowDownLeft size={12} />
                          ) : (
                            <span className="cm-day-dot" />
                          )}
                          <span>
                            {b.payment === "block" ? "Bloccata" : b.name}
                          </span>
                        </span>
                      ) : (
                        <span className="cm-day-free">
                          {rule ? "Chiusa" : "Disponibile"}
                        </span>
                      )}
                      {b && (
                        <small>
                          {b.payment === "block"
                            ? b.name
                            : starts
                              ? "Arrivo · " + b.guests + " ospiti"
                              : source(b.source)}
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
              {range && (
                <div className="cm-selection">
                  <div>
                    <span className="cm-kicker">PERIODO SELEZIONATO</span>
                    <strong>
                      {day(range.start)}{" "}
                      {range.end ? "→ " + day(range.end) : "→ scegli la fine"}
                    </strong>
                    <small>
                      {range.end
                        ? dateRange(range.start, range.end, 365).length +
                          " notti · la data finale è disponibile."
                        : "La data finale non sarà occupata."}
                    </small>
                  </div>
                  <div>
                    <button
                      className="cm-icon-button"
                      aria-label="Cancella selezione"
                      onClick={() => setRange(null)}
                    >
                      <X size={18} />
                    </button>
                    <button
                      className="cm-button cm-button-secondary"
                      disabled={!range.end || disabled}
                      onClick={() => openEditor("block")}
                    >
                      <LockKeyhole size={16} />
                      Blocca periodo
                    </button>
                    <Primary
                      disabled={!range.end || disabled}
                      onClick={() => openEditor("booking")}
                    >
                      <Plus size={17} />
                      Prenotazione
                    </Primary>
                  </div>
                </div>
              )}
              {range?.end && selectedBookings.length > 0 && (
                <p className="cm-form-error">
                  Nel periodo selezionato ci sono date occupate. Apri il
                  controllo prima di salvare o modifica il periodo.
                </p>
              )}
              <div className="cm-calendar-footer">
                <h3>
                  {range
                    ? "Nel periodo selezionato"
                    : "Soggiorni e blocchi del mese"}
                </h3>
                <BookingRows
                  bookings={
                    range
                      ? selectedBookings
                      : bookings.filter(
                          (b) =>
                            isActive(b) &&
                            b.checkin < monthEnd(month) &&
                            b.checkout > month,
                        )
                  }
                  data={data}
                  onOpen={openDetail}
                  empty="Nessuna prenotazione in questo periodo."
                />
              </div>
            </section>
          )}
          {tab === "reservations" && (
            <section className="cm-panel">
              <div className="cm-list-toolbar">
                <label className="cm-search">
                  <Search size={18} />
                  <input
                    aria-label="Cerca per ospite, email, telefono o riferimento"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cerca ospite, contatto o riferimento…"
                  />
                  {search && (
                    <button
                      aria-label="Cancella ricerca"
                      onClick={() => setSearch("")}
                    >
                      <X size={15} />
                    </button>
                  )}
                </label>
                <button
                  className="cm-button cm-button-secondary"
                  onClick={() => exportRows(currentBookings)}
                >
                  <Download size={16} />
                  Esporta filtrati
                </button>
              </div>
              <div className="cm-filter-bar">
                <label>
                  Stato
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Non annullate</option>
                    <option value="pending">Da confermare</option>
                    <option value="confirmed">Confermate</option>
                    <option value="blocked">Blocchi date</option>
                    <option value="cancelled">Annullate</option>
                    <option value="all">Tutti gli stati</option>
                  </select>
                </label>
                <label>
                  Canale
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option value="all">Tutti i canali</option>
                    <option value="direct">Sito diretto</option>
                    <option value="phone">Telefono / messaggio</option>
                    <option value="airbnb">Airbnb · manuale</option>
                    <option value="booking">Booking.com · manuale</option>
                  </select>
                </label>
                <label>
                  Dal
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      if (to && to <= e.target.value) setTo("");
                    }}
                  />
                </label>
                <label>
                  Prima del
                  <input
                    type="date"
                    value={to}
                    min={from ? addDays(from, 1) : undefined}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </label>
                <button
                  className="cm-text-button"
                  onClick={() => {
                    setSearch("");
                    setStatus("active");
                    setChannel("all");
                    setFrom("");
                    setTo("");
                  }}
                >
                  Azzera filtri
                </button>
              </div>
              <div className="cm-result-heading">
                <span>
                  {currentBookings.length}{" "}
                  {currentBookings.length === 1 ? "risultato" : "risultati"}
                </span>
                <small>
                  Il filtro date include i soggiorni che attraversano il
                  periodo.
                </small>
              </div>
              <BookingRows
                bookings={currentBookings}
                data={data}
                onOpen={openDetail}
              />
            </section>
          )}
          {tab === "finance" && (
            <>
              <div className="cm-metrics cm-finance-metrics">
                <div>
                  <span>VALORE DEI SOGGIORNI ATTIVI</span>
                  <strong>
                    {money(stays.reduce((sum, b) => sum + b.total, 0))}
                  </strong>
                  <small>esclusi blocchi e annullamenti</small>
                </div>
                <div>
                  <span>IMPORTI NETTI REGISTRATI</span>
                  <strong>{money(paid)}</strong>
                  <small>annotazioni e Stripe test verificato</small>
                </div>
                <div>
                  <span>RESIDUO DA REGISTRARE</span>
                  <strong>{money(balance)}</strong>
                  <small>tutti i soggiorni attivi</small>
                </div>
                <div>
                  <span>ANNULLAMENTI DA VALUTARE</span>
                  <strong>
                    {money(
                      refunds.reduce(
                        (sum, b) => sum + moneyState(b, payments).refundReview,
                        0,
                      ),
                    )}
                  </strong>
                  <small>non sono rimborsi automatici</small>
                </div>
              </div>
              <section className="cm-panel">
                <div className="cm-panel-heading">
                  <div>
                    <span className="cm-kicker">CONTROLLO ECONOMICO</span>
                    <h2>Ogni importo al suo posto.</h2>
                  </div>
                  <button
                    className="cm-button cm-button-secondary"
                    onClick={() =>
                      exportRows(bookings.filter((b) => b.payment !== "block"))
                    }
                  >
                    <Download size={16} />
                    Esporta riepilogo
                  </button>
                </div>
                <div
                  className="cm-tabs"
                  role="tablist"
                  aria-label="Riepiloghi economici"
                >
                  {[
                    ["dues", "Saldi residui"],
                    ["movements", "Movimenti annotati"],
                    ["refunds", "Annullamenti da valutare"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      className={financeTab === id ? "active" : ""}
                      aria-selected={financeTab === id}
                      role="tab"
                      onClick={() => setFinanceTab(id)}
                    >
                      {label}
                      {id === "refunds" && refunds.length > 0 && (
                        <i>{refunds.length}</i>
                      )}
                    </button>
                  ))}
                </div>
                {financeTab === "dues" && (
                  <BookingRows
                    bookings={stays.filter(
                      (b) => moneyState(b, payments).balance > 0,
                    )}
                    data={data}
                    onOpen={openDetail}
                    empty="Nessun saldo residuo."
                  />
                )}
                {financeTab === "refunds" && (
                  <BookingRows
                    bookings={refunds}
                    data={data}
                    onOpen={openDetail}
                    empty="Nessun annullamento con importi da valutare."
                  />
                )}
                {financeTab === "movements" && (
                  <>
                    {payments.map((p) => {
                      const b = bookings.find((b) => b.id === p.booking_id);
                      return (
                        <button
                          className="cm-movement cm-movement-button"
                          key={p.id}
                          onClick={() => b && openDetail(b)}
                        >
                          {p.kind === "receipt" ? (
                            <ArrowDownLeft size={19} />
                          ) : (
                            <ArrowUpRight size={19} />
                          )}
                          <span>
                            <b>{b?.name || "Soggiorno"}</b>
                            <small>
                              {p.kind === "receipt" ? "Incasso" : "Rimborso"} ·{" "}
                              {METHODS[p.method]} ·{" "}
                              {new Date(p.created).toLocaleDateString("it-IT")}
                            </small>
                          </span>
                          <strong>
                            {p.kind === "refund" ? "−" : ""}
                            {money(p.amount)}
                          </strong>
                          <ChevronRight size={15} />
                        </button>
                      );
                    })}
                    {!payments.length && (
                      <Empty title="Nessun movimento manuale">
                        Gli incassi e i rimborsi che annoti compariranno qui.
                        Stripe test rimane visibile nel dettaglio del soggiorno.
                      </Empty>
                    )}
                  </>
                )}
                <div className="cm-info-box">
                  <Info size={17} />
                  <p>
                    Registrare un incasso significa annotare denaro già
                    ricevuto. L’app non addebita carte e non esegue bonifici.
                    Questi riepiloghi non sono documenti fiscali.
                  </p>
                </div>
              </section>
            </>
          )}
          {tab === "settings" && (
            <SettingsPanel
              data={data}
              busy={disabled}
              onSave={owner.settings}
              onReset={owner.reset}
              demo={demo}
              onInstall={() => setInstall(true)}
            />
          )}
          <footer className="cm-page-footer">
            <span>
              {demo
                ? "Salvataggi dimostrativi su questo dispositivo."
                : owner.syncedAt
                  ? "Ultimo aggiornamento: " +
                    new Date(owner.syncedAt).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Calendario condiviso."}
            </span>
            <a
              href="/demos/dimora-mia/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apri il sito <ArrowUpRight size={13} />
            </a>
            <span>CASA MIA · Gestione della casa</span>
          </footer>
        </main>
      </div>
      <nav className="cm-bottom-nav" aria-label="Gestione da telefono">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={tab === item.id ? "active" : ""}
            aria-current={tab === item.id ? "page" : undefined}
          >
            <item.icon size={21} />
            <span>
              {item.id === "overview"
                ? "Oggi"
                : item.id === "finance"
                  ? "Incassi"
                  : item.id === "settings"
                    ? "Regole"
                    : item.label}
            </span>
            {item.id === "reservations" && pending.length > 0 && (
              <i>{pending.length}</i>
            )}
          </button>
        ))}
      </nav>
      {owner.notice && (
        <div className="cm-toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} />
          <span>{owner.notice}</span>
          <button
            aria-label="Chiudi avviso"
            onClick={() => owner.setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {editor && (
        <ReservationEditor
          key={editor.booking?.id || "new-" + editor.kind}
          draft={editor}
          onClose={() => setEditor(null)}
          onPreview={owner.preview}
          onSave={owner.save}
          demo={demo}
        />
      )}
      {detail && (
        <BookingDetail
          key={detail.id}
          booking={detail}
          data={data}
          onClose={() => setDetailId("")}
          onEdit={() =>
            openEditor(detail.payment === "block" ? "block" : "booking", detail)
          }
          onPayment={(kind) => {
            setDetailId("");
            setPayment({ id: detail.id, kind });
          }}
          onAction={owner.action}
          busy={owner.busy}
          disabled={disabled}
        />
      )}
      {payment && payBooking && (
        <PaymentEditor
          key={payment.id + payment.kind}
          booking={payBooking}
          payments={payments}
          kind={payment.kind}
          demo={demo}
          onClose={() => setPayment(null)}
          onSave={owner.payment}
        />
      )}
      {install && <InstallHelp onClose={() => setInstall(false)} />}
    </div>
  );
}
