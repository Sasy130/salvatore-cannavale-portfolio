import type { Metadata } from "next";
import Link from "@/components/static-link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { PageIntro } from "@/components/layout";
export const metadata: Metadata = { title: "La proposta di redesign" };
const changes = [
  {
    n: "01",
    title: "Dalla quantità alla direzione.",
    before:
      "Nella homepage analizzata convivono un modulo con dati personali, flotta, tour e deposito bagagli.",
    after:
      "Quattro accessi distinti. Prima scegli il servizio, poi i dettagli utili al tuo viaggio.",
  },
  {
    n: "02",
    title: "Le informazioni, al posto giusto.",
    before:
      "Nelle pagine auto e scooter sono presenti alcuni testi provvisori; condizioni e riferimenti non sono sempre uniformi tra le pagine.",
    after:
      "Testi dedicati, categorie riconoscibili e informazioni contrattuali da confermare con il titolare.",
  },
  {
    n: "03",
    title: "Una richiesta più comprensibile.",
    before:
      "Il modulo iniziale raccoglie nome, cognome, prefisso, telefono, email e altri dettagli insieme alle date.",
    after:
      "Il concept comincia da servizio, preferenze e periodo. Un riepilogo modificabile spiega chiaramente che nessun dato viene inviato.",
  },
];
export default function Project() {
  return (
    <main id="main">
      <PageIntro
        eyebrow="DESIGN CASE STUDY / PROGETTO INDIPENDENTE"
        title={
          <>
            Un nuovo punto
            <br />
            <span className="serif">di partenza.</span>
          </>
        }
        text="Un’esplorazione di identità, contenuti ed esperienza digitale per Rent Car Station, Napoli."
      />
      <section className="section project-section">
        <div className="project-disclaimer">
          <strong>Concept dimostrativo non ufficiale.</strong>
          <p>
            Progetto non commissionato, approvato o affiliato all’attività. Non
            rappresenta un cliente acquisito né un sito ufficiale. Nessun
            risultato commerciale viene dichiarato.
          </p>
        </div>
        <div className="project-intro">
          <div>
            <span className="eyebrow orange-text">L’IDEA</span>
            <h2>
              Prima di noleggiare,
              <br />
              bisogna <span className="serif">orientarsi.</span>
            </h2>
          </div>
          <p>
            Chi arriva in stazione può avere esigenze diverse: partire in auto,
            muoversi in scooter, lasciare una valigia o esplorare una
            destinazione. La proposta dà a ogni esigenza un ingresso chiaro e un
            percorso dedicato.
          </p>
        </div>
        <div className="project-changes">
          {changes.map((c) => (
            <article key={c.n}>
              <span className="eyebrow orange-text">
                {c.n} / SCELTA PROGETTUALE
              </span>
              <h3>{c.title}</h3>
              <div>
                <section>
                  <span className="eyebrow">OSSERVAZIONE SUL SITO ATTUALE</span>
                  <p>{c.before}</p>
                </section>
                <ArrowRight size={22} />
                <section>
                  <span className="eyebrow orange-text">
                    PROPOSTA NEL CONCEPT
                  </span>
                  <p>{c.after}</p>
                </section>
              </div>
            </article>
          ))}
        </div>
        <div className="project-end">
          <h2>
            Un’identità riconoscibile.
            <br />
            <span className="serif">Una prospettiva nuova.</span>
          </h2>
          <p>
            L’arancione del marchio incontra avorio e blu scuro. Un logotipo
            reinterpretato, fotografia mediterranea, tipografia editoriale e
            componenti responsive accompagnano il percorso. Immagini stock con
            licenze indicate nei sorgenti; nessuno screenshot del sito originale
            è ripubblicato qui.
          </p>
          <Link href="/" className="button orange">
            Esplora il concept <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="project-sources">
          <span className="eyebrow">FONTI / CONSULTATE IL 26 OTTOBRE 2026</span>
          <a href="https://rentcarstation.it/" target="_blank" rel="noreferrer">
            Homepage ufficiale <ArrowUpRight size={14} />
          </a>
          <a
            href="https://rentcarstation.it/noleggio-scooter/"
            target="_blank"
            rel="noreferrer"
          >
            Noleggio scooter <ArrowUpRight size={14} />
          </a>
          <a
            href="https://rentcarstation.it/noleggio-auto/"
            target="_blank"
            rel="noreferrer"
          >
            Noleggio auto <ArrowUpRight size={14} />
          </a>
          <p>
            Analisi qualitativa di contenuti e percorsi. Nessuna misurazione di
            conversioni e nessuna certificazione WCAG. Prima del lancio
            ufficiale servono approvazione del titolare, verifica dei contenuti
            e integrazione con i sistemi reali.
          </p>
        </div>
      </section>
    </main>
  );
}
