import type { Metadata } from "next";
import Link from "@/components/static-link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, ArrowLeft } from "lucide-react";
import { services } from "@/lib/content";
import { ContactBlock, FAQ } from "@/components/layout";
export function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug === "bagagli" ? "Deposito bagagli" : "Tour ed esperienze",
  };
}
export default async function Service({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = services[slug as keyof typeof services];
  if (!s) notFound();
  return (
    <main id="main">
      <section className="section service-detail">
        <Link href="/#servizi" className="text-link back">
          <ArrowLeft size={16} /> Tutti i servizi
        </Link>
        <div className="service-detail-grid">
          <div>
            <span className="eyebrow orange-text">{s.eyebrow}</span>
            <h1>
              {s.title.split("\n")[0]}
              <br />
              <span className="serif">{s.title.split("\n")[1]}</span>
            </h1>
            <p className="service-lead">{s.lead}</p>
            <p>{s.text}</p>
            <ul>
              {s.points.map((p) => (
                <li key={p}>
                  <Check size={17} />
                  {p}
                </li>
              ))}
            </ul>
            <Link
              className="button orange"
              href={"/richiesta/?servizio=" + s.request}
            >
              Prova la richiesta demo <ArrowUpRight size={18} />
            </Link>
            <a
              className="source-link"
              href={s.source}
              target="_blank"
              rel="noreferrer"
            >
              Consulta il sito ufficiale <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="service-detail-image">
            <img src={s.image} alt={s.alt} width="1400" height="1200" />
            <span className="image-label">FOTOGRAFIA ILLUSTRATIVA</span>
          </div>
        </div>
      </section>
      {slug === "tour" && (
        <section className="section tour-options">
          <span className="eyebrow orange-text">
            TRE DIREZIONI, UNA SOLA CURIOSITÀ
          </span>
          <div>
            {[
              {
                n: "01",
                name: "Napoli",
                text: "Il carattere della città, tra vicoli e lungomare.",
              },
              {
                n: "02",
                name: "Pompei",
                text: "Un incontro con la storia, da organizzare con il team.",
              },
              {
                n: "03",
                name: "Costiera Amalfitana",
                text: "Borghi, curve e mare: scopri la proposta dell’attività.",
              },
            ].map((t) => (
              <Link key={t.n} href="/richiesta/?servizio=tour">
                <span>{t.n}</span>
                <h3>{t.name}</h3>
                <p>{t.text}</p>
                <ArrowUpRight size={22} />
              </Link>
            ))}
          </div>
          <p className="fine-print">
            Nessun itinerario, accompagnatore, ingresso o mezzo è incluso o
            garantito da questa demo. Richiedi informazioni effettive
            all’attività.
          </p>
        </section>
      )}
      <section className="section service-questions">
        <div>
          <span className="eyebrow orange-text">INFORMAZIONI UTILI</span>
          <h2>
            Prima i dettagli.
            <br />
            <span className="serif">Poi si parte.</span>
          </h2>
        </div>
        <FAQ
          items={
            slug === "bagagli"
              ? [
                  {
                    q: "Come concordo consegna e ritiro?",
                    a: "Contatta il team per gli orari effettivi di apertura, il luogo di consegna e l’orario di ritiro. Le date del modulo sono solo una simulazione.",
                  },
                  {
                    q: "Quanto costa e quali bagagli sono ammessi?",
                    a: "Il sito ufficiale presenta il deposito bagagli, ma il concept non applica tariffe. Chiedi una conferma aggiornata per quantità, dimensioni, durata e condizioni di custodia.",
                  },
                ]
              : [
                  {
                    q: "Il tour include una guida o un conducente?",
                    a: "Il concept presenta le destinazioni citate sul sito ufficiale. Accompagnamento, mezzo, conducente, ingressi, pasti e coperture devono essere concordati con il team.",
                  },
                  {
                    q: "Posso prenotare qui un tour?",
                    a: "No. Il modulo genera solo un riepilogo dimostrativo nel browser. Per una richiesta reale usa i contatti ufficiali dell’attività.",
                  },
                ]
          }
        />
      </section>
      <ContactBlock />
    </main>
  );
}
