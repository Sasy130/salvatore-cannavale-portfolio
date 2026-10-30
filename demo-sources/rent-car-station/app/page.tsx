import Link from "@/components/static-link";
import {
  ArrowUpRight,
  ArrowRight,
  MoveDown,
  MapPin,
  TrainFront,
  CarFront,
  Bike,
  Luggage,
  Compass,
  Check,
  Plus,
} from "lucide-react";
import { Reveal, ContactBlock, FAQ } from "@/components/layout";
import { JourneySearch } from "@/components/search";
import { VehicleCard } from "@/components/catalog";
import { vehicles, faqs } from "@/lib/content";
export default function Home() {
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-copy">
          <Reveal>
            <span className="eyebrow hero-eyebrow">
              <span className="tiny-line" /> NOLEGGIO AUTO & SCOOTER A NAPOLI
            </span>
            <h1>
              Scendi
              <br />
              dal treno.
              <br />
              <span className="serif">Sali a bordo.</span>
            </h1>
            <p>
              Dalla Stazione Centrale alla tua prossima storia.
              <br />
              Auto, scooter e un mondo da scoprire.
            </p>
            <Link href="/flotta/" className="button dark">
              Il tuo viaggio comincia qui <ArrowUpRight size={19} />
            </Link>
            <div className="hero-location">
              <TrainFront size={20} />
              <span>
                NAPOLI CENTRALE
                <br />
                <strong>Il punto di partenza sei tu.</strong>
              </span>
            </div>
          </Reveal>
        </div>
        <div className="hero-visual">
          <img
            src="/demos/rent-car-station/images/road.webp"
            srcSet="/demos/rent-car-station/images/road-mobile.webp 900w, /demos/rent-car-station/images/road.webp 1800w"
            sizes="(max-width:760px) 100vw, 56vw"
            width="1800"
            height="1200"
            alt="Una strada della Costiera Amalfitana vista dall’alto, fotografia illustrativa"
            fetchPriority="high"
          />
          <div className="hero-image-overlay" />
          <div className="hero-photo-top">
            <span>40°51′ N — 14°16′ E</span>
            <span>CAMPANIA, ITALIA</span>
          </div>
          <span className="hero-stamp" aria-hidden="true">
            NAPOLI
            <br />
            <span>SI PARTE.</span>
            <ArrowUpRight size={54} />
          </span>
          <div className="hero-ticket">
            <MapPin size={18} />
            <div>
              <span>PROSSIMA FERMATA</span>
              <strong>Dove vuoi tu.</strong>
            </div>
            <span className="ticket-dots" />
            <ArrowUpRight size={27} />
          </div>
          <span className="hero-image-note">
            FOTOGRAFIA DI ATMOSFERA · NON RAPPRESENTA UN TOUR PRENOTATO
          </span>
        </div>
      </section>
      <section className="proposal-overview" aria-labelledby="proposal-overview-title"><div><span className="eyebrow">UNA PROPOSTA PER RENT CAR STATION</span><h2 id="proposal-overview-title">Più chiarezza.<br/><span className="serif">Da ogni schermo.</span></h2><p>Un percorso pensato per aiutare chi arriva a Napoli a trovare subito auto, scooter, deposito bagagli e servizi per il viaggio.</p><Link href="/progetto/" className="proposal-overview-link">Scopri la proposta di redesign <ArrowUpRight size={17}/></Link></div><ol><li><strong>01 / ORIENTARSI</strong><span>Servizi riconoscibili fin dal primo sguardo.</span></li><li><strong>02 / SCEGLIERE</strong><span>Categorie e informazioni facili da esplorare.</span></li><li><strong>03 / CONTATTARE</strong><span>Una richiesta dimostrativa, chiara anche da telefono.</span></li></ol><p className="proposal-overview-note">Proposta indipendente non ufficiale. Nessuna prenotazione viene inviata o confermata.</p></section>
      <section className="search-section">
        <JourneySearch />
      </section>
      <section className="possibilities section" id="servizi">
        <div className="section-header">
          <span className="eyebrow">UNA CITTÀ. QUATTRO MODI DI VIVERLA.</span>
          <span className="subtle-caption">TU PORTA LA VOGLIA DI PARTIRE.</span>
        </div>
        <div className="service-links">
          {[
            {
              n: "01",
              icon: CarFront,
              title: "Sali in auto",
              text: "La città e tutto quello che c’è oltre.",
              href: "/flotta/?tipo=Auto",
            },
            {
              n: "02",
              icon: Bike,
              title: "Scegli due ruote",
              text: "Un’altra prospettiva su Napoli.",
              href: "/flotta/?tipo=Scooter",
            },
            {
              n: "03",
              icon: Luggage,
              title: "Viaggia leggero",
              text: "Lascia i bagagli, riprendi la giornata.",
              href: "/servizi/bagagli/",
            },
            {
              n: "04",
              icon: Compass,
              title: "Segui la curiosità",
              text: "Napoli, Pompei e la Costiera.",
              href: "/servizi/tour/",
            },
          ].map((s) => (
            <Link href={s.href} className="service-link" key={s.n}>
              <div className="service-link-top">
                <s.icon size={27} />
                <span>{s.n}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <ArrowUpRight className="service-arrow" size={20} />
            </Link>
          ))}
        </div>
      </section>
      <section className="fleet-home section">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow orange-text">IL TUO MODO DI MUOVERTI</span>
            <h2>
              Una scelta semplice.
              <br />
              Un viaggio <span className="serif">tutto tuo.</span>
            </h2>
          </div>
          <div>
            <p>
              Quattro ruote o due. Comincia dalla categoria,
              <br />
              ai dettagli ci pensi insieme al team.
            </p>
            <Link className="text-link" href="/flotta/">
              Esplora auto & scooter <ArrowUpRight size={17} />
            </Link>
          </div>
        </Reveal>
        <div className="vehicle-grid">
          {vehicles.map((v) => (
            <Reveal key={v.slug}>
              <VehicleCard vehicle={v} />
            </Reveal>
          ))}
        </div>
        <p className="fine-print">
          Modelli di riferimento presenti sul sito ufficiale. Foto stock
          illustrative, non dei mezzi effettivamente disponibili. Nessuna
          tariffa o disponibilità simulata.
        </p>
      </section>
      <section className="freedom-section">
        <div className="freedom-image">
          <img
            src="/demos/rent-car-station/images/vespa.webp"
            alt="Dettaglio di una Vespa arancione, foto illustrativa"
            width="1200"
            height="1800"
            loading="lazy"
          />
          <span className="image-label">DUE RUOTE, UN’ALTRA PROSPETTIVA</span>
        </div>
        <Reveal className="freedom-copy">
          <span className="eyebrow">MENO PENSIERI. PIÙ NAPOLI.</span>
          <h2>
            La libertà
            <br />
            non ha bisogno
            <br />
            di <span className="serif">molto.</span>
          </h2>
          <p>
            Un punto di partenza vicino alla stazione. Il mezzo da concordare. E
            la curiosità di vedere cosa c’è dopo la prossima curva.
          </p>
          <ul>
            <li>
              <Check size={16} /> Auto e scooter, in base al tuo percorso
            </li>
            <li>
              <Check size={16} /> Un contatto diretto con l’attività
            </li>
            <li>
              <Check size={16} /> Condizioni chiare prima di partire
            </li>
          </ul>
          <Link href="/richiesta/" className="button cream">
            Organizza la tua partenza <ArrowUpRight size={18} />
          </Link>
          <span className="freedom-footnote">
            PROVA IL PERCORSO DIMOSTRATIVO, SENZA IMPEGNO.
          </span>
        </Reveal>
      </section>
      <section className="experiences section">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow orange-text">ALLARGA L’ORIZZONTE</span>
            <h2>
              Non solo spostarsi.
              <br />
              <span className="serif">Sentirsi altrove.</span>
            </h2>
          </div>
          <Link href="/servizi/tour/" className="text-link">
            Scopri le esperienze <ArrowUpRight size={18} />
          </Link>
        </Reveal>
        <div className="experience-grid">
          <Link className="destination destination-large" href="/servizi/tour/">
            <img
              src="/demos/rent-car-station/images/amalfi.webp"
              alt="Positano in Costiera Amalfitana, immagine illustrativa"
              width="1200"
              height="1500"
              loading="lazy"
            />
            <div className="destination-overlay" />
            <span className="destination-index">01 / OLTRE NAPOLI</span>
            <span className="destination-arrow">
              <ArrowUpRight size={23} />
            </span>
            <div className="destination-copy">
              <span className="eyebrow">COSTIERA AMALFITANA</span>
              <h3>
                Le curve più belle
                <br />
                portano al mare.
              </h3>
              <p>Scopri le proposte dell’attività per la Costiera.</p>
            </div>
          </Link>
          <div className="destination-stack">
            <Link
              className="destination napoli-destination"
              href="/servizi/tour/"
            >
              <img
                src="/demos/rent-car-station/images/napoli.webp"
                alt="Scorcio di Napoli, fotografia illustrativa"
                width="1200"
                height="1800"
                loading="lazy"
              />
              <div className="destination-overlay" />
              <span className="destination-index">02 / DENTRO LA CITTÀ</span>
              <span className="destination-arrow">
                <ArrowUpRight size={23} />
              </span>
              <div className="destination-copy">
                <span className="eyebrow">NAPOLI</span>
                <h3>
                  Una città.
                  <br />
                  Mille prime volte.
                </h3>
              </div>
            </Link>
            <Link className="pompei-card" href="/servizi/tour/">
              <span className="eyebrow">03 / UN VIAGGIO NEL TEMPO</span>
              <div>
                <h3>
                  Prossima tappa:
                  <br />
                  <span className="serif">Pompei.</span>
                </h3>
                <ArrowUpRight size={31} />
              </div>
            </Link>
          </div>
        </div>
        <p className="fine-print">
          Destinazioni presentate sul sito ufficiale. Itinerari, modalità,
          requisiti e prezzi sono da verificare con il team.
        </p>
      </section>
      <section className="luggage-section section">
        <Reveal>
          <span className="eyebrow orange-text">
            DEPOSITO BAGAGLI / NAPOLI CENTRALE
          </span>
          <h2>
            Ultimo giorno?
            <br />
            <span className="serif">Non ancora.</span>
          </h2>
          <p>
            Il check-out è fatto, il treno parte più tardi.
            <br />
            Lascia i bagagli in zona stazione e goditi ancora Napoli.
          </p>
          <Link href="/servizi/bagagli/" className="button dark">
            Scopri il deposito bagagli <ArrowUpRight size={18} />
          </Link>
        </Reveal>
        <div className="luggage-visual">
          <Luggage className="large-luggage" strokeWidth={0.8} />
          <span className="luggage-tag">
            NAP<span>STILL EXPLORING.</span>
          </span>
          <div className="luggage-small-tag">
            <span>DESTINAZIONE</span>
            <strong>Ancora un giro.</strong>
            <ArrowUpRight size={23} />
          </div>
        </div>
      </section>
      <section className="how-section section">
        <div className="section-heading">
          <div>
            <span className="eyebrow orange-text">
              LA PARTE SEMPLICE DEL VIAGGIO
            </span>
            <h2>
              Si parte.
              <br />
              <span className="serif">Un passo alla volta.</span>
            </h2>
          </div>
          <Link href="/richiesta/" className="text-link">
            Prova la richiesta demo <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="steps">
          {[
            {
              n: "01",
              title: "Scegli come partire.",
              text: "Auto, scooter, bagagli o tour. Un percorso diverso per ogni esigenza.",
            },
            {
              n: "02",
              title: "Metti in fila i dettagli.",
              text: "Seleziona date e preferenze. Nel concept ottieni un riepilogo, senza invii.",
            },
            {
              n: "03",
              title: "Parla con chi ti aspetta.",
              text: "Concorda disponibilità, preventivo e condizioni sui canali ufficiali.",
            },
          ].map((s) => (
            <Reveal key={s.n}>
              <span className="step-number">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="faq-section section">
        <div>
          <span className="eyebrow orange-text">PRIMA DI METTERTI IN MOTO</span>
          <h2>
            Buone domande.
            <br />
            <span className="serif">Partenze migliori.</span>
          </h2>
          <p>Le cose utili da sapere prima del viaggio.</p>
        </div>
        <FAQ items={faqs} />
      </section>
      <ContactBlock />
    </main>
  );
}
